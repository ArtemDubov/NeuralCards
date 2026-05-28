"""
Speech & Translation API
- STT (Speech-to-Text) через faster-whisper
- TTS (Text-to-Speech) через gTTS
- Translation через deep-translator
"""
import os
import tempfile
import threading
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional

from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/speech", tags=["Speech & Translation"])

# Глобальная переменная для модели Whisper
whisper_model = None
model_loading = False
_model_lock = threading.Lock()


def get_whisper_model():
    """Получение или загрузка модели Whisper (thread-safe)."""
    global whisper_model, model_loading

    if whisper_model is not None:
        return whisper_model

    with _model_lock:
        # Повторная проверка после захвата lock
        if whisper_model is not None:
            return whisper_model

        if model_loading:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Модель распознавания речи загружается, попробуйте позже"
            )

        model_loading = True
    try:
        from faster_whisper import WhisperModel
        print("[Whisper] Loading speech recognition model (Whisper large-v3)...")
        whisper_model = WhisperModel(
            "large-v3",
            device="cpu",
            compute_type="int8"
        )
        print("[Whisper] Model loaded successfully!")
        return whisper_model
    except Exception as e:
        whisper_model = None
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка загрузки модели: {str(e)}"
        )
    finally:
        model_loading = False


# Pydantic схемы
class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "en"


class SpeakRequest(BaseModel):
    text: str
    lang: str = "ru"


class TranscribeResponse(BaseModel):
    text: str
    language: Optional[str] = None


class TranslateResponse(BaseModel):
    translated_text: str
    source_lang: Optional[str] = None
    target_lang: str


class SpeakResponse(BaseModel):
    audio_url: str


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(
    file: UploadFile = File(..., description="Аудиофайл для распознавания (WAV/MP3)"),
    current_user: User = Depends(get_current_user)
):
    """
    Распознавание речи из аудиофайла (STT).
    Использует Whisper large-v3 модель.
    """
    # Проверка типа файла
    allowed_types = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/ogg", "audio/webm"]
    ct = file.content_type or ""
    if not any(ct.startswith(t) for t in allowed_types):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Недопустимый тип аудио. Разрешены: {', '.join(allowed_types)}"
        )

    # Проверка размера (макс 50MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > 50 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл слишком большой. Максимум 50 MB"
        )

    # Сохраняем во временный файл
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(file.file.read())
        tmp_path = tmp.name

    try:
        model = get_whisper_model()
        # Whisper auto-detects language when language=None
        segments, info = model.transcribe(tmp_path, beam_size=5, language=None)

        # Собираем текст из всех сегментов
        recognized_text = " ".join([segment.text for segment in segments])

        return TranscribeResponse(
            text=recognized_text.strip(),
            language=info.language if info else None
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка распознавания речи: {str(e)}"
        )
    finally:
        # Удаляем временный файл
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.post("/translate", response_model=TranslateResponse)
async def translate_text(
    request: TranslateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Перевод текста через Google Translate.
    """
    try:
        from deep_translator import GoogleTranslator

        translator = GoogleTranslator(source='auto', target=request.target_lang)
        translated = translator.translate(request.text)

        # Определяем исходный язык (примерно)
        source_lang = None
        try:
            detected = GoogleTranslator(source='auto', target='en').detect(request.text)
            if detected and isinstance(detected, list) and len(detected) > 0:
                source_lang = detected[0][0]
        except Exception as e:
            import logging
            logging.getLogger(__name__).debug(f"Language detection failed: {e}")

        return TranslateResponse(
            translated_text=translated,
            source_lang=source_lang,
            target_lang=request.target_lang
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка перевода: {str(e)}"
        )


@router.post("/speak", response_model=SpeakResponse)
async def text_to_speech(
    request: SpeakRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Синтез речи из текста (TTS).
    Использует gTTS (Google Text-to-Speech).
    """
    import uuid as uuid_mod
    from app.core.config import settings

    try:
        from gtts import gTTS

        tts_dir = settings.MEDIA_ROOT / "tts"
        tts_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{uuid_mod.uuid4().hex}.mp3"
        file_path = tts_dir / filename

        lang_map = {
            'ru': 'ru', 'en': 'en', 'de': 'de', 'fr': 'fr',
            'es': 'es', 'it': 'it', 'zh-CN': 'zh-cn', 'zh': 'zh-cn', 'ja': 'ja',
            'pt': 'pt', 'ko': 'ko', 'ar': 'ar', 'nl': 'nl', 'pl': 'pl',
            'tr': 'tr', 'sv': 'sv', 'da': 'da', 'fi': 'fi', 'no': 'no',
            'cs': 'cs', 'hu': 'hu', 'ro': 'ro', 'uk': 'uk', 'el': 'el',
            'he': 'he', 'hi': 'hi', 'th': 'th', 'vi': 'vi', 'id': 'id',
        }
        tts_lang = lang_map.get(request.lang, 'ru')

        # ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ
        print("=" * 80)
        print("[TTS] ========== ЗАПРОС НА СИНТЕЗ РЕЧИ ==========")
        print(f"[TTS] Полученные данные:")
        print(f"[TTS]   - request.lang: '{request.lang}' (type: {type(request.lang).__name__})")
        print(f"[TTS]   - tts_lang (после маппинга): '{tts_lang}'")
        print(f"[TTS]   - Длина текста: {len(request.text)} символов")
        print(f"[TTS]   - Текст (первые 100 символов): '{request.text[:100]}'")
        print(f"[TTS]   - Текст (полный): '{request.text}'")
        print(f"[TTS]   - Пользователь: {current_user.username if hasattr(current_user, 'username') else 'N/A'}")
        
        tts = gTTS(text=request.text, lang=tts_lang, slow=False)
        tts.save(str(file_path))

        file_size = file_path.stat().st_size if file_path.exists() else 0
        print(f"[TTS] Результат:")
        print(f"[TTS]   - Файл сохранен: {file_path}")
        print(f"[TTS]   - Размер файла: {file_size} байт")
        print(f"[TTS]   - Язык gTTS: '{tts_lang}'")
        print(f"[TTS]   - URL аудио: media/tts/{filename}")
        print("[TTS] ========== КОНЕЦ ЗАПРОСА ==========")
        print("=" * 80)

        audio_url = f"media/tts/{filename}"
        return SpeakResponse(audio_url=audio_url)

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"[TTS ERROR] {str(e)}")
        print(tb)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка синтеза речи: {str(e)}"
        )


