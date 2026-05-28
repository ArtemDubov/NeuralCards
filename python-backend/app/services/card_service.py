from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.card_set import CardSet
from app.models.card import Card
from app.models.user import User
from app.models.tag import Tag, card_set_tags


def _get_or_create_tag(db: Session, name: str) -> Tag:
    """Получить или создать тег."""
    tag = db.query(Tag).filter(Tag.name == name).first()
    if not tag:
        tag = Tag(name=name)
        db.add(tag)
        db.commit()
        db.refresh(tag)
    return tag


def _update_card_set_tags(db: Session, card_set: CardSet, tag_names: list[str]):
    """Обновить теги набора."""
    if tag_names is None:
        return

    # Получаем или создаём теги
    tags = [_get_or_create_tag(db, name) for name in tag_names if name.strip()]

    # Заменяем связь
    card_set.tags = tags
    db.commit()
    db.refresh(card_set)


# ===== CardSet Service =====

def create_card_set(
    db: Session,
    title: str,
    description: str | None,
    is_public: bool,
    author_id: int,
    tag_names: list[str] | None = None
) -> CardSet:
    """Создание набора карточек."""
    card_set = CardSet(
        title=title,
        description=description,
        is_public=is_public,
        author_id=author_id
    )
    db.add(card_set)
    db.commit()
    db.refresh(card_set)

    # Добавляем теги
    if tag_names:
        _update_card_set_tags(db, card_set, tag_names)
        db.refresh(card_set)

    return card_set


def get_card_sets(db: Session, user_id: int, include_public: bool = True) -> list[CardSet]:
    """Получение наборов карточек (мои + публичные)."""
    if include_public:
        sets = db.query(CardSet).filter(
            (CardSet.author_id == user_id) | (CardSet.is_public == True)
        ).all()
    else:
        sets = db.query(CardSet).filter(CardSet.author_id == user_id).all()
    return sets


def get_card_set(db: Session, card_set_id: int, user_id: int) -> CardSet:
    """Получение набора по ID."""
    card_set = db.query(CardSet).filter(CardSet.id == card_set_id).first()
    if not card_set:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Набор не найден"
        )
    return card_set


def update_card_set(
    db: Session,
    card_set_id: int,
    title: str | None,
    description: str | None,
    is_public: bool | None,
    user_id: int,
    tag_names: list[str] | None = None,
) -> CardSet:
    """Обновление набора."""
    card_set = get_card_set(db, card_set_id, user_id)

    # Проверяем права доступа
    if card_set.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав на редактирование этого набора"
        )

    if title is not None:
        card_set.title = title
    if description is not None:
        card_set.description = description
    if is_public is not None:
        card_set.is_public = is_public

    # Обновляем теги
    if tag_names is not None:
        _update_card_set_tags(db, card_set, tag_names)

    db.commit()
    db.refresh(card_set)
    return card_set


def delete_card_set(db: Session, card_set_id: int, user_id: int) -> bool:
    """
    Удаление набора.
    Статистика тренировок (training_sessions) СОХРАНЯЕТСЯ — card_set_id обнуляется.
    """
    card_set = get_card_set(db, card_set_id, user_id)

    # Проверяем права доступа
    if card_set.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав на удаление этого набора"
        )

    # Сохраняем статистику тренировок: обнуляем card_set_id
    from app.models.training_session import TrainingSession
    db.query(TrainingSession).filter(
        TrainingSession.card_set_id == card_set_id
    ).update({"card_set_id": None}, synchronize_session=False)

    # Удаляем статистику использования набора (привязана к конкретному набору)
    from app.models.card_set_usage_stats import CardSetUsageStats
    db.query(CardSetUsageStats).filter(
        CardSetUsageStats.card_set_id == card_set_id
    ).delete(synchronize_session=False)

    # Удаляем набор
    db.delete(card_set)
    db.commit()
    return True


# ===== Card Service =====

