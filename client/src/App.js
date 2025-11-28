import React from "react";
import { useLanguage } from "./contexts/LanguageContext";
import FavoritesPage from "./features/favorites/components/FavoritesPage";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import "./App.css";

// Импорты стилей
import "./styles/Theme.css";
import "./styles/ThemeOcean.css";
import "./styles/ThemeDark.css";
import "./styles/ThemeForest.css";
import "./styles/ThemeSunset.css";
import "./styles/ThemeLight.css";
import "./styles/Global.css";
import "./styles/GlobalBtn.css";
import "./styles/GlobalContainer.css";

// Импорты компонентов
import { ConfirmationModal } from "./features/shared/components/ConfirmationModal";
import CardModal from "./features/cardsets/components/CardModal/CardModal";
import ViewCardModal from "./features/cardsets/components/ViewCardModal/ViewCardModal";
import Header from "./features/shared/components/Header/Header";
import Navigation from "./features/shared/components/Navigation/Navigation";
import LoginPage from "./features/auth/components/LoginPage/LoginPage";
import MainContent from "./features/shared/components/MainContent/MainContent";
import ProfilePage from "./features/profile/components/ProfilePage/ProfilePage";
import SearchResults from "./features/search/components/SearchResults/SearchResults";
import { TrainingPage } from "./features/training/components/TrainingPage";

// Импорты новых хуков
import { useAuth } from "./hooks/useAuth";
import { useData } from "./hooks/useData";
import { useUI } from "./hooks/useUI";
import apiClient from "./api-client";

