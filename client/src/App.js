import React, { useState, useEffect, useCallback } from "react";
import apiClient from "./api-client";
import { useLanguage } from "./contexts/LanguageContext";
import "./App.css";

// Импорты стилей (ВАЖНЫЙ ПОРЯДОК!)
import "./styles/Theme.css"; // 1. Базовые переменные
import "./styles/ThemeOcean.css"; // 2. Тема по умолчанию
import "./styles/ThemeDark.css"; // 3. Дополнительные темы
import "./styles/ThemeForest.css";
import "./styles/ThemeSunset.css";
import "./styles/ThemeLight.css";
import "./styles/Global.css"; // 4. Семантические переменные
import "./styles/GlobalBtn.css"; // 5. Стили кнопок
import "./styles/GlobalContainer.css"; // 6. Стили контейнеров

// Импорты компонентов
import { ConfirmationModal } from "./features/shared/components/ConfirmationModal";
import CardModal from "./features/cardsets/components/CardModal/CardModal";
import ViewCardModal from "./features/cardsets/components/ViewCardModal/ViewCardModal";
import Header from "./features/shared/components/Header/Header";
import Navigation from "./features/shared/components/Navigation/Navigation";
import LoginPage from "./features/auth/components/LoginPage/LoginPage";
import MainContent from "./features/shared/components/MainContent/MainContent";
import ProfilePage from "./features/profile/components/ProfilePage/ProfilePage";
import SearchBar from "./features/search/components/SearchBar/SearchBar";
import SearchResults from "./features/search/components/SearchResults/SearchResults";
import { uploadFile } from "./features/shared/utils";

// Импорты кастомных хуков
import {
  useModalManagement,
  useDeleteManagement,
} from "./features/shared/hooks";
import { useCardState, useCardsetsAPI } from "./features/cardsets/hooks";
import useSearch from "./features/search/hooks/useSearch";

