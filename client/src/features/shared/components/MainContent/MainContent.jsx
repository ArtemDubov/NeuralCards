import React, { useState, useMemo } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import CardsetList from "../../../cardsets/components/CardsetList/CardsetList";
import CreateSetForm from "../../../cardsets/components/CreateSetForm/CreateSetForm";
import ViewSet from "../../../cardsets/components/ViewSet/ViewSet";
import { useFavoriteSets } from "../../../../api/favorites";
import { useCardsets } from "../../../../api/cardsets";
import { useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "../../../../shared/stores/uiStore";
import { useAuthStore } from "../../../../shared/stores/authStore";

import FavoritesPage from "../../../favorites/components/FavoritesPage";
import { TrainingPage } from "../../../training/components/TrainingPage";
import ProfilePage from "../../../profile/components/ProfilePage/ProfilePage";

const MainContent = ({
  activeTab,
  selectedSet,
  onCreateSet,
  onDeleteSet,
  onViewSet,
  setActiveTab,
  setSelectedSetForTraining,
  forms,
  onUpdateForm,
  onResetForm,
}) => {
  const { t } = useAppStore();
  const [showFavorites, setShowFavorites] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const ui = useUIStore(); // ← уже есть

  const { data: cardsets = [], isLoading, isError, error } = useCardsets();

  // Получаем избранные наборы
  const { data: favoriteSets = [] } = useFavoriteSets();

  // Функция для фильтрации наборов - используем useMemo
  const filteredCardsets = useMemo(() => {
    let filtered = cardsets;

    if (showFavorites) {
      const favoriteSetIds = new Set(
        favoriteSets.map((fav) => fav.cardsetId || fav.id || fav.cardset?.id)
      );
      filtered = filtered.filter((set) => favoriteSetIds.has(set.id));
    }

    return filtered;
  }, [cardsets, showFavorites, favoriteSets]);

  const handleStartTraining = (set) => {
    setSelectedSetForTraining(set);
    setActiveTab("training");
  };

  // Функция для просмотра карточки в избранном
  const handleViewCard = (card) => {
    ui.openModal("viewCard", {
      ...card,
      cardsetId: card.cardset?.id,
    });
  };

  // Функция для просмотра набора в избранном
  const handleViewSetFromFavorites = (setInfo) => {
    // Находим полный набор по ID
    const fullSet = cardsets.find((set) => set.id === setInfo.id);

    if (fullSet) {
      // Открываем набор для просмотра
      onViewSet(fullSet);
      // Переключаемся на вкладку просмотра набора
      setActiveTab("view-set");
    } else {
      // Если набор не найден в локальных данных, открываем в модальном окне
      ui.openModal("viewSet", {
        ...setInfo,
        isFromFavorites: true,
      });
    }
  };

  // Рендер для вкладки "Мои наборы"
  const renderSetsContent = () => {
    return (
      <div className="nt-page__container">
        <div className="nt-page__header">
          <h2 className="nt-page__title">
            {showFavorites ? t("sets.favorites.title") : t("sets.my_sets")}
          </h2>

          <div className="nt-page__header-controls">
            <button
              className={`nt-btn nt-btn--gold ${
                showFavorites ? "nt-btn--active" : ""
              }`}
              onClick={() => setShowFavorites(!showFavorites)}
              title={
                showFavorites ? t("sets.show.all") : t("sets.show.favorites")
              }
            >
              ⭐{" "}
              {showFavorites
                ? t("sets.show.all.cards")
                : t("sets.show.favorites.cards")}
            </button>

            {!showFavorites && (
              <button
                className="nt-btn nt-btn--primary"
                onClick={() => ui.openModal("createSet")} // ← ИЗМЕНЕНО ТОЛЬКО ЗДЕСЬ!
              >
                {t("navigation.create")}
              </button>
            )}
          </div>
        </div>

        <div className="nt-content__grid">
          {isLoading && (
            <div className="nt-loader">
              <div className="nt-loader__spinner"></div>
              <p>{t("sets.loading") || "Загрузка наборов..."}</p>
            </div>
          )}

          {isError && (
            <div className="nt-form__error--general">
              ❌ {t("sets.load_error") || "Ошибка загрузки"}
              {error?.message && `: ${error.message}`}
              <button
                className="nt-btn nt-btn--secondary nt-util__mt-sm"
                onClick={() =>
                  queryClient.refetchQueries({ queryKey: ["cardsets"] })
                }
              >
                Повторить
              </button>
            </div>
          )}

          {!isLoading && !isError && filteredCardsets.length === 0 && (
            <div className="nt-util__empty-state">
              <div className="nt-util__empty-icon">
                {showFavorites ? "⭐" : "📚"}
              </div>
              <h3 className="nt-util__empty-title">
                {showFavorites
                  ? t("favorites.sets.empty.title")
                  : t("sets.empty")}
              </h3>
              <p className="nt-util__empty-text">
                {showFavorites
                  ? t("favorites.sets.empty.message")
                  : t("sets.create_first")}
              </p>
              {!showFavorites && (
                <button
                  className="nt-btn nt-btn--primary nt-empty-state__button"
                  onClick={() => ui.openModal("createSet")} // ← ИЛИ ЗДЕСЬ ТОЖЕ МОЖНО ДОБАВИТЬ
                >
                  {t("sets.create.first")}
                </button>
              )}
            </div>
          )}

          {!isLoading && !isError && filteredCardsets.length > 0 && (
            <div className="nt-cards-grid">
              <CardsetList
                cardsets={filteredCardsets}
                handleViewSet={onViewSet}
                showDeleteModal={onDeleteSet}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Рендер для создания набора - ОСТАВЛЯЕМ НА СЛУЧАЙ
  const renderCreateContent = () => {
    return (
      <div className="nt-page__container">
        <div className="nt-page__header">
          <h2 className="nt-page__title">{t("sets.create.title")}</h2>
        </div>

        <div className="nt-content__card">
          <CreateSetForm
            formData={forms.set}
            onUpdateForm={onUpdateForm}
            onCreateSet={onCreateSet}
            onCancel={() => {
              setActiveTab("sets");
              onResetForm("set");
            }}
          />
        </div>
      </div>
    );
  };

  // Рендер для просмотра набора
  const renderViewSetContent = () => {
    if (!selectedSet) return null;

    return (
      <div className="nt-page__container">
        <ViewSet
          selectedSet={selectedSet}
          setActiveTab={setActiveTab}
          onStartTraining={() => handleStartTraining(selectedSet)}
        />
      </div>
    );
  };

  // Рендер для избранного
  const renderFavoritesContent = () => {
    return (
      <div className="nt-page__container">
        <FavoritesPage
          handleViewCard={handleViewCard}
          handleViewSet={handleViewSetFromFavorites} // ← ПЕРЕДАЕМ ФУНКЦИЮ
        />
      </div>
    );
  };

  // Рендер для тренировки
  const renderTrainingContent = () => {
    return (
      <div className="nt-page__container">
        <TrainingPage
          cardsets={cardsets}
          selectedSetForTraining={selectedSet}
          onBackToSets={() => setActiveTab("sets")}
        />
      </div>
    );
  };

  // Рендер для профиля
  const renderProfileContent = () => {
    return (
      <div className="nt-page__container">
        <ProfilePage user={user} />
      </div>
    );
  };

  // Главный рендер
  return (
    <main className="nt-main__content">
      {activeTab === "sets" && renderSetsContent()}
      {activeTab === "create" && renderCreateContent()}
      {activeTab === "view-set" && renderViewSetContent()}
      {activeTab === "favorites" && renderFavoritesContent()}
      {activeTab === "training" && renderTrainingContent()}
      {activeTab === "profile" && renderProfileContent()}
    </main>
  );
};

export default MainContent;
