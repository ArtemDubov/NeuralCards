import csv
import json
import io
from typing import List, Dict, TYPE_CHECKING

from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

if TYPE_CHECKING:
    from app.models.card import Card

MAX_CARDS_PER_SET = 2000

def _count_cards(db: Session, card_set_id: int) -> int:
    """Посчитать карточки в наборе."""
    from app.models.card import Card
    return db.query(Card).filter(Card.card_set_id == card_set_id).count()


# Маппинг langdetect → наш код языка
LANG_MAP = {
    'ru': 'ru',
    'en': 'en',
    'de': 'de',
    'fr': 'fr',
    'es': 'es',
    'it': 'it',
    'zh-cn': 'zh',
    'zh-tw': 'zh',
    'zh': 'zh',
    'ja': 'ja',
    'pt': 'pt',
    'nl': 'nl',
    'ar': 'ar',
    'ko': 'ko',
    'uk': 'ru',   # украинский → русский (TTS ru ближайший)
    'be': 'ru',   # белорусский → русский
    'ca': 'es',   # каталанский → испанский
    'ro': 'it',   # румынский → итальянский
    'la': 'it',   # латынь → итальянский
    'tr': 'tr',
    'pl': 'pl',
    'cs': 'cs',
    'sv': 'sv',
    'no': 'no',
    'da': 'da',
    'fi': 'fi',
}


def detect_language(text: str) -> str:
    """
    Автоопределение языка текста через langdetect.
    Для коротких текстов (< 10 символов) пытается использовать контекст.
    Возвращает код языка или 'ru' по умолчанию.
    """
    if not text or not text.strip():
        return 'ru'

    text = text.strip()

    # Для очень коротких текстов langdetect ненадёжен
    # Используем эвристики
    if len(text) < 3:
        return 'ru'

    # Эвристика: кириллица = русский
    cyrillic_ratio = sum(1 for c in text if '\u0400' <= c <= '\u04FF') / max(len(text), 1)
    if cyrillic_ratio > 0.3:
        return 'ru'

    # Эвристика: испанские характерные паттерны
    spanish_chars = '¿¡ñÑ'
    if any(c in text for c in spanish_chars):
        return 'es'

    # Эвристика: французские характерные паттерны
    french_patterns = ['œ', 'Œ', 'ç', 'Ç', 'à ', 'À ', 'é', 'É', 'è ', 'È ']
    if any(p in text for p in french_patterns):
        return 'fr'

    # Эвристика: немецкие характерные паттерны
    german_chars = 'ßäöüÄÖÜ'
    if any(c in text for c in german_chars):
        return 'de'

    # langdetect с фиксированным seed для стабильности
    try:
        from langdetect import detect
        from langdetect.detector_factory import DetectorFactory
        factory = DetectorFactory()
        factory.seed = 0  # Фиксируем seed для стабильных результатов

        detected = detect(text)
        return LANG_MAP.get(detected, 'en')  # По умолчанию английский, не русский
    except ImportError:
        import logging
        logging.getLogger(__name__).debug("langdetect не установлен, определение языка недоступно")
        return 'ru'
    except Exception as e:
        import logging
        logging.getLogger(__name__).debug(f"Language detection failed: {e}")
        return 'ru'


def auto_detect_langs(cards: List[Dict[str, str]]) -> tuple[str, str]:
    """
    Автоопределение языков для лицевой и обратной сторон.
    Анализирует первые 30 карточек (больше выборка = точнее).
    Использует加权 голосование — длинные тексты имеют больший вес.
    """
    front_langs = {}
    back_langs = {}
    sample = cards[:30]  # Увеличиваем выборку

    for card in sample:
        front = card.get('front', '')
        back = card.get('back', '')

        if front:
            lang = detect_language(front)
            # Длинные тексты = больший вес
            weight = min(len(front), 50) // 10 + 1
            front_langs[lang] = front_langs.get(lang, 0) + weight

        if back:
            lang = detect_language(back)
            weight = min(len(back), 50) // 10 + 1
            back_langs[lang] = back_langs.get(lang, 0) + weight

    # Выбираем доминирующий язык
    front_lang = max(front_langs, key=front_langs.get) if front_langs else 'en'
    back_lang = max(back_langs, key=back_langs.get) if back_langs else 'ru'

    return front_lang, back_lang


def export_to_csv(cards: List["Card"]) -> str:
    """Экспорт карточек в CSV формат."""
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    
    # Заголовок
    writer.writerow(['front', 'back'])
    
    # Карточки
    for card in cards:
        writer.writerow([card.front, card.back])
    
    return output.getvalue()


def export_to_json(cards: List["Card"], set_title: str) -> str:
    """Экспорт карточек в JSON формат."""
    data = {
        'title': set_title,
        'cards': [
            {'front': card.front, 'back': card.back}
            for card in cards
        ]
    }
    return json.dumps(data, ensure_ascii=False, indent=2)


def export_to_txt(cards: List["Card"]) -> str:
    """Экспорт карточек в TXT формат (простой)."""
    lines = []
    for card in cards:
        lines.append(f"{card.front} ; {card.back}")
    return '\n'.join(lines)


def import_from_csv(file_content: str) -> List[Dict[str, str]]:
    """Импорт карточек из CSV."""
    cards = []
    reader = csv.DictReader(io.StringIO(file_content), delimiter=';')
    
    for row in reader:
        if 'front' in row and 'back' in row:
            cards.append({
                'front': row['front'].strip(),
                'back': row['back'].strip()
            })
    
    return cards


def import_from_json(file_content: str) -> List[Dict[str, str]]:
    """Импорт карточек из JSON."""
    try:
        data = json.loads(file_content)
        
        # Поддержка разных форматов
        if isinstance(data, list):
            # Просто список карточек
            cards = data
        elif isinstance(data, dict) and 'cards' in data:
            # Объект с полем cards
            cards = data['cards']
        else:
            raise HTTPException(status_code=400, detail="Неверный формат JSON")
        
        result = []
        for card in cards:
            if isinstance(card, dict) and 'front' in card and 'back' in card:
                result.append({
                    'front': str(card['front']).strip(),
                    'back': str(card['back']).strip()
                })
        
        return result
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Неверный JSON формат")


def import_from_txt(file_content: str) -> List[Dict[str, str]]:
    """Импорт карточек из TXT (формат: вопрос ; ответ)."""
    cards = []
    
    for line in file_content.split('\n'):
        line = line.strip()
        if not line or line.startswith('---') or line.startswith('//'):
            continue
        
        if ';' in line:
            parts = line.split(';', 1)
            if len(parts) == 2:
                cards.append({
                    'front': parts[0].strip(),
                    'back': parts[1].strip()
                })
    
    return cards


async def parse_import_file(file: UploadFile, format: str) -> List[Dict[str, str]]:
    """Парсинг загруженного файла."""
    try:
        content = await file.read()
        content_str = content.decode('utf-8')
        
        if format == 'csv':
            return import_from_csv(content_str)
        elif format == 'json':
            return import_from_json(content_str)
        elif format == 'txt':
            return import_from_txt(content_str)
        else:
            raise HTTPException(status_code=400, detail="Неподдерживаемый формат")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Ошибка кодировки файла. Используйте UTF-8")
