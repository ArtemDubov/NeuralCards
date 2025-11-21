import React, { useState, useRef } from "react";
import apiClient from "./api-client";
import "./App.css";
import { TrainingPage } from "./features/training/components/TrainingPage";
import FavoritesPage from "./features/favorites/components/FavoritesPage";
import FavoriteButton from "./features/favorites/components/FavoriteButton";
import { ConfirmationModal } from "./features/shared/components/ConfirmationModal";

function App() {
  const nameInputRef = useRef(null);
  const [email, setEmail] = useState("test3@mail.ru");
  const [password, setPassword] = useState("123456");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("sets");
  const [cardsets, setCardsets] = useState([]);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [selectedSet, setSelectedSet] = useState(null);
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");

  const [isViewCardModalOpen, setIsViewCardModalOpen] = useState(false);
  const [viewedCard, setViewedCard] = useState(null);
  const [isEditCardModalOpen, setIsEditCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null); // ← ДОБАВИТЬ
  const [selectedAudio, setSelectedAudio] = useState(null); // ← ДОБАВИТЬ
  const [isUploading, setIsUploading] = useState(false); // ← ДОБАВИТЬ

  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [cardFrontText, setCardFrontText] = useState("");
  const [cardBackText, setCardBackText] = useState("");
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontAudio, setFrontAudio] = useState(null);
  const [backAudio, setBackAudio] = useState(null);

  const [isLoginForm, setIsLoginForm] = useState(true);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");

  const [errors, setErrors] = useState({});
  const [emailDomain, setEmailDomain] = useState("");
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'set' или 'card'
    id: null,
    title: "",
    message: "",
  });

  const emailDomains = [
    "gmail.com",
    "mail.ru",
    "yandex.ru",
    "rambler.ru",
    "outlook.com",
    "yahoo.com",
    "icloud.com",
    "protonmail.com",
  ];

  // Функция валидации всех данных (интернациональная версия с защитой от всех ошибок)
  const validateForm = () => {
    const newErrors = {};

    // Валидация имени - ТОЛЬКО базовые проверки, так как ошибки уже заблокированы
    if (!registerName.trim()) {
      newErrors.name = "Имя обязательно для заполнения";
    } else if (registerName.trim().length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    // Валидация email (оставляем)
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!registerEmail) {
      newErrors.email = "Email обязателен для заполнения";
    } else if (!emailRegex.test(registerEmail)) {
      newErrors.email =
        "Введите корректный email адрес (только латинские буквы)";
    }

    // Валидация пароля (оставляем)
    if (!registerPassword) {
      newErrors.password = "Пароль обязателен для заполнения";
    } else if (registerPassword.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Показ модального окна удаления
  const showDeleteModal = (type, id, title, message) => {
    setDeleteModal({
      isOpen: true,
      type,
      id,
      title,
      message,
    });
  };

  // Подтверждение удаления
  const handleConfirmDelete = async () => {
    try {
      if (deleteModal.type === "set") {
        await apiClient.delete(`/cardsets/${deleteModal.id}`);
        loadCardsets();
        if (selectedSet && selectedSet.id === deleteModal.id) {
          setSelectedSet(null);
          setActiveTab("sets");
        }
      } else if (deleteModal.type === "card") {
        await apiClient.delete(
          `/cardsets/${selectedSet.id}/cards/${deleteModal.id}`
        );
        const updatedCardsets = await loadCardsets();
        const updatedSet = updatedCardsets.find(
          (set) => set.id === selectedSet.id
        );
        setSelectedSet(updatedSet);
      }

      setDeleteModal({ isOpen: false, type: null, id: null });
    } catch (error) {
      alert("Ошибка удаления: " + error.message);
      setDeleteModal({ isOpen: false, type: null, id: null });
    }
  };

  // Отмена удаления
  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, type: null, id: null });
  };

  // Просмотр карточки
  const handleViewCard = (card) => {
    setViewedCard(card);
    setIsViewCardModalOpen(true);
  };

  // Редактирование карточки
  const handleEditCard = (card) => {
    setEditingCard(card);
    setCardFrontText(card.front);
    setCardBackText(card.back);
    setFrontImage(null);
    setBackImage(null);
    setFrontAudio(null);
    setBackAudio(null);
    setIsViewCardModalOpen(false);
    setIsEditCardModalOpen(true);
  };

  // Сохранение изменений карточки
  const handleUpdateCard = async (e) => {
    e.preventDefault();

    if (!cardFrontText.trim() && !frontImage && !frontAudio) {
      alert("Добавьте хотя бы один элемент на лицевую сторону карточки");
      return;
    }

    if (!cardBackText.trim() && !backImage && !backAudio) {
      alert("Добавьте хотя бы один элемент на обратную сторону карточки");
      return;
    }

    setIsUploading(true);

    try {
      let frontImageUrl = editingCard.imageUrl;
      let backImageUrl = editingCard.backImageUrl;
      let frontAudioUrl = editingCard.audioUrl;
      let backAudioUrl = editingCard.backAudioUrl;

      // Загружаем новые файлы если они есть
      if (frontImage) {
        frontImageUrl = await uploadFile(frontImage);
      }
      if (frontAudio) {
        frontAudioUrl = await uploadFile(frontAudio);
      }
      if (backImage) {
        backImageUrl = await uploadFile(backImage);
      }
      if (backAudio) {
        backAudioUrl = await uploadFile(backAudio);
      }

      await apiClient.put(
        `/cardsets/${selectedSet.id}/cards/${editingCard.id}`,
        {
          front: cardFrontText,
          back: cardBackText,
          imageUrl: frontImageUrl,
          audioUrl: frontAudioUrl,
          backImageUrl: backImageUrl,
          backAudioUrl: backAudioUrl,
        }
      );

      // Закрываем модальное окно и обновляем данные
      setIsEditCardModalOpen(false);
      resetCardForm();

      const updatedCardsets = await loadCardsets();
      const updatedSet = updatedCardsets.find(
        (set) => set.id === selectedSet.id
      );
      setSelectedSet(updatedSet);
    } catch (error) {
      alert("Ошибка обновления карточки: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Обработчик ввода имени
  const handleNameChange = (e) => {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const value = e.target.value;
    const previousValue = registerName;

    // Определяем, какой символ был добавлен
    const isAdding = value.length > previousValue.length;
    const addedChar = isAdding ? value.charAt(cursorPosition - 1) : "";

    if (isAdding) {
      // 1. Проверяем длину
      if (value.length > 16) {
        input.value = previousValue;
        input.selectionStart = cursorPosition - 1;
        input.selectionEnd = cursorPosition - 1;
        return;
      }

      // 2. Если добавляем пробел:
      if (addedChar === " ") {
        // Нельзя пробел в начале
        if (cursorPosition === 1) {
          input.value = previousValue;
          input.selectionStart = 0;
          input.selectionEnd = 0;
          return;
        }

        // Нельзя два пробела подряд
        const charBefore = value.charAt(cursorPosition - 2);
        if (charBefore === " ") {
          input.value = previousValue;
          input.selectionStart = cursorPosition - 1;
          input.selectionEnd = cursorPosition - 1;
          return;
        }

        // Пробел должен быть после буквы
        if (!/\p{L}/u.test(charBefore)) {
          input.value = previousValue;
          input.selectionStart = cursorPosition - 1;
          input.selectionEnd = cursorPosition - 1;
          return;
        }
      }

      // 3. Если добавляем не букву и не пробел - запрещаем
      else if (addedChar !== " " && !/\p{L}/u.test(addedChar)) {
        input.value = previousValue;
        input.selectionStart = cursorPosition - 1;
        input.selectionEnd = cursorPosition - 1;
        return;
      }
    }

    // Разрешаем ввод (включая пробел в конце)
    setRegisterName(value);
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));

    setTimeout(() => {
      input.selectionStart = cursorPosition;
      input.selectionEnd = cursorPosition;
    }, 0);
  };

  // Обработчик изменения email с автодополнением
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setRegisterEmail(value);

    // Показываем dropdown если есть @ и текст после него
    const atIndex = value.indexOf("@");
    if (atIndex !== -1 && value.length > atIndex + 1) {
      const currentDomain = value.substring(atIndex + 1);
      setEmailDomain(currentDomain);
      setShowDomainDropdown(true);
    } else {
      setShowDomainDropdown(false);
    }

    // Очищаем ошибку email при изменении
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  // Выбор домена из списка
  const handleDomainSelect = (domain) => {
    const emailWithoutDomain = registerEmail.split("@")[0];
    setRegisterEmail(`${emailWithoutDomain}@${domain}`);
    setShowDomainDropdown(false);
    setEmailDomain("");
  };

  // Функция регистрации с улучшенной обработкой ошибок
  const handleRegister = async (e) => {
    e.preventDefault();

    // Валидация формы
    if (!validateForm()) {
      return;
    }

    try {
      // Убираем пробел в конце перед отправкой
      const cleanName = registerName.endsWith(" ")
        ? registerName.slice(0, -1)
        : registerName;

      await apiClient.post("/register", {
        email: registerEmail,
        password: registerPassword,
        name: cleanName, // используем очищенное имя
      });

      // Автоматически входим после регистрации
      const loginResponse = await apiClient.post("/login", {
        email: registerEmail,
        password: registerPassword,
      });

      const token = loginResponse.data.token;
      localStorage.setItem("token", token);

      const profileResponse = await apiClient.get("/profile");

      // Устанавливаем состояние как при обычном входе
      setIsLoggedIn(true);
      setUser(profileResponse.data);
      loadCardsets();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;

      if (error.response?.status === 400) {
        if (errorMessage.includes("email") || errorMessage.includes("почт")) {
          setErrors((prev) => ({
            ...prev,
            email: "Пользователь с таким email уже зарегистрирован",
          }));
        } else {
          setErrors((prev) => ({ ...prev, general: errorMessage }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Ошибка регистрации. Попробуйте позже.",
        }));
      }
    }
  };
  // Функция входа
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/login", {
        email,
        password,
      });
      const token = response.data.token;
      localStorage.setItem("token", token);

      const profileResponse = await apiClient.get("/profile");

      setIsLoggedIn(true);
      setUser(profileResponse.data);
      loadCardsets();
    } catch (error) {
      alert(
        "Ошибка входа: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // Удаление карточки
  const handleDeleteCard = async (cardId) => {
    if (window.confirm("Удалить эту карточку?")) {
      try {
        await apiClient.delete(`/cardsets/${selectedSet.id}/cards/${cardId}`);
        const updatedCardsets = await loadCardsets();
        const updatedSet = updatedCardsets.find(
          (set) => set.id === selectedSet.id
        );
        setSelectedSet(updatedSet);
      } catch (error) {
        alert("Ошибка удаления карточки: " + error.message);
      }
    }
  };

  // Удаление набора
  const handleDeleteSet = async (setId) => {
    if (
      window.confirm(
        "Удалить этот набор со всеми карточками? Это действие нельзя отменить."
      )
    ) {
      try {
        await apiClient.delete(`/cardsets/${setId}`);
        loadCardsets();
        if (selectedSet && selectedSet.id === setId) {
          setSelectedSet(null);
          setActiveTab("sets");
        }
      } catch (error) {
        alert("Ошибка удаления набора: " + error.message);
      }
    }
  };

  // Загрузка наборов пользователя
  const loadCardsets = async () => {
    try {
      const response = await apiClient.get("/cardsets");
      setCardsets(response.data);
      return response.data; // ← ДОБАВИТЬ ЭТУ СТРОКУ
    } catch (error) {
      console.error("Ошибка загрузки наборов:", error);
      return []; // ← И ЭТУ
    }
  };

  // Создание нового набора
  const handleCreateSet = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/cardsets", {
        title: newSetTitle,
        description: "Мой новый набор",
        isPublic: false,
      });

      setNewSetTitle("");
      loadCardsets();
      setActiveTab("sets");
      alert("Набор создан!");
    } catch (error) {
      alert("Ошибка создания набора: " + error.message);
    }
  };

  // Добавление карточки в набор
  const handleAddCard = async (e) => {
    e.preventDefault();

    // ВАЛИДАЦИЯ: проверяем что есть хотя бы что-то одно на каждой стороне
    if (!cardFrontText.trim() && !frontImage && !frontAudio) {
      alert("Добавьте хотя бы один элемент на лицевую сторону карточки");
      return;
    }

    if (!cardBackText.trim() && !backImage && !backAudio) {
      alert("Добавьте хотя бы один элемент на обратную сторону карточки");
      return;
    }

    setIsUploading(true);

    try {
      let frontImageUrl = null;
      let backImageUrl = null;
      let frontAudioUrl = null;
      let backAudioUrl = null;

      // Загружаем файлы для лицевой стороны
      if (frontImage) {
        frontImageUrl = await uploadFile(frontImage);
      }
      if (frontAudio) {
        frontAudioUrl = await uploadFile(frontAudio);
      }

      // Загружаем файлы для обратной стороны
      if (backImage) {
        backImageUrl = await uploadFile(backImage);
      }
      if (backAudio) {
        backAudioUrl = await uploadFile(backAudio);
      }

      await apiClient.post(`/cardsets/${selectedSet.id}/cards`, {
        front: cardFrontText,
        back: cardBackText,
        imageUrl: frontImageUrl, // Изображение для лицевой стороны
        audioUrl: frontAudioUrl, // Аудио для лицевой стороны
        backImageUrl: backImageUrl, // Нужно добавить это поле в модель!
        backAudioUrl: backAudioUrl, // И это поле!
      });

      // Закрываем модальное окно и сбрасываем форму
      setIsAddCardModalOpen(false);
      resetCardForm();

      // Обновляем данные
      const updatedCardsets = await loadCardsets();
      const updatedSet = updatedCardsets.find(
        (set) => set.id === selectedSet.id
      );
      setSelectedSet(updatedSet);
    } catch (error) {
      alert("Ошибка добавления карточки: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Функция сброса формы
  const resetCardForm = () => {
    setCardFrontText("");
    setCardBackText("");
    setFrontImage(null);
    setBackImage(null);
    setFrontAudio(null);
    setBackAudio(null);
  };

  // Просмотр набора
  const handleViewSet = (set) => {
    setSelectedSet(set);
    setActiveTab("view-set");
  };

  if (!isLoggedIn) {
    return (
      <div className="app login-container">
        <h1>Neural Trident 🌊</h1>

        <div className="auth-tabs">
          <button
            className={`tab-button ${isLoginForm ? "active" : ""}`}
            onClick={() => setIsLoginForm(true)}
          >
            Вход
          </button>
          <button
            className={`tab-button ${!isLoginForm ? "active" : ""}`}
            onClick={() => setIsLoginForm(false)}
          >
            Регистрация
          </button>
        </div>

        {isLoginForm ? (
          // ФОРМА ВХОДА
          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
            <button type="submit" className="action-button">
              Войти
            </button>
          </form>
        ) : (
          // ФОРМА РЕГИСТРАЦИИ
          <form onSubmit={handleRegister} className="auth-form">
            {/* Поле имени с защитой от ошибок */}
            <div className="input-group">
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Ваше имя (макс. 16 символов)"
                value={registerName}
                onChange={handleNameChange}
                className={`form-input ${errors.name ? "error" : ""}`}
                required
                maxLength={16}
              />
              <div className="input-hint">
                {registerName.length}/16 символов • Только буквы • Начинается с
                буквы • Один пробел/дефис/апостроф между словами
              </div>
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Поле email с автодополнением */}
            <div className="input-group">
              <div className="email-input-wrapper">
                <input
                  type="email"
                  placeholder="Email"
                  value={registerEmail}
                  onChange={handleEmailChange}
                  className={`form-input ${errors.email ? "error" : ""}`}
                  required
                />
                {showDomainDropdown && (
                  <div className="domain-dropdown">
                    {emailDomains
                      .filter((domain) => domain.startsWith(emailDomain))
                      .map((domain) => (
                        <div
                          key={domain}
                          className="domain-option"
                          onClick={() => handleDomainSelect(domain)}
                        >
                          @{domain}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            {/* Поле пароля */}
            <div className="input-group">
              <input
                type="password"
                placeholder="Пароль (минимум 6 символов, буквы и цифры)"
                value={registerPassword}
                onChange={(e) => {
                  setRegisterPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={`form-input ${errors.password ? "error" : ""}`}
                required
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* Общая ошибка */}
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}

            <button type="submit" className="action-button">
              Зарегистрироваться
            </button>
          </form>
        )}

        <p className="test-credentials">
          Тестовый аккаунт: test3@mail.ru / 123456
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Neural Trident 🌊</h1>
        <p className="welcome-text">Добро пожаловать, {user?.name}!</p>
        <button className="logout-button" onClick={() => setIsLoggedIn(false)}>
          Выйти
        </button>
      </header>

      <nav className="nav-buttons">
        <button
          className={`nav-button ${activeTab === "sets" ? "active" : ""}`}
          onClick={() => setActiveTab("sets")}
        >
          Мои наборы
        </button>
        <button
          className={`nav-button ${activeTab === "create" ? "active" : ""}`}
          onClick={() => setActiveTab("create")}
        >
          Создать набор
        </button>
        <button
          className={`nav-button ${activeTab === "training" ? "active" : ""}`}
          onClick={() => setActiveTab("training")}
        >
          Тренировка
        </button>
        <button
          className={`nav-button ${activeTab === "favorites" ? "active" : ""}`}
          onClick={() => setActiveTab("favorites")}
        >
          ⭐ Избранное
        </button>
      </nav>

      <main className="main-content">
        {activeTab === "sets" && (
          <div className="tab-content">
            <h2>Мои наборы карточек</h2>
            {cardsets.length === 0 ? (
              <p className="empty-state">У вас пока нет наборов</p>
            ) : (
              <div className="sets-grid">
                {cardsets.map((set) => (
                  <div key={set.id} className="cardset-item">
                    <div className="set-header">
                      <h3
                        onClick={() => handleViewSet(set)}
                        style={{ cursor: "pointer", flex: 1 }}
                      >
                        {set.title}
                      </h3>
                      <div className="set-actions">
                        <FavoriteButton itemId={set.id} itemType="cardset" />
                        <button
                          className="delete-set-btn"
                          onClick={() => handleDeleteSet(set.id)}
                          title="Удалить набор"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <p
                      className="set-description"
                      onClick={() => handleViewSet(set)}
                      style={{ cursor: "pointer" }}
                    >
                      {set.description}
                    </p>
                    <small
                      className="cards-count"
                      onClick={() => handleViewSet(set)}
                      style={{ cursor: "pointer" }}
                    >
                      Карточек: {set.cards?.length || 0}
                    </small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "create" && (
          <div className="tab-content">
            <h2>Создать новый набор</h2>
            <form onSubmit={handleCreateSet} className="create-form">
              <input
                type="text"
                placeholder="Название набора"
                value={newSetTitle}
                onChange={(e) => setNewSetTitle(e.target.value)}
                className="form-input"
                required
              />
              <button type="submit" className="action-button">
                Создать набор
              </button>
            </form>
          </div>
        )}

        {activeTab === "view-set" && selectedSet && (
          <div className="tab-content">
            <button
              className="back-button"
              onClick={() => setActiveTab("sets")}
            >
              ← Назад к наборам
            </button>
            <h2>{selectedSet.title}</h2>

            <div className="cards-section">
              <h3>Карточки в наборе:</h3>
              {selectedSet.cards && selectedSet.cards.length > 0 ? (
                <div className="cards-list">
                  {selectedSet.cards.map((card) => (
                    <div
                      key={card.id}
                      className="card-item"
                      onClick={() => handleViewCard(card)}
                    >
                      <div className="card-content-wrapper">
                        <div className="card-front">
                          <strong>Вопрос:</strong> {card.front}
                          {card.imageUrl && (
                            <span className="media-badge">🖼️</span>
                          )}
                          {card.audioUrl && (
                            <span className="media-badge">🎵</span>
                          )}
                        </div>
                        <div className="card-back">
                          <strong>Ответ:</strong> {card.back}
                          {card.backImageUrl && (
                            <span className="media-badge">🖼️</span>
                          )}
                          {card.backAudioUrl && (
                            <span className="media-badge">🎵</span>
                          )}
                        </div>
                      </div>
                      <button
                        className="delete-card-btn"
                        onClick={() => handleDeleteCard(card.id)}
                        title="Удалить карточку"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">В этом наборе пока нет карточек</p>
              )}
            </div>

            <button
              className="action-button"
              onClick={() => {
                console.log("Add card button clicked");
                setIsAddCardModalOpen(true);
              }}
            >
              ➕ Добавить карточку
            </button>
            <ConfirmationModal
              isOpen={deleteModal.isOpen}
              onClose={handleCancelDelete}
              onConfirm={handleConfirmDelete}
              title={deleteModal.title}
              message={deleteModal.message}
              confirmText="Удалить"
              cancelText="Отмена"
            />
          </div>
        )}

        {activeTab === "training" && <TrainingPage cardsets={cardsets} />}
        {activeTab === "favorites" && <FavoritesPage />}
      </main>
      {/* Модальное окно добавления карточки */}
      {isAddCardModalOpen && (
        <div className="modal-overlay">
          <div className="card-modal">
            <div className="modal-header">
              <h2>Создание карточки</h2>
              <button
                className="close-button"
                onClick={() => {
                  setIsAddCardModalOpen(false);
                  resetCardForm();
                }}
              >
                ✕
              </button>
            </div>

            <div className="card-sides-container">
              {/* Левая сторона - Лицевая сторона карточки */}
              <div className="card-side front-side">
                <h3>🟦 Лицевая сторона (Вопрос)</h3>

                <div className="side-content">
                  <textarea
                    placeholder="Текст вопроса..."
                    value={cardFrontText}
                    onChange={(e) => setCardFrontText(e.target.value)}
                    className="side-textarea"
                    rows="3"
                  />

                  <div className="file-input-group">
                    <label className="file-input-label">🖼️ Изображение:</label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFrontImage(e.target.files[0])}
                        className="file-input"
                      />
                      {frontImage && (
                        <div className="file-preview">
                          <span>✓ {frontImage.name}</span>
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => setFrontImage(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="file-input-group">
                    <label className="file-input-label">🎵 Аудио:</label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setFrontAudio(e.target.files[0])}
                        className="file-input"
                      />
                      {frontAudio && (
                        <div className="file-preview">
                          <span>✓ {frontAudio.name}</span>
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => setFrontAudio(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Правая сторона - Обратная сторона карточки */}
              <div className="card-side back-side">
                <h3>🟩 Обратная сторона (Ответ)</h3>

                <div className="side-content">
                  <textarea
                    placeholder="Текст ответа..."
                    value={cardBackText}
                    onChange={(e) => setCardBackText(e.target.value)}
                    className="side-textarea"
                    rows="3"
                  />

                  <div className="file-input-group">
                    <label className="file-input-label">🖼️ Изображение:</label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBackImage(e.target.files[0])}
                        className="file-input"
                      />
                      {backImage && (
                        <div className="file-preview">
                          <span>✓ {backImage.name}</span>
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => setBackImage(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="file-input-group">
                    <label className="file-input-label">🎵 Аудио:</label>
                    <div className="file-input-wrapper">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setBackAudio(e.target.files[0])}
                        className="file-input"
                      />
                      {backAudio && (
                        <div className="file-preview">
                          <span>✓ {backAudio.name}</span>
                          <button
                            type="button"
                            className="remove-file-btn"
                            onClick={() => setBackAudio(null)}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="requirements-hint">
                💡 Добавьте хотя бы один элемент на каждую сторону карточки
              </div>
              <div className="modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setIsAddCardModalOpen(false);
                    resetCardForm();
                  }}
                >
                  Отмена
                </button>
                <button
                  className="action-button"
                  onClick={handleAddCard}
                  disabled={isUploading}
                >
                  {isUploading ? "📤 Создание..." : "✅ Создать карточку"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Модальное окно просмотра карточки */}
      {isViewCardModalOpen && viewedCard && (
        <div className="modal-overlay">
          <div className="card-view-modal">
            <div className="modal-header">
              <h2>Просмотр карточки</h2>
              <div className="view-card-actions">
                <button
                  className="edit-card-btn"
                  onClick={() => handleEditCard(viewedCard)}
                  title="Редактировать карточку"
                >
                  ✏️
                </button>
                <button
                  className="close-button"
                  onClick={() => setIsViewCardModalOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="card-view-container">
              <div className="card-view-side front-view">
                <h3>🟦 Вопрос</h3>
                <div className="card-view-content">
                  <p className="card-view-text">{viewedCard.front}</p>

                  {viewedCard.imageUrl && (
                    <div className="card-media">
                      <img
                        src={`http://localhost:5002${viewedCard.imageUrl}`}
                        alt=""
                        className="card-image"
                      />
                    </div>
                  )}

                  {viewedCard.audioUrl && (
                    <div className="card-media">
                      <audio controls className="card-audio">
                        <source
                          src={`http://localhost:5002${viewedCard.audioUrl}`}
                          type="audio/mpeg"
                        />
                        <source
                          src={`http://localhost:5002${viewedCard.audioUrl}`}
                          type="audio/wav"
                        />
                        <source
                          src={`http://localhost:5002${viewedCard.audioUrl}`}
                          type="audio/ogg"
                        />
                        Ваш браузер не поддерживает аудио элемент.
                      </audio>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-view-side back-view">
                <h3>🟩 Ответ</h3>
                <div className="card-view-content">
                  <p className="card-view-text">{viewedCard.back}</p>

                  {viewedCard.backImageUrl && (
                    <div className="card-media">
                      <img
                        src={`http://localhost:5002${viewedCard.backImageUrl}`}
                        alt=""
                        className="card-image"
                      />
                    </div>
                  )}

                  {viewedCard.backAudioUrl && (
                    <div className="card-media">
                      <audio controls className="card-audio">
                        <source
                          src={`http://localhost:5002${viewedCard.backAudioUrl}`}
                          type="audio/mpeg"
                        />
                        <source
                          src={`http://localhost:5002${viewedCard.backAudioUrl}`}
                          type="audio/wav"
                        />
                        <source
                          src={`http://localhost:5002${viewedCard.backAudioUrl}`}
                          type="audio/ogg"
                        />
                        Ваш браузер не поддерживает аудио элемент.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Модальное окно редактирования карточки */}
      {isEditCardModalOpen && editingCard && (
        <div className="modal-overlay">
          <div className="card-modal">
            <div className="modal-header">
              <h2>Редактирование карточки</h2>
              <button
                className="close-button"
                onClick={() => {
                  setIsEditCardModalOpen(false);
                  resetCardForm();
                }}
              >
                ✕
              </button>
            </div>

            {/* ТОТ ЖЕ САМЫЙ КОНТЕНТ КАК В СОЗДАНИИ КАРТОЧКИ */}
            <div className="card-sides-container">
              {/* Левая сторона - Лицевая сторона карточки */}
              <div className="card-side front-side">
                <h3>🟦 Лицевая сторона (Вопрос)</h3>

                <div className="side-content">
                  <textarea
                    placeholder="Текст вопроса..."
                    value={cardFrontText}
                    onChange={(e) => setCardFrontText(e.target.value)}
                    className="side-textarea"
                    rows="3"
                  />

                  {/* ТЕ ЖЕ ПОЛЯ ДЛЯ ФАЙЛОВ */}
                </div>
              </div>

              {/* Правая сторона - Обратная сторона карточки */}
              <div className="card-side back-side">
                <h3>🟩 Обратная сторона (Ответ)</h3>

                <div className="side-content">
                  <textarea
                    placeholder="Текст ответа..."
                    value={cardBackText}
                    onChange={(e) => setCardBackText(e.target.value)}
                    className="side-textarea"
                    rows="3"
                  />

                  {/* ТЕ ЖЕ ПОЛЯ ДЛЯ ФАЙЛОВ */}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="requirements-hint">
                💡 Добавьте хотя бы один элемент на каждую сторону карточки
              </div>
              <div className="modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setIsEditCardModalOpen(false);
                    resetCardForm();
                  }}
                >
                  Отмена
                </button>
                <button
                  className="action-button"
                  onClick={handleUpdateCard}
                  disabled={isUploading}
                >
                  {isUploading ? "📤 Сохранение..." : "💾 Сохранить изменения"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Функция загрузки файла на сервер
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.fileUrl;
};

export default App;