@router.post("/speak-demo", response_model=SpeakResponse)
async def text_to_speech_demo(request: SpeakRequest):
    """
    Синтез речи из текста (TTS) для демо-режима без авторизации.
    Использует gTTS (Google Text-to-Speech).
    """
    import uuid as uuid_mod
    from app.core.config import settings

    try:
        from gtts import gTTS

        tts_dir = settings.MEDIA_ROOT / "tts"
        tts_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{uuid_mod.uuid4().hex}.mp3"
        file_path = tts_dir / filename

        lang_map = {
            'ru': 'ru', 'en': 'en', 'de': 'de', 'fr': 'fr',
            'es': 'es', 'it': 'it', 'zh-CN': 'zh-cn', 'zh': 'zh-cn', 'ja': 'ja',
            'pt': 'pt', 'ko': 'ko', 'ar': 'ar', 'nl': 'nl', 'pl': 'pl',
            'tr': 'tr', 'sv': 'sv', 'da': 'da', 'fi': 'fi', 'no': 'no',
            'cs': 'cs', 'hu': 'hu', 'ro': 'ro', 'uk': 'uk', 'el': 'el',
            'he': 'he', 'hi': 'hi', 'th': 'th', 'vi': 'vi', 'id': 'id',
        }
        tts_lang = lang_map.get(request.lang, 'ru')

        # ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ
        print("=" * 80)
        print("[TTS-DEMO] ========== ЗАПРОС НА СИНТЕЗ РЕЧИ (ДЕМО) ==========")
        print(f"[TTS-DEMO] Полученные данные:")
        print(f"[TTS-DEMO]   - request.lang: '{request.lang}' (type: {type(request.lang).__name__})")
        print(f"[TTS-DEMO]   - tts_lang (после маппинга): '{tts_lang}'")
        print(f"[TTS-DEMO]   - Длина текста: {len(request.text)} символов")
        print(f"[TTS-DEMO]   - Текст (первые 100 символов): '{request.text[:100]}'")
        print(f"[TTS-DEMO]   - Текст (полный): '{request.text}'")
        
        tts = gTTS(text=request.text, lang=tts_lang, slow=False)
        tts.save(str(file_path))

        file_size = file_path.stat().st_size if file_path.exists() else 0
        print(f"[TTS-DEMO] Результат:")
        print(f"[TTS-DEMO]   - Файл сохранен: {file_path}")
        print(f"[TTS-DEMO]   - Размер файла: {file_size} байт")
        print(f"[TTS-DEMO]   - Язык gTTS: '{tts_lang}'")
        print(f"[TTS-DEMO]   - URL аудио: media/tts/{filename}")
        print("[TTS-DEMO] ========== КОНЕЦ ЗАПРОСА ==========")
        print("=" * 80)

        audio_url = f"media/tts/{filename}"
        return SpeakResponse(audio_url=audio_url)

    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"[TTS-DEMO ERROR] {str(e)}")
        print(tb)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка синтеза речи: {str(e)}"
        )


@router.post("/speak-and-play")
async def speak_and_play(
    request: SpeakRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Синтез речи и воспроизведение через pygame (для серверного воспроизведения).
    Используется для локального тестирования.
    """
    try:
        from gtts import gTTS
        import pygame

        # Создаём временный файл
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            tmp_path = tmp.name

        # Создаём TTS
        tts = gTTS(text=request.text, lang=request.lang, slow=False)
        tts.save(tmp_path)

        # Воспроизводим в отдельном потоке
        def play_audio_async():
            try:
                pygame.mixer.init()
                pygame.mixer.music.load(tmp_path)
                pygame.mixer.music.play()
                while pygame.mixer.music.get_busy():
                    pygame.time.Clock().tick(10)
                pygame.mixer.quit()
                # Удаляем временный файл
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
            except Exception as e:
                print(f"Ошибка воспроизведения: {e}")

        thread = threading.Thread(target=play_audio_async, daemon=True)
        thread.start()

        return {"message": "Воспроизведение начато"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка: {str(e)}"
        )