def create_card(
    db: Session,
    card_set_id: int,
    front: str,
    back: str,
    user_id: int,
    # Языки сторон
    front_lang: str = "ru",
    back_lang: str = "ru",
    # Позиция (если None — добавляется в конец)
    position: int | None = None,
    # Медиа для лицевой стороны
    front_image: str | None = None,
    front_audio: str | None = None,
    front_video: str | None = None,
    # Медиа для обратной стороны
    back_image: str | None = None,
    back_audio: str | None = None,
    back_video: str | None = None,
    # Настройки воспроизведения
    auto_play_enabled: bool = False,
    play_front: bool = True,
    play_back: bool = True,
) -> Card:
    """Создание карточки."""
    card_set = get_card_set(db, card_set_id, user_id)

    # Проверяем права доступа
    if card_set.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав на добавление карточек в этот набор"
        )

    # Определяем позицию и сдвигаем последующие карточки
    # Используем блокировку для предотвращения race condition
    
    all_cards = db.query(Card).filter(
        Card.card_set_id == card_set_id
    ).with_for_update().order_by(Card.position).all()

    has_zero_positions = any(c.position == 0 for c in all_cards)
    if has_zero_positions:
        for new_pos, card in enumerate(all_cards, start=1):
            card.position = new_pos
        db.flush()
        # Перечитаем максимум после нормализации
        all_cards = db.query(Card).filter(
            Card.card_set_id == card_set_id
        ).with_for_update().order_by(Card.position).all()

    if position is None:
        # Добавляем в конец
        max_pos = all_cards[-1].position if all_cards else 0
        position = max_pos + 1
    else:
        # Сдвигаем все карточки с position >= position на +1
        db.query(Card).filter(
            Card.card_set_id == card_set_id,
            Card.position >= position
        ).update(
            {Card.position: Card.position + 1},
            synchronize_session=False
        )
        db.flush()

    card = Card(
        card_set_id=card_set_id,
        front=front,
        back=back,
        position=position,
        # Языки
        front_lang=front_lang,
        back_lang=back_lang,
        # Медиа
        front_image=front_image,
        front_audio=front_audio,
        front_video=front_video,
        back_image=back_image,
        back_audio=back_audio,
        back_video=back_video,
        # Настройки воспроизведения
        auto_play_enabled=auto_play_enabled,
        play_front=play_front,
        play_back=play_back,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def get_cards(db: Session, card_set_id: int, user_id: int) -> list[Card]:
    """Получение всех карточек набора, отсортированных по position."""
    card_set = get_card_set(db, card_set_id, user_id)
    cards = db.query(Card).filter(
        Card.card_set_id == card_set_id
    ).order_by(Card.position.asc()).all()
    return cards


def copy_card_set(db: Session, card_set_id: int, user_id: int, new_title: str = None, is_public: bool = None) -> CardSet:
    """
    Копировать набор (свой или чужой) пользователю.
    Создаётся новый набор с тем же контентом, но с новым author_id.
    Теги НЕ копируются (они привязаны к оригиналу).
    
    Args:
        db: Сессия базы данных
        card_set_id: ID исходного набора
        user_id: ID пользователя
        new_title: Новое название для копии (опционально)
        is_public: Публичность копии (опционально, по умолчанию True)
    """
    # Получаем оригинальный набор
    original_set = db.query(CardSet).filter(CardSet.id == card_set_id).first()
    if not original_set:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Набор не найден")

    # Проверяем доступ к набору
    if not original_set.is_public and original_set.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет доступа к этому набору"
        )

    # Создаём копию набора
    new_set = CardSet(
        title=new_title if new_title else f"{original_set.title} (копия)",
        description=original_set.description,
        is_public=is_public if is_public is not None else True,  # По умолчанию публичная
        author_id=user_id,
    )
    db.add(new_set)
    db.flush()  # Получаем ID нового набора

    # Копируем карточки
    original_cards = db.query(Card).filter(
        Card.card_set_id == card_set_id
    ).order_by(Card.position.asc()).all()

    for card in original_cards:
        new_card = Card(
            card_set_id=new_set.id,
            position=card.position,
            front=card.front,
            back=card.back,
            front_lang=card.front_lang,
            back_lang=card.back_lang,
            front_image=card.front_image,
            front_audio=card.front_audio,
            front_video=card.front_video,
            back_image=card.back_image,
            back_audio=card.back_audio,
            back_video=card.back_video,
            auto_play_enabled=card.auto_play_enabled,
            play_front=card.play_front,
            play_back=card.play_back,
        )
        db.add(new_card)

    db.commit()
    db.refresh(new_set)
    return new_set


