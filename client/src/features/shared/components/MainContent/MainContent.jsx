import React, { useState, useMemo } from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import CardSetList from "../../../cardSets/components/CardSetList/CardSetList";
import CreateSetForm from "../../../cardSets/components/CreateSetForm/CreateSetForm";
import ViewSet from "../../../cardSets/components/ViewSet/ViewSet";
import { useCardSets } from "../../../../api/cardSets";
import { useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "../../../../shared/stores/uiStore";
import { useAuthStore } from "../../../../shared/stores/authStore";
import { useAnimationStore } from "../../../../shared/stores/animationStore";

import FavoritesPage from "../../../favorites/components/FavoritesPage";
import { TrainingPage } from "../../../training/components/TrainingPage";
import ProfilePage from "../../../profile/components/ProfilePage/ProfilePage";
import PremiumSettingsPage from "../../../premium/components/PremiumSettingsPage/PremiumSettingsPage";

const MainContent = ({
  activeTab,
  selectedSet,
  onCreateSet,
  onDeleteSet,
  onViewSet,
  setActiveTab,
  forms,
  onUpdateForm,
  onResetForm,
}) => {
  const { t } = useAppStore();
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedSetForTraining, setSelectedSetForTraining] = useState(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const ui = useUIStore();

  const { newlyCreatedSetId, newlyCreatedCardId, recentlyDeletedSetId } =
    useAnimationStore();

  const { data: allSets = [], isLoading, isError, error } = useCardSets();

  const filteredCardSets = useMemo(() => {
    if (showFavorites) {
      return allSets.filter((set) => set.isFavorite === true);
    }
    return allSets;
  }, [allSets, showFavorites]);

  const handleStartTraining = (set) => {
    setSelectedSetForTraining(set);
    setActiveTab("training");
  };

  const handleViewSetFromFavorites = (setInfo) => {
    const fullSet = allSets.find((set) => set.id === setInfo.id);

    if (fullSet) {
      onViewSet(fullSet);
      setActiveTab("view-set");
    } else {
      ui.openModal("viewSet", {
        ...setInfo,
        isFromFavorites: true,
      });
    }
  };

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
                onClick={() => ui.openModal("createSet")}
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
                  queryClient.refetchQueries({ queryKey: ["cardSets"] })
                }
              >
                {t("common.retry")}
              </button>
            </div>
          )}

          {!isLoading && !isError && filteredCardSets.length === 0 && (
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
                  onClick={() => ui.openModal("createSet")}
                >
                  {t("sets.create_first")}
                </button>
              )}
            </div>
          )}

          {!isLoading && !isError && filteredCardSets.length > 0 && (
            <div className="nt-cards-grid">
              <CardSetList
                cardSets={filteredCardSets}
                handleViewSet={onViewSet}
                newlyCreatedSetId={newlyCreatedSetId}
                recentlyDeletedSetId={recentlyDeletedSetId}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

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

  const renderViewSetContent = () => {
    if (!selectedSet) return null;

    return (
      <div className="nt-page__container">
        <ViewSet
          selectedSet={selectedSet}
          setActiveTab={setActiveTab}
          onStartTraining={handleStartTraining}
          newlyCreatedCardId={newlyCreatedCardId}
        />
      </div>
    );
  };

  const renderFavoritesContent = () => {
    return (
      <div className="nt-page__container">
        <FavoritesPage handleViewSet={handleViewSetFromFavorites} />
      </div>
    );
  };

  const renderTrainingContent = () => {
    return (
      <div className="nt-page__container">
        <TrainingPage
          cardSets={allSets}
          selectedSetForTraining={selectedSetForTraining}
          onBackToSets={() => {
            setActiveTab("sets");
            setSelectedSetForTraining(null);
          }}
        />
      </div>
    );
  };

  const renderProfileContent = () => {
    return (
      <div className="nt-page__container">
        <ProfilePage user={user} />
      </div>
    );
  };

  const renderPremiumContent = () => {
    return (
      <div className="nt-page__container">
        <PremiumSettingsPage />
      </div>
    );
  };

  return (
    <main className="nt-main__content">
      {activeTab === "sets" && renderSetsContent()}
      {activeTab === "create" && renderCreateContent()}
      {activeTab === "view-set" && renderViewSetContent()}
      {activeTab === "favorites" && renderFavoritesContent()}
      {activeTab === "training" && renderTrainingContent()}
      {activeTab === "profile" && renderProfileContent()}
      {activeTab === "premium" && renderPremiumContent()}
    </main>
  );
};

export default MainContent;