function App() {
  const { t } = useLanguage();
  const auth = useAuth();
  const data = useData();
  const ui = useUI();
  console.log("=== APP RENDER ===");
  console.log("activeTab:", ui.activeTab);
  const handleLoginSuccess = () => {
    data.loadCardsets();
  };

  const handleLogoutAndRedirect = () => {
    auth.logout();
    data.clearSearch();
    ui.setActiveTab("sets");
  };

  // Обработчик создания набора
  const handleCreateSet = async (e) => {
    e.preventDefault();

    console.log("🟡 [App] handleCreateSet начал выполнение");
    console.log("📝 [App] Данные формы:", ui.forms.set);

    // Проверка авторизации
    const token = localStorage.getItem("token");
    console.log(
      "🔑 [App] Токен в localStorage:",
      token ? "присутствует" : "ОТСУТСТВУЕТ!"
    );

    if (!token) {
      alert("Ошибка авторизации. Пожалуйста, войдите снова.");
      auth.logout();
      return;
    }

    try {
      console.log("🟡 [App] Начинаем создание набора...");

      const setData = {
        title: ui.forms.set.title,
        description: "Мой новый набор",
        isPublic: false,
        tags: ui.forms.set.tags.map((tag) => ({ name: tag })),
      };

      console.log(
        "📤 [App] Отправляемые данные набора:",
        JSON.stringify(setData, null, 2)
      );

      await data.createSet(setData);

      ui.resetForm("set");
      ui.setActiveTab("sets");
      console.log("✅ [App] Набор успешно создан!");
    } catch (error) {
      console.error("❌ [App] Критическая ошибка создания набора:", error);
      console.error("❌ [App] Детали ошибки:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });
      alert("Ошибка при создании набора: " + error.message);
    }
  };

  // Обработчик добавления карточки
  const handleAddCard = async (formData) => {
    if (!data.selectedSet) return;

    try {
      // Загружаем файлы если есть
      const uploadFile = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data.fileUrl;
      };

      const [frontImageUrl, backImageUrl, frontAudioUrl, backAudioUrl] =
        await Promise.all([
          uploadFile(formData.frontImage),
          uploadFile(formData.backImage),
          uploadFile(formData.frontAudio),
          uploadFile(formData.backAudio),
        ]);

      await data.addCard(data.selectedSet.id, {
        front: formData.frontText,
        back: formData.backText,
        imageUrl: frontImageUrl,
        audioUrl: frontAudioUrl,
        backImageUrl: backImageUrl,
        backAudioUrl: backAudioUrl,
      });

      ui.closeModal("addCard");
      console.log("Карточка успешно добавлена!");
    } catch (error) {
      console.error("Ошибка добавления карточки:", error);
      alert("Ошибка при добавлении карточки: " + error.message);

      // Сбрасываем состояние загрузки в модалке
      // Для этого нам нужно передать callback, но пока просто закроем модалку
      ui.closeModal("addCard");
    }
  };

  // Обработчик редактирования карточки
  const handleEditCard = async (formData) => {
    const editingCard = ui.modals.editCard.card;

    if (!editingCard || !data.selectedSet) return;

    try {
      const uploadFile = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        return response.data.fileUrl;
      };

      // Определяем URL для каждого файла
      // Если выбран новый файл - загружаем его, иначе используем старый URL
      const frontImageUrl = formData.frontImage
        ? await uploadFile(formData.frontImage)
        : editingCard.imageUrl;

      const backImageUrl = formData.backImage
        ? await uploadFile(formData.backImage)
        : editingCard.backImageUrl;

      const frontAudioUrl = formData.frontAudio
        ? await uploadFile(formData.frontAudio)
        : editingCard.audioUrl;

      const backAudioUrl = formData.backAudio
        ? await uploadFile(formData.backAudio)
        : editingCard.backAudioUrl;

      await data.updateCard(data.selectedSet.id, editingCard.id, {
        front: formData.frontText,
        back: formData.backText,
        imageUrl: frontImageUrl,
        audioUrl: frontAudioUrl,
        backImageUrl: backImageUrl,
        backAudioUrl: backAudioUrl,
      });

      ui.closeModal("editCard");
      console.log("Карточка успешно обновлена!");
    } catch (error) {
      console.error("Ошибка обновления карточки:", error);
      alert("Ошибка при обновлении карточки: " + error.message);
      ui.closeModal("editCard");
    }
  };

  // Обработчик удаления
  const handleConfirmDelete = async () => {
    const { type, id } = ui.modals.deleteConfirmation;

    try {
      if (type === "set") {
        await data.deleteSet(id);
        // После удаления набора переходим к списку наборов
        ui.setActiveTab("sets");
      } else if (type === "card") {
        await data.deleteCard(data.selectedSet.id, id);
      }

      ui.closeModal("deleteConfirmation");

      console.log(`${type === "set" ? "Набор" : "Карточка"} успешно удален!`);
    } catch (error) {
      console.error("❌ Детали ошибки удаления:", {
        message: error.message,
        status: error.response?.status,
        responseData: error.response?.data,
        requestUrl: error.config?.url,
        requestMethod: error.config?.method,
        requestData: error.config?.data,
      });

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Неизвестная ошибка сервера";

      alert(`Ошибка при удалении: ${errorMessage}`);
      ui.closeModal("deleteConfirmation");
    }
  };

  const renderMainContent = () => {
    // ДОБАВИТЬ ЭТО УСЛОВИЕ ПЕРВЫМ
    if (ui.activeTab === "favorites") {
      return <FavoritesPage />;
    }

    if (ui.activeTab === "training") {
      return (
        <TrainingPage
          key={`training-${ui.selectedSetForTraining?.id || "no-set"}`}
          cardsets={data.cardsets}
          selectedSetForTraining={ui.selectedSetForTraining}
        />
      );
    }
    if (ui.activeTab === "training") {
      return (
        <TrainingPage
          key={`training-${ui.selectedSetForTraining?.id || "no-set"}`}
          cardsets={data.cardsets}
          selectedSetForTraining={ui.selectedSetForTraining}
        />
      );
    }

    if (data.searchResults && ui.activeTab === "sets") {
      return (
        <SearchResults
          searchResults={data.searchResults}
          isSearching={data.isSearching}
          handleViewSet={(set) => {
            data.setSelectedSet(set);
            ui.setActiveTab("view-set");
          }}
          handleViewCard={(card) => ui.openModal("viewCard", { card })}
          searchQuery={data.searchResults.query}
        />
      );
    }

    return (
      <MainContent
        activeTab={ui.activeTab}
        cardsets={data.cardsets}
        selectedSet={data.selectedSet}
        searchResults={data.searchResults}
        isSearching={data.isSearching}
        // Методы для наборов
        onCreateSet={handleCreateSet}
        onDeleteSet={(setId, title) =>
          ui.openModal("deleteConfirmation", {
            type: "set",
            id: setId,
            title: "Удаление набора",
            message: `Вы уверены, что хотите удалить набор "${title}"?`,
          })
        }
        onViewSet={(set) => {
          data.setSelectedSet(set);
          ui.setActiveTab("view-set");
        }}
        // Методы для карточек
        onAddCard={() => ui.openModal("addCard")}
        onDeleteCard={(cardId) =>
          ui.openModal("deleteConfirmation", {
            type: "card",
            id: cardId,
            title: "Удаление карточки",
            message: "Вы уверены, что хотите удалить эту карточку?",
          })
        }
        onViewCard={(card) => ui.openModal("viewCard", { card })}
        onEditCard={(card) => {
          console.log("Редактирование карточки:", card);
          ui.updateForm("card", {
            frontText: card.front || "",
            backText: card.back || "",
            frontImage: null,
            backImage: null,
            frontAudio: null,
            backAudio: null,
          });
          ui.openModal("editCard", { card });
        }}
        // UI методы
        setActiveTab={ui.setActiveTab}
        setSelectedSetForTraining={ui.setSelectedSetForTraining}
        // Формы
        forms={ui.forms}
        onUpdateForm={ui.updateForm}
        onResetForm={ui.resetForm}
      />
    );
  };

  if (!auth.isLoggedIn) {
    return <LoginPage onAuthSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <FavoritesProvider>
        <Header
          user={auth.user}
          onLogout={handleLogoutAndRedirect}
          setActiveTab={ui.setActiveTab}
          onSearch={data.handleSearch}
        />

        <div className="app-container">
          <Navigation
            activeTab={ui.activeTab}
            setActiveTab={ui.setActiveTab}
            selectedSet={data.selectedSet}
            onSearch={data.handleSearch}
          />

          {ui.activeTab === "profile" ? (
            <ProfilePage user={auth.user} />
          ) : (
            renderMainContent()
          )}
        </div>

        {/* Модальные окна */}
        <ViewCardModal
          isOpen={ui.modals.viewCard.isOpen}
          onClose={() => ui.closeModal("viewCard")}
          card={ui.modals.viewCard.card}
          onEdit={(card) => {
            ui.closeModal("viewCard");
            ui.updateForm("card", {
              frontText: card.front || "",
              backText: card.back || "",
              frontImage: null,
              backImage: null,
              frontAudio: null,
              backAudio: null,
            });
            ui.openModal("editCard", { card });
          }}
        />

        {/* Модалка добавления карточки */}
        <CardModal
          isOpen={ui.modals.addCard.isOpen}
          onClose={() => ui.closeModal("addCard")}
          onSubmit={handleAddCard}
          title="Создание карточки"
          submitText="✅ Создать карточку"
        />

        {/* Модалка редактирования карточки */}
        <CardModal
          isOpen={ui.modals.editCard.isOpen}
          onClose={() => ui.closeModal("editCard")}
          onSubmit={handleEditCard}
          title="Редактирование карточки"
          editingCard={ui.modals.editCard.card}
          submitText="💾 Сохранить изменения"
        />

        <ConfirmationModal
          isOpen={ui.modals.deleteConfirmation.isOpen}
          onClose={() => ui.closeModal("deleteConfirmation")}
          onConfirm={handleConfirmDelete}
          title={ui.modals.deleteConfirmation.title}
          message={ui.modals.deleteConfirmation.message}
          confirmText={t("modal.delete.confirm")}
          cancelText={t("modal.delete.cancel")}
        />
      </FavoritesProvider>
    </div>
  );
}

export default App;