def reorder_cards(db: Session, card_set_id: int, user_id: int, card_ids: list[int]) -> bool:
    """
    Переупорядочить карточки в наборе.
    card_ids — новый порядок ID карточек (индекс = новая position).
    """
    # Проверяем права
    get_card_set(db, card_set_id, user_id)

    # Обновляем position для каждой карточки в одной транзакции
    for position, card_id in enumerate(card_ids, start=1):
        db.query(Card).filter(
            Card.id == card_id,
            Card.card_set_id == card_set_id
        ).update({"position": position})

    db.commit()
    return True


def update_card(
    db: Session,
    card_id: int,
    front: str | None = None,
    back: str | None = None,
    user_id: int = None,
    # Языки сторон
    front_lang: str | None = None,
    back_lang: str | None = None,
    # Медиа
    front_image: str | None = None,
    front_audio: str | None = None,
    front_video: str | None = None,
    back_image: str | None = None,
    back_audio: str | None = None,
    back_video: str | None = None,
    # Настройки воспроизведения
    auto_play_enabled: bool | None = None,
    play_front: bool | None = None,
    play_back: bool | None = None,
) -> Card:
    """Обновление карточки."""
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Карточка не найдена"
        )

    # Проверяем права доступа (через набор)
    if user_id:
        card_set = get_card_set(db, card.card_set_id, user_id)
        if card_set.author_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Нет прав на редактирование этой карточки"
            )

    # Всегда обновляем все поля (фронтенд отправляет актуальные значения)
    if front is not None:
        card.front = front
    if back is not None:
        card.back = back
    # Языки
    if front_lang is not None:
        card.front_lang = front_lang
    if back_lang is not None:
        card.back_lang = back_lang
    # Медиа (None = удалить, строка = установить)
    if front_image is not None:
        card.front_image = front_image
    if front_audio is not None:
        card.front_audio = front_audio
    if front_video is not None:
        card.front_video = front_video
    if back_image is not None:
        card.back_image = back_image
    if back_audio is not None:
        card.back_audio = back_audio
    if back_video is not None:
        card.back_video = back_video
    # Настройки воспроизведения
    if auto_play_enabled is not None:
        card.auto_play_enabled = auto_play_enabled
    if play_front is not None:
        card.play_front = play_front
    if play_back is not None:
        card.play_back = play_back

    db.commit()
    db.refresh(card)
    return card


def delete_card(db: Session, card_id: int, user_id: int) -> bool:
    """Удаление карточки."""
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Карточка не найдена"
        )

    # Проверяем права доступа
    card_set = get_card_set(db, card.card_set_id, user_id)
    if card_set.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав на удаление этой карточки"
        )

    db.delete(card)
    db.commit()
    return True


def create_cards_batch(
    db: Session,
    card_set_id: int,
    cards_data: list[dict],
    user_id: int
) -> list[Card]:
    """Массовое создание карточек."""
    card_set = get_card_set(db, card_set_id, user_id)

    if card_set.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Нет прав на добавление карточек в этот набор"
        )

    cards = []
    for card_data in cards_data:
        card = Card(
            card_set_id=card_set_id,
            front=card_data.get("front", ""),
            back=card_data.get("back", ""),
            front_lang=card_data.get("front_lang", "ru"),
            back_lang=card_data.get("back_lang", "ru"),
            # Медиа
            front_image=card_data.get("front_image"),
            front_audio=card_data.get("front_audio"),
            front_video=card_data.get("front_video"),
            back_image=card_data.get("back_image"),
            back_audio=card_data.get("back_audio"),
            back_video=card_data.get("back_video"),
        )
        cards.append(card)

    db.add_all(cards)
    db.commit()

    for card in cards:
        db.refresh(card)

    return cards