function App() {
  const { t } = useLanguage();

  // Состояния аутентификации
  const [email, setEmail] = useState("test3@mail.ru");
  const [password, setPassword] = useState("123456");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("sets");

  // Используем кастомные хуки
  const modalManagement = useModalManagement();
  const cardState = useCardState();
  const deleteManagement = useDeleteManagement();
  const cardsetsAPI = useCardsetsAPI();
  const search = useSearch();

  // Деструктурируем для удобства
  const {
    isViewCardModalOpen,
    setIsViewCardModalOpen,
    viewedCard,
    isEditCardModalOpen,
    setIsEditCardModalOpen,
    editingCard,
    isAddCardModalOpen,
    setIsAddCardModalOpen,
    handleViewCard,
    handleEditCard,
  } = modalManagement;

  const {
    cardFrontText,
    setCardFrontText,
    cardBackText,
    setCardBackText,
    frontImage,
    setFrontImage,
    backImage,
    setBackImage,
    frontAudio,
    setFrontAudio,
    backAudio,
    setBackAudio,
    isUploading,
    setIsUploading,
    resetCardForm,
  } = cardState;

  const { deleteModal, showDeleteModal, handleCancelDelete } = deleteManagement;

  const {
    cardsets,
    newSetTitle,
    setNewSetTitle,
    selectedSet,
    setSelectedSet,
    loadCardsets,
    handleCreateSet,
    tags,
    setTags,
  } = cardsetsAPI;

  const { searchResults, isSearching, handleSearch, clearSearch } = search;

  // Адаптер для SearchBar - преобразует вызов с одним аргументом в вызов с двумя
  const handleSearchForBar = useCallback(
    (query) => {
      console.log("🔄 Starting search for:", query);
      handleSearch(query, "all").catch((error) => {
        console.error("Search failed:", error);
        alert("Ошибка поиска. Проверьте подключение к серверу.");
      });
    },
    [handleSearch]
  );

  // Определяем какие наборы показывать - результаты поиска или все наборы
  const displayedCardsets = searchResults !== null ? searchResults : cardsets;

  // Check authentication on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
        loadCardsets();
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleLogout();
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    clearSearch();
  };

  // Подтверждение удаления
  const handleConfirmDelete = async () => {
    try {
      if (deleteModal.type === "set") {
        await apiClient.delete(`/cardsets/${deleteModal.id}`);
        await loadCardsets();
        // Очищаем поиск при удалении
        clearSearch();
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

      deleteManagement.setDeleteModal({ isOpen: false, type: null, id: null });
    } catch (error) {
      alert("Ошибка удаления: " + error.message);
      deleteManagement.setDeleteModal({ isOpen: false, type: null, id: null });
    }
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
        imageUrl: frontImageUrl,
        audioUrl: frontAudioUrl,
        backImageUrl: backImageUrl,
        backAudioUrl: backAudioUrl,
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

  // Обработчик логина
  const handleLogin = async (loginEmail, loginPassword, registerName) => {
    try {
      // Если передан registerName - это регистрация
      if (registerName) {
        await apiClient.post("/register", {
          email: loginEmail,
          password: loginPassword,
          name: registerName,
        });
      }

      // Вход (после регистрации или обычный вход)
      const response = await apiClient.post("/login", {
        email: loginEmail,
        password: loginPassword,
      });
      const token = response.data.token;
      localStorage.setItem("token", token);

      const profileResponse = await apiClient.get("/profile");
      setIsLoggedIn(true);
      setUser(profileResponse.data);
      await loadCardsets();
    } catch (error) {
      alert("Ошибка: " + (error.response?.data?.error || error.message));
    }
  };

  // Determine what to display in main content
  const renderMainContent = () => {
    // If we have search results, show them
    if (searchResults && activeTab === "sets") {
      return (
        <SearchResults
          searchResults={searchResults}
          isSearching={isSearching}
          handleViewSet={(set) => {
            setSelectedSet(set);
            setActiveTab("view-set");
          }}
          showDeleteModal={showDeleteModal}
          searchQuery={searchResults.query}
        />
      );
    }

    // Regular tab content
    return (
      <MainContent
        activeTab={activeTab}
        cardsets={displayedCardsets} // Исправлено: передаем только cardsets
        newSetTitle={newSetTitle}
        setNewSetTitle={setNewSetTitle}
        selectedSet={selectedSet}
        handleCreateSet={(e) => handleCreateSet(e, setActiveTab)}
        handleViewSet={(set) => {
          setSelectedSet(set);
          setActiveTab("view-set");
        }}
        handleViewCard={handleViewCard}
        showDeleteModal={showDeleteModal}
        setIsAddCardModalOpen={setIsAddCardModalOpen}
        setActiveTab={setActiveTab}
        tags={tags}
        setTags={setTags}
        isSearching={isSearching}
        searchResults={searchResults}
        loadCardsets={loadCardsets}
      />
    );
  };

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
      />
    );
  }

  return (
    <div className="app">
      <Header
        user={user}
        onLogout={handleLogout}
        setActiveTab={setActiveTab}
        onSearch={handleSearch}
      />

      <div className="app-container">
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedSet={selectedSet}
          onSearch={handleSearchForBar}
        />

        {/* Рендерим ProfilePage когда активна вкладка profile */}
        {activeTab === "profile" ? (
          <ProfilePage user={user} />
        ) : (
          renderMainContent()
        )}
      </div>

      {/* Остальной код остается без изменений */}
      <ViewCardModal
        isOpen={isViewCardModalOpen}
        onClose={() => setIsViewCardModalOpen(false)}
        card={viewedCard}
        onEdit={handleEditCard}
      />

      <CardModal
        isOpen={isAddCardModalOpen}
        onClose={() => {
          setIsAddCardModalOpen(false);
          resetCardForm();
        }}
        onSubmit={handleAddCard}
        title="Создание карточки"
        cardFrontText={cardFrontText}
        setCardFrontText={setCardFrontText}
        cardBackText={cardBackText}
        setCardBackText={setCardBackText}
        frontImage={frontImage}
        setFrontImage={setFrontImage}
        backImage={backImage}
        setBackImage={setBackImage}
        frontAudio={frontAudio}
        setFrontAudio={setFrontAudio}
        backAudio={backAudio}
        setBackAudio={setBackAudio}
        isUploading={isUploading}
        submitText={isUploading ? "📤 Создание..." : "✅ Создать карточку"}
      />

      <CardModal
        isOpen={isEditCardModalOpen}
        onClose={() => {
          setIsEditCardModalOpen(false);
          resetCardForm();
        }}
        onSubmit={handleUpdateCard}
        title="Редактирование карточки"
        cardFrontText={cardFrontText}
        setCardFrontText={setCardFrontText}
        cardBackText={cardBackText}
        setCardBackText={setCardBackText}
        frontImage={frontImage}
        setFrontImage={setFrontImage}
        backImage={backImage}
        setBackImage={setBackImage}
        frontAudio={frontAudio}
        setFrontAudio={setFrontAudio}
        backAudio={backAudio}
        setBackAudio={setBackAudio}
        isUploading={isUploading}
        submitText={isUploading ? "📤 Сохранение..." : "💾 Сохранить изменения"}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={deleteModal.title}
        message={deleteModal.message}
        confirmText={t("modal.delete.confirm")}
        cancelText={t("modal.delete.cancel")}
      />
    </div>
  );
}

export default App;
