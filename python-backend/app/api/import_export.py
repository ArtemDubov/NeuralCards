from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File, Form
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.card_set import CardSet
from app.models.card import Card
from app.services import card_service
from app.services.import_export_service import (
    export_to_csv,
    export_to_json,
    export_to_txt,
    parse_import_file,
    auto_detect_langs,
    MAX_CARDS_PER_SET,
)

router = APIRouter(prefix="/api/card-sets", tags=["Импорт/Экспорт"])


@router.get("/{card_set_id}/export")
async def export_card_set(
    card_set_id: int,
    format: str = "csv",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Экспорт набора карточек в файл."""
    card_set = card_service.get_card_set(db, card_set_id, current_user.id)
    cards = db.query(Card).filter(Card.card_set_id == card_set_id).all()
    
    if format == "csv":
        content = export_to_csv(cards)
        media_type = "text/csv"
        filename = f"{card_set.title}.csv"
    elif format == "json":
        content = export_to_json(cards, card_set.title)
        media_type = "application/json"
        filename = f"{card_set.title}.json"
    elif format == "txt":
        content = export_to_txt(cards)
        media_type = "text/plain"
        filename = f"{card_set.title}.txt"
    else:
        raise HTTPException(status_code=400, detail="Неподдерживаемый формат. Используйте: csv, json, txt")
    
    headers = {
        "Content-Disposition": f"attachment; filename={filename}"
    }
    
    return Response(
        content=content.encode('utf-8'),
        media_type=media_type,
        headers=headers
    )


@router.post("/{card_set_id}/import")
async def import_to_card_set(
    card_set_id: int,
    file: UploadFile = File(...),
    front_lang: str = Form("ru"),
    back_lang: str = Form("ru"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Импорт карточек в набор из файла."""
    # Проверяем права доступа
    card_set = card_service.get_card_set(db, card_set_id, current_user.id)
    if card_set.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет прав на добавление карточек")

    # Определяем формат по расширению
    filename = file.filename or ""
    if filename.endswith(".csv"):
        format = "csv"
    elif filename.endswith(".json"):
        format = "json"
    elif filename.endswith(".txt"):
        format = "txt"
    else:
        raise HTTPException(status_code=400, detail="Неподдерживаемый формат файла. Используйте: .csv, .json, .txt")

    # Парсим файл
    cards_data = await parse_import_file(file, format)

    if not cards_data:
        raise HTTPException(status_code=400, detail="Файл не содержит карточек")

    # Проверка лимита
    existing_count = db.query(Card).filter(Card.card_set_id == card_set_id).count()
    if existing_count + len(cards_data) > MAX_CARDS_PER_SET:
        raise HTTPException(
            status_code=400,
            detail=f"Лимит: {MAX_CARDS_PER_SET} карточек на набор. Сейчас {existing_count}, хотите добавить {len(cards_data)}. Доступно: {MAX_CARDS_PER_SET - existing_count}"
        )
    if front_lang == "auto" or back_lang == "auto":
        detected_front, detected_back = auto_detect_langs(cards_data)
        if front_lang == "auto":
            front_lang = detected_front
        if back_lang == "auto":
            back_lang = detected_back

    # Применяем языки ко всем карточкам
    for card in cards_data:
        card["front_lang"] = front_lang
        card["back_lang"] = back_lang

    # Создаем карточки
    created_cards = card_service.create_cards_batch(db, card_set_id, cards_data, current_user.id)

    return {
        "message": f"Импортировано {len(created_cards)} карточек",
        "cards_count": len(created_cards)
    }


@router.post("/import/new")
async def import_to_new_set(
    title: str = Form(...),
    description: str = Form(None),
    is_public: bool = Form(True),
    file: UploadFile = File(...),
    front_lang: str = Form("ru"),
    back_lang: str = Form("ru"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Импорт карточек в новый набор."""
    # Создаем новый набор
    card_set = card_service.create_card_set(
        db=db,
        title=title,
        description=description,
        is_public=is_public,
        author_id=current_user.id
    )

    # Определяем формат
    filename = file.filename or ""
    if filename.endswith(".csv"):
        format = "csv"
    elif filename.endswith(".json"):
        format = "json"
    elif filename.endswith(".txt"):
        format = "txt"
    else:
        # Удаляем набор, т.к. формат не поддерживается
        db.delete(card_set)
        db.commit()
        raise HTTPException(status_code=400, detail="Неподдерживаемый формат файла")

    # Парсим файл
    cards_data = await parse_import_file(file, format)

    if not cards_data:
        db.delete(card_set)
        db.commit()
        raise HTTPException(status_code=400, detail="Файл не содержит карточек")

    # Проверка лимита для нового набора
    if len(cards_data) > MAX_CARDS_PER_SET:
        db.delete(card_set)
        db.commit()
        raise HTTPException(
            status_code=400,
            detail=f"Лимит: {MAX_CARDS_PER_SET} карточек на набор. Файл содержит {len(cards_data)} карточек."
        )

    # Определяем языки: если 'auto' — автоопределение
    if front_lang == "auto" or back_lang == "auto":
        detected_front, detected_back = auto_detect_langs(cards_data)
        if front_lang == "auto":
            front_lang = detected_front
        if back_lang == "auto":
            back_lang = detected_back

    # Применяем языки ко всем карточкам
    for card in cards_data:
        card["front_lang"] = front_lang
        card["back_lang"] = back_lang

    # Создаем карточки
    created_cards = card_service.create_cards_batch(db, card_set.id, cards_data, current_user.id)

    return {
        "message": f"Создан набор '{title}' с {len(created_cards)} карточками",
        "set_id": card_set.id,
        "cards_count": len(created_cards)
    }
