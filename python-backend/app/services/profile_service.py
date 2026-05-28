from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user_profile import UserProfile
from app.models.user import User
from app.models.training_session import TrainingSession


def get_or_create_profile(db: Session, user_id: int) -> UserProfile:
    """Получить или создать профиль пользователя."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile


def update_profile(
    db: Session,
    user_id: int,
    bio: str = None,
    avatar_type: str = None,
    avatar_emoji: str = None,
    avatar_color: str = None,
    avatar_url: str = None,
    last_avatar_emoji: str = None,
    last_avatar_color: str = None,
    language_preference: str = None,
    dark_mode: bool = None,
    notifications_enabled: bool = None
) -> UserProfile:
    """Обновить профиль пользователя с умной логикой аватара."""
    profile = get_or_create_profile(db, user_id)

    if bio is not None:
        profile.bio = bio
    
    # Логика обновления аватара
    if avatar_type is not None:
        # Нормализуем значение
        avatar_type = str(avatar_type).lower()
        if avatar_type in ["letter", "emoji", "url"]:
            profile.avatar_type = avatar_type
        else:
            profile.avatar_type = "letter"
    
    if avatar_emoji is not None:
        profile.avatar_emoji = avatar_emoji
        # Сохраняем как последний выбранный эмодзи
        profile.last_avatar_emoji = avatar_emoji
    
    if avatar_color is not None:
        profile.avatar_color = avatar_color
        # Сохраняем как последний выбранный цвет
        profile.last_avatar_color = avatar_color
    
    if avatar_url is not None:
        profile.avatar_url = avatar_url
        # При установке фото сохраняем текущие настройки как последние
        if profile.avatar_emoji:
            profile.last_avatar_emoji = profile.avatar_emoji
        if profile.avatar_color:
            profile.last_avatar_color = profile.avatar_color
    
    if last_avatar_emoji is not None:
        profile.last_avatar_emoji = last_avatar_emoji
    
    if last_avatar_color is not None:
        profile.last_avatar_color = last_avatar_color
    
    if language_preference is not None:
        profile.language_preference = language_preference
    if dark_mode is not None:
        profile.dark_mode = dark_mode
    if notifications_enabled is not None:
        profile.notifications_enabled = notifications_enabled

    db.commit()
    db.refresh(profile)
    return profile


def remove_avatar_photo(db: Session, user_id: int) -> UserProfile:
    """Удалить фото аватара и восстановить последние настройки."""
    profile = get_or_create_profile(db, user_id)
    
    # Удаляем URL фото
    profile.avatar_url = None
    
    # Восстанавливаем тип аватара на основе последних настроек
    # Если есть последний эмодзи (не дефолтный), используем его
    if profile.last_avatar_emoji and profile.last_avatar_emoji != "👤":
        profile.avatar_type = "emoji"
        profile.avatar_emoji = profile.last_avatar_emoji
    else:
        # Иначе используем букву
        profile.avatar_type = "letter"
    
    # Восстанавливаем последний цвет
    if profile.last_avatar_color:
        profile.avatar_color = profile.last_avatar_color
    
    db.commit()
    db.refresh(profile)
    return profile


def update_training_stats(
    db: Session,
    user_id: int,
    cards_count: int = 0,
    training_time: int = 0  # в минутах
):
    """Обновить статистику тренировок."""
    profile = get_or_create_profile(db, user_id)
    
    # Обновляем счётчики
    profile.total_cards_learned += cards_count
    profile.total_training_time += training_time
    
    # Обновляем серию дней ТОЛЬКО если в сессии были карточки
    if cards_count > 0:
        today = datetime.utcnow().date()
        
        if profile.last_training_date:
            last_date = profile.last_training_date.date()
            days_diff = (today - last_date).days
            
            if days_diff == 0:
                # Уже тренировался сегодня - не меняем серию
                pass
            elif days_diff == 1:
                # Тренировался вчера - увеличиваем серию
                profile.current_streak += 1
                profile.best_streak = max(profile.best_streak, profile.current_streak)
            else:
                # Серия прервалась - сохраняем best_streak и начинаем новую
                profile.best_streak = max(profile.best_streak, profile.current_streak)
                profile.current_streak = 1
        else:
            # Первая тренировка
            profile.current_streak = 1
            profile.best_streak = 1
        
        profile.last_training_date = datetime.utcnow()
    
    db.commit()
    db.refresh(profile)
    return profile


def get_user_stats(db: Session, user_id: int) -> dict:
    """Получить статистику пользователя."""
    profile = get_or_create_profile(db, user_id)

    # Получаем дополнительную статистику из сессий
    total_sessions = db.query(TrainingSession).filter(
        TrainingSession.user_id == user_id,
        TrainingSession.completed == True
    ).count()

    total_correct = db.query(TrainingSession).filter(
        TrainingSession.user_id == user_id,
        TrainingSession.completed == True
    ).with_entities(
        TrainingSession.correct_answers,
        TrainingSession.total_answers
    ).all()

    total_correct_sum = sum(s[0] or 0 for s in total_correct) if total_correct else 0
    total_answers_sum = sum(s[1] or 0 for s in total_correct) if total_correct else 0

    accuracy = round((total_correct_sum / total_answers_sum * 100), 1) if total_answers_sum > 0 else 0.0

    # Используем 0 если None
    total_cards_learned = profile.total_cards_learned or 0
    total_training_time = profile.total_training_time or 0
    current_streak = profile.current_streak or 0
    best_streak = profile.best_streak or 0

    return {
        "total_cards_learned": total_cards_learned,
        "total_training_time": total_training_time,
        "current_streak": current_streak,
        "best_streak": best_streak,
        "total_sessions": total_sessions,
        "accuracy": round(accuracy, 1),
        "last_training_date": profile.last_training_date
    }


def get_progress_by_days(db: Session, user_id: int, days: int = 7) -> list:
    """Получить прогресс по дням (для графика)."""
    from datetime import timedelta

    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days-1)

    # Получаем сессии за период
    sessions = db.query(TrainingSession).filter(
        TrainingSession.user_id == user_id,
        TrainingSession.completed == True,
        TrainingSession.completed_at >= datetime.combine(start_date, datetime.min.time())
    ).order_by(TrainingSession.completed_at).all()

    # Группируем по дням
    progress_data = {}
    for i in range(days):
        date = start_date + timedelta(days=i)
        date_str = date.strftime('%Y-%m-%d')
        progress_data[date_str] = {
            'date': date_str,
            'day': date.strftime('%d.%m'),
            'cards': 0,
            'time': 0,
            'sessions': 0
        }
    
    for session in sessions:
        date_str = session.completed_at.strftime('%Y-%m-%d')
        if date_str in progress_data:
            # Примерное количество карточек в сессии
            cards_in_session = session.total_answers
            progress_data[date_str]['cards'] += cards_in_session
            progress_data[date_str]['sessions'] += 1
    
    # Конвертируем в список для графика
    return list(progress_data.values())


def get_detailed_analytics(db: Session, user_id: int) -> dict:
    """Получить детальную аналитику пользователя."""
    from app.models.card import Card
    from app.models.card_set import CardSet

    profile = get_or_create_profile(db, user_id)
    today = datetime.utcnow().date()

    # === Сессии за всё время ===
    all_sessions = db.query(TrainingSession).filter(
        TrainingSession.user_id == user_id,
        TrainingSession.completed == True
    ).order_by(TrainingSession.completed_at).all()

    total_sessions = len(all_sessions)
    total_correct_sum = sum(s.correct_answers or 0 for s in all_sessions)
    total_answers_sum = sum(s.total_answers or 0 for s in all_sessions)
    accuracy = round((total_correct_sum / total_answers_sum * 100) if total_answers_sum > 0 else 0, 1)

    # === Календарь активности (последние 12 месяцев) ===
    activity_calendar = []
    start_date = today - timedelta(days=364)  # ~12 месяцев

    for i in range(365):
        date = start_date + timedelta(days=i)
        date_str = date.strftime('%Y-%m-%d')

        # Считаем сессии за этот день
        day_sessions = [s for s in all_sessions
                       if s.completed_at and s.completed_at.date() == date]

        day_cards = sum(s.total_answers or 0 for s in day_sessions)
        day_time = 0  # Можно добавить если есть время сессии

        activity_calendar.append({
            'date': date_str,
            'cards': day_cards,
            'sessions': len(day_sessions),
            'level': 0 if day_cards == 0 else (1 if day_cards <= 10 else (2 if day_cards <= 30 else (3 if day_cards <= 60 else 4)))
        })

    # === Прогресс по месяцам (последние 6 месяцев) ===
    monthly_progress = []
    month_names_ru = {
        1: 'Янв', 2: 'Фев', 3: 'Мар', 4: 'Апр', 5: 'Май', 6: 'Июн',
        7: 'Июл', 8: 'Авг', 9: 'Сен', 10: 'Окт', 11: 'Ноя', 12: 'Дек'
    }
    month_names_full = {
        1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
        7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'
    }

    for i in range(5, -1, -1):
        # Вычисляем месяц i месяцев назад
        target_month = today.month - i
        target_year = today.year
        while target_month <= 0:
            target_month += 12
            target_year -= 1

        # Первый день текущего месяца (date object)
        month_start = datetime(target_year, target_month, 1).date()
        # Первый день следующего месяца
        if target_month == 12:
            next_month_start = datetime(target_year + 1, 1, 1).date()
        else:
            next_month_start = datetime(target_year, target_month + 1, 1).date()
        # Последний день текущего месяца
        month_end = next_month_start - timedelta(days=1)

        # Считаем сессии за этот месяц (сравниваем date с date)
        month_sessions = [s for s in all_sessions
                         if s.completed_at and month_start <= s.completed_at.date() <= month_end]

        month_cards = sum(s.total_answers or 0 for s in month_sessions)
        month_correct = sum(s.correct_answers or 0 for s in month_sessions)
        month_total = sum(s.total_answers or 0 for s in month_sessions)
        month_accuracy = round((month_correct / month_total * 100) if month_total > 0 else 0, 1)

        monthly_progress.append({
            'month': month_names_full.get(target_month, ''),
            'month_short': month_names_ru.get(target_month, ''),
            'cards': month_cards,
            'sessions': len(month_sessions),
            'accuracy': month_accuracy
        })

    # === Лучший день недели ===
    day_names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    day_stats = {i: {'cards': 0, 'sessions': 0, 'accuracy': 0, 'correct': 0, 'total': 0} for i in range(7)}

    for s in all_sessions:
        if s.completed_at:
            # Python: Monday=0, Sunday=6
            day_of_week = s.completed_at.weekday()
            day_stats[day_of_week]['cards'] += s.total_answers or 0
            day_stats[day_of_week]['sessions'] += 1
            day_stats[day_of_week]['correct'] += s.correct_answers or 0
            day_stats[day_of_week]['total'] += s.total_answers or 0

    for i in range(7):
        if day_stats[i]['total'] > 0:
            day_stats[i]['accuracy'] = round(day_stats[i]['correct'] / day_stats[i]['total'] * 100, 1)

    best_day_idx = max(range(7), key=lambda i: day_stats[i]['cards'])
    best_day = {
        'name': day_names[best_day_idx],
        'cards': day_stats[best_day_idx]['cards'],
        'accuracy': day_stats[best_day_idx]['accuracy']
    }

    # === Распределение по режимам тренировок ===
    mode_stats = {}
    for s in all_sessions:
        mode = s.mode or 'unknown'
        if mode not in mode_stats:
            mode_stats[mode] = {'sessions': 0, 'cards': 0, 'accuracy': 0, 'correct': 0, 'total': 0}
        mode_stats[mode]['sessions'] += 1
        mode_stats[mode]['cards'] += s.total_answers or 0
        mode_stats[mode]['correct'] += s.correct_answers or 0
        mode_stats[mode]['total'] += s.total_answers or 0

    for mode in mode_stats:
        if mode_stats[mode]['total'] > 0:
            mode_stats[mode]['accuracy'] = round(mode_stats[mode]['correct'] / mode_stats[mode]['total'] * 100, 1)

    # === Коэффициенты ===
    total_cards_learned = profile.total_cards_learned or 0
    total_sessions_count = total_sessions  # alias для ясности
    avg_cards_per_session = round(total_cards_learned / total_sessions_count, 1) if total_sessions_count > 0 else 0

    # Коэффициент продуктивности (карточки / минута)
    total_time = profile.total_training_time or 0
    productivity_rate = round(total_cards_learned / total_time, 2) if total_time > 0 else 0

    # Коэффициент стабильности (сколько дней из последних 30 были активны)
    last_30_days = today - timedelta(days=29)
    active_days = len(set(s.completed_at.date() for s in all_sessions
                         if s.completed_at and s.completed_at.date() >= last_30_days))
    stability_rate = round(active_days / 30 * 100, 1)

    # Текущая серия vs лучшая
    current_streak = profile.current_streak or 0
    best_streak = profile.best_streak or 0
    streak_ratio = round(current_streak / best_streak * 100, 1) if best_streak > 0 else 0

    # Дней с последней тренировки
    last_training = profile.last_training_date
    days_since_last = None
    if last_training:
        days_since_last = (today - last_training.date()).days

    # === Топ наборов по использованию ===
    set_sessions = {}
    for s in all_sessions:
        set_id = s.card_set_id
        if set_id is None:
            continue  # Пропускаем сессии без набора
        if set_id not in set_sessions:
            set_sessions[set_id] = {'sessions': 0, 'cards': 0}
        set_sessions[set_id]['sessions'] += 1
        set_sessions[set_id]['cards'] += s.total_answers or 0

    top_set_ids = sorted(set_sessions.keys(), key=lambda x: set_sessions[x]['cards'], reverse=True)[:5]
    top_sets = []
    for set_id in top_set_ids:
        card_set = db.query(CardSet).filter(CardSet.id == set_id).first()
        if card_set:
            top_sets.append({
                'id': set_id,
                'title': card_set.title,
                'sessions': set_sessions[set_id]['sessions'],
                'cards': set_sessions[set_id]['cards']
            })

    return {
        'activity_calendar': activity_calendar,
        'monthly_progress': monthly_progress,
        'day_of_week': [{'name': day_names[i], **day_stats[i]} for i in range(7)],
        'best_day': best_day,
        'mode_distribution': mode_stats,
        'top_sets': top_sets,
        'coefficients': {
            'avg_cards_per_session': avg_cards_per_session,
            'productivity_rate': productivity_rate,
            'stability_rate': stability_rate,
            'streak_ratio': streak_ratio,
            'days_since_last_training': days_since_last,
        },
        'summary': {
            'total_sessions': total_sessions,
            'total_cards': total_cards_learned,
            'total_time': total_time,
            'accuracy': accuracy,
            'current_streak': current_streak,
            'best_streak': best_streak,
        }
    }


def delete_user_account(db: Session, user_id: int) -> bool:
    """Удалить аккаунт пользователя и все связанные данные."""
    from app.models.message import Message
    from app.models.friendship import Friendship
    from app.models.card_set import CardSet
    from app.models.card import Card
    from app.models.favorite import Favorite
    from app.models.training_session import TrainingSession
    from app.models.card_set_usage_stats import CardSetUsageStats
    from app.models.shared_set import SharedSetAccess
    
    try:
        print(f"\n{'='*60}")
        print(f"НАЧАЛО УДАЛЕНИЯ АККАУНТА user_id={user_id}")
        print(f"{'='*60}")
        
        # Проверяем что пользователь существует
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ ОШИБКА: Пользователь с id={user_id} не найден!")
            return False
        
        print(f"👤 Email пользователя: {user.email}")
        print(f"👤 Имя пользователя: {user.name}")
        print()
        
        # ПРОВЕРКА ПЕРЕД УДАЛЕНИЕМ
        print("📊 СТАТИСТИКА ПЕРЕД УДАЛЕНИЕМ:")
        profile_before = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if profile_before:
            print(f"   - Карточек изучено: {profile_before.total_cards_learned}")
            print(f"   - Время тренировок: {profile_before.total_training_time} мин")
            print(f"   - Текущая серия: {profile_before.current_streak}")
            print(f"   - Лучшая серия: {profile_before.best_streak}")
        
        sessions_before = db.query(TrainingSession).filter(TrainingSession.user_id == user_id).count()
        print(f"   - Сессий тренировок: {sessions_before}")
        
        sets_before = db.query(CardSet).filter(CardSet.author_id == user_id).count()
        print(f"   - Наборов карточек: {sets_before}")
        print()
        
        # 1. Удаляем сообщения (отправленные и полученные)
        count = db.query(Message).filter(
            (Message.sender_id == user_id) | 
            (Message.receiver_id == user_id)
        ).delete(synchronize_session=False)
        print(f"[1/11] ✅ Удалено сообщений: {count}")
        
        # 2. Удаляем дружеские связи (запросы и принятые дружбы)
        count = db.query(Friendship).filter(
            (Friendship.requester_id == user_id) | 
            (Friendship.addressee_id == user_id)
        ).delete(synchronize_session=False)
        print(f"[2/11] ✅ Удалено дружеских связей: {count}")
        
        # 3. Удаляем избранные наборы
        count = db.query(Favorite).filter(
            Favorite.user_id == user_id
        ).delete(synchronize_session=False)
        print(f"[3/11] ✅ Удалено избранных наборов: {count}")
        
        # 4. Удаляем доступ к общим наборам
        count = db.query(SharedSetAccess).filter(
            SharedSetAccess.user_id == user_id
        ).delete(synchronize_session=False)
        print(f"[4/11] ✅ Удалено доступов к общим наборам: {count}")
        
        # 5. Удаляем сессии тренировок
        count = db.query(TrainingSession).filter(
            TrainingSession.user_id == user_id
        ).delete(synchronize_session=False)
        print(f"[5/11] ✅ Удалено сессий тренировок: {count}")
        
        # 6. Удаляем статистику использования наборов
        count = db.query(CardSetUsageStats).filter(
            CardSetUsageStats.user_id == user_id
        ).delete(synchronize_session=False)
        print(f"[6/11] ✅ Удалено записей статистики наборов: {count}")
        
        # 7. Удаляем карточки в наборах пользователя (перед удалением наборов)
        user_sets = db.query(CardSet).filter(
            CardSet.author_id == user_id
        ).all()
        print(f"[7/11] 📁 Найдено наборов пользователя: {len(user_sets)}")
        
        total_cards = 0
        for card_set in user_sets:
            count = db.query(Card).filter(
                Card.card_set_id == card_set.id
            ).delete(synchronize_session=False)
            total_cards += count
        print(f"       📇 Удалено карточек из наборов: {total_cards}")
        
        # 8. Удаляем наборы карточек пользователя
        count = db.query(CardSet).filter(
            CardSet.author_id == user_id
        ).delete(synchronize_session=False)
        print(f"[8/11] ✅ Удалено наборов карточек: {count}")
        
        # 9. Удаляем профиль пользователя
        count = db.query(UserProfile).filter(
            UserProfile.user_id == user_id
        ).delete(synchronize_session=False)
        print(f"[9/11] ✅ Удалено профилей: {count}")
        
        # 10. В конце удаляем самого пользователя
        count = db.query(User).filter(User.id == user_id).delete(synchronize_session=False)
        print(f"[10/11] ✅ Удалено пользователей: {count}")
        
        db.commit()
        
        # ПРОВЕРКА ПОСЛЕ УДАЛЕНИЯ
        print()
        print("🔍 ПРОВЕРКА ПОСЛЕ УДАЛЕНИЯ:")
        user_after = db.query(User).filter(User.id == user_id).first()
        profile_after = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        sessions_after = db.query(TrainingSession).filter(TrainingSession.user_id == user_id).count()
        
        if not user_after and not profile_after and sessions_after == 0:
            print("   ✅ Все данные успешно удалены!")
        else:
            print("   ⚠️ ВНИМАНИЕ: Некоторые данные остались!")
            if user_after:
                print(f"      - Пользователь всё ещё существует!")
            if profile_after:
                print(f"      - Профиль всё ещё существует!")
            if sessions_after > 0:
                print(f"      - Осталось сессий: {sessions_after}")
        
        print(f"\n{'='*60}")
        print(f"✅ УДАЛЕНИЕ ЗАВЕРШЕНО УСПЕШНО")
        print(f"{'='*60}\n")
        return True
        
    except Exception as e:
        db.rollback()
        import traceback
        print(f"\n❌ ОШИБКА ПРИ УДАЛЕНИИ АККАУНТА:")
        print(f"{e}")
        print(f"\n{traceback.format_exc()}\n")
        raise e
