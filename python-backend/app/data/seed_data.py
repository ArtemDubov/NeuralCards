"""
Seed data — стартовые наборы карточек для демонстрации.
Запускается автоматически при старте приложения (main.py).
Проверяет наличие наборов по title, НЕ создаёт дубликаты.
"""
from app.core.database import SessionLocal
from app.models.user import User
from app.models.card_set import CardSet
from app.models.card import Card
from app.core.security import get_password_hash


# ============================================================
# Демо-наборы с правильными языками
# ============================================================
DEMO_SETS = [
    {
        "title": "Английский — Топ 50",
        "description": "Самые частые английские слова",
        "front_lang": "en",  # Английский для лицевой стороны
        "back_lang": "ru",   # Русский для обратной стороны
        "cards": [
            ("the", "определённый артикль"),
            ("be", "быть"),
            ("to", "к, в"),
            ("of", "из, о"),
            ("and", "и"),
            ("a", "неопределённый артикль"),
            ("in", "в"),
            ("that", "что, тот"),
            ("have", "иметь"),
            ("I", "я"),
            ("it", "это"),
            ("for", "для"),
            ("not", "не"),
            ("on", "на"),
            ("with", "с"),
            ("he", "он"),
            ("as", "как"),
            ("you", "ты, вы"),
            ("do", "делать"),
            ("at", "у, при"),
            ("this", "этот"),
            ("but", "но"),
            ("his", "его"),
            ("by", "у"),
            ("from", "от, из"),
            ("they", "они"),
            ("we", "мы"),
            ("say", "говорить"),
            ("her", "её"),
            ("she", "она"),
            ("or", "или"),
            ("will", "будет"),
            ("my", "мой"),
            ("one", "один"),
            ("all", "весь"),
            ("would", "бы"),
            ("there", "там"),
            ("their", "их"),
            ("what", "что"),
            ("so", "так"),
            ("up", "вверх"),
            ("out", "из, вне"),
            ("if", "если"),
            ("about", "о, примерно"),
            ("who", "кто"),
            ("get", "получать"),
            ("which", "который"),
            ("go", "идти"),
            ("me", "меня"),
            ("when", "когда"),
        ],
    },
    {
        "title": "Испанский — Топ 50",
        "description": "Базовые испанские слова",
        "front_lang": "es",  # Испанский для лицевой стороны
        "back_lang": "ru",   # Русский для обратной стороны
        "cards": [
            ("hola", "привет"),
            ("gracias", "спасибо"),
            ("por favor", "пожалуйста"),
            ("sí", "да"),
            ("no", "нет"),
            ("buenos días", "доброе утро"),
            ("buenas tardes", "добрый день"),
            ("buenas noches", "добрый вечер / ночь"),
            ("adiós", "до свидания"),
            ("hasta luego", "до скорого"),
            ("yo", "я"),
            ("tú", "ты"),
            ("él", "он"),
            ("ella", "она"),
            ("nosotros", "мы"),
            ("ellos", "они"),
            ("ser", "быть (постоянно)"),
            ("estar", "быть (временно)"),
            ("tener", "иметь"),
            ("hacer", "делать"),
            ("ir", "идти"),
            ("venir", "приходить"),
            ("decir", "говорить"),
            ("ver", "видеть"),
            ("dar", "давать"),
            ("saber", "знать (факт)"),
            ("querer", "хотеть"),
            ("llegar", "прибывать"),
            ("pasar", "проходить"),
            ("uno", "один"),
            ("dos", "два"),
            ("tres", "три"),
            ("cuatro", "четыре"),
            ("cinco", "пять"),
            ("grande", "большой"),
            ("pequeño", "маленький"),
            ("bueno", "хороший"),
            ("malo", "плохой"),
            ("bonito", "красивый"),
            ("casa", "дом"),
            ("agua", "вода"),
            ("comida", "еда"),
            ("tiempo", "время / погода"),
            ("día", "день"),
            ("noche", "ночь"),
            ("amigo", "друг"),
            ("trabajo", "работа"),
            ("ciudad", "город"),
            ("mundo", "мир"),
            ("vida", "жизнь"),
        ],
    },
    {
        "title": "Японский — Хирагана",
        "description": "Базовая японская азбука хирагана",
        "front_lang": "ja",  # Японский для лицевой стороны
        "back_lang": "en",   # Английский для обратной стороны (транслитерация)
        "cards": [
            ("あ", "a"),
            ("い", "i"),
            ("う", "u"),
            ("え", "e"),
            ("お", "o"),
            ("か", "ka"),
            ("き", "ki"),
            ("く", "ku"),
            ("け", "ke"),
            ("こ", "ko"),
            ("さ", "sa"),
            ("し", "shi"),
            ("す", "su"),
            ("せ", "se"),
            ("そ", "so"),
            ("た", "ta"),
            ("ち", "chi"),
            ("つ", "tsu"),
            ("て", "te"),
            ("と", "to"),
            ("な", "na"),
            ("に", "ni"),
            ("ぬ", "nu"),
            ("ね", "ne"),
            ("の", "no"),
            ("は", "ha"),
            ("ひ", "hi"),
            ("ふ", "fu"),
            ("へ", "he"),
            ("ほ", "ho"),
            ("ま", "ma"),
            ("み", "mi"),
            ("む", "mu"),
            ("め", "me"),
            ("も", "mo"),
            ("や", "ya"),
            ("ゆ", "yu"),
            ("よ", "yo"),
            ("ら", "ra"),
            ("り", "ri"),
            ("る", "ru"),
            ("れ", "re"),
            ("ろ", "ro"),
            ("わ", "wa"),
            ("を", "wo"),
            ("ん", "n"),
        ],
    },
]


def seed_database():
    """Заполнение базы данных демо-наборами."""
    db = SessionLocal()

    try:
        # --- Системный пользователь ---
        system_user = db.query(User).filter(
            User.email == "system@neuraltrident.com"
        ).first()
        if not system_user:
            system_user = User(
                email="system@neuraltrident.com",
                password_hash=get_password_hash("system-password"),
                name="NeuralTrident System",
            )
            db.add(system_user)
            db.commit()
            db.refresh(system_user)

        # --- Демо-наборы (проверка по title — без дублей) ---
        created_count = 0
        for demo in DEMO_SETS:
            existing = db.query(CardSet).filter(
                CardSet.title == demo["title"]
            ).first()
            if existing:
                print(f"  Набор «{demo['title']}» уже существует, пропускаем")
                continue

            card_set = CardSet(
                title=demo["title"],
                description=demo["description"],
                is_public=True,
                is_official=True,  # Готовые наборы от разработчиков
                author_id=system_user.id,
            )
            db.add(card_set)
            db.flush()

            # Получаем языки из набора (с fallback на значения по умолчанию)
            front_lang = demo.get("front_lang", "ru")
            back_lang = demo.get("back_lang", "ru")

            for front, back in demo["cards"]:
                card = Card(
                    card_set_id=card_set.id,
                    front=front,
                    back=back,
                    front_lang=front_lang,  # Используем язык из набора
                    back_lang=back_lang,    # Используем язык из набора
                )
                db.add(card)

            created_count += 1
            print(f"  ✅ Создан «{demo['title']}» — {len(demo['cards'])} карточек")

        db.commit()
        if created_count > 0:
            total = sum(len(d["cards"]) for d in DEMO_SETS)
            print(f"✅ Seed: создано {created_count} наборов, {total} карточек")
        else:
            print("✅ Seed: все наборы уже существуют")

    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка seed: {e}")
        raise
    finally:
        db.close()
