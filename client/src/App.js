import React, { useState } from "react";
import apiClient from "./api-client";
import "./App.css";
import "./styles/Global.css";
import "./styles/GlobalBtn.css";

// Импорты компонентов
import { ConfirmationModal } from "./features/shared/components/ConfirmationModal";
import CardModal from "./features/cardsets/components/CardModal/CardModal";
import ViewCardModal from "./features/cardsets/components/ViewCardModal/ViewCardModal";
import Header from "./features/shared/components/Header/Header";
import Navigation from "./features/shared/components/Navigation/Navigation";
import LoginPage from "./features/auth/components/LoginPage/LoginPage";
import MainContent from "./features/shared/components/MainContent/MainContent";
import ProfilePage from "./features/profile/components/ProfilePage/ProfilePage"; // Добавлен импорт
import { uploadFile } from "./features/shared/utils";

// Импорты кастомных хуков через index
import {
  useModalManagement,
  useDeleteManagement,
} from "./features/shared/hooks";
import { useCardState, useCardsetsAPI } from "./features/cardsets/hooks";
import useSearch from "./features/search/hooks/useSearch"; // Добавляем хук поиска

function App() {
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
  const search = useSearch(); // Добавляем хук поиска

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

  // Определяем какие наборы показывать - результаты поиска или все наборы
  const displayedCardsets = searchResults !== null ? searchResults : cardsets;

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
      <Header user={user} onLogout={() => setIsLoggedIn(false)} />
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={handleSearch} // Передаем функцию поиска
      />

      {/* Рендерим ProfilePage когда активна вкладка profile */}
      {activeTab === "profile" ? (
        <ProfilePage user={user} />
      ) : (
        <MainContent
          activeTab={activeTab}
          cardsets={displayedCardsets}
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
          isSearching={isSearching} // Добавляем
          searchResults={searchResults} // Добавляем
        />
      )}

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
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
}

export default App;
