import React, { useState } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import CardsetList from "../../../cardsets/components/CardsetList/CardsetList";
import CreateSetForm from "../../../cardsets/components/CreateSetForm/CreateSetForm";
import ViewSet from "../../../cardsets/components/ViewSet/ViewSet";
import { useFavorites } from "../../../../contexts/FavoritesContext";

const MainContent = ({
  activeTab,
  cardsets,
  selectedSet,
  searchResults,
  isSearching,

  // Методы
  onCreateSet,
  onDeleteSet,
  onViewSet,
  onAddCard,
  onDeleteCard,
  onViewCard,
  onEditCard,
  setActiveTab,
  setSelectedSetForTraining,

  // Формы
  forms,
  onUpdateForm,
  onResetForm,
}) => {
  const { t } = useLanguage();
  const { isSetFavorite } = useFavorites();
  const [showFavorites, setShowFavorites] = useState(false);

  const handleStartTraining = (set) => {
    setSelectedSetForTraining(set);
    setActiveTab("training");
  };

  // Функция для фильтрации наборов
  const getFilteredCardsets = () => {
    let filtered = searchResults !== null ? searchResults.cardsets : cardsets;

    if (showFavorites) {
      filtered = filtered.filter((set) => isSetFavorite(set.id));
    }

    return filtered;
  };

  // Функция для рендеринга избранного
  const renderFavoritesContent = () => {
    const favoriteSets = cardsets.filter((set) => set.isFavorite);
    const allFavoriteCards = cardsets.flatMap((set) =>
      (set.cards || [])
        .filter((card) => card.isFavorite)
        .map((card) => ({
          ...card,
          parentSet: set,
        }))
    );

    return (
      <div className="page-container favorites-page">
        <div className="page-header">
          <h2>{t("favorites.title")}</h2>
          <div className="favorites-count">
            {favoriteSets.length} {t("favorites.sets.count")},{" "}
            {allFavoriteCards.length} {t("favorites.cards.count")}
          </div>
        </div>

        <div className="content-card">
          {/* Избранные наборы */}
          <section
            className="favorites-section"
            style={{ marginBottom: "2rem" }}
          >
            <h3 style={{ color: "var(--color-gold)", marginBottom: "1rem" }}>
              {t("favorites.sets.title")} ({favoriteSets.length})
            </h3>
            {favoriteSets.length > 0 ? (
              <div className="sets-grid">
                <CardsetList
                  cardsets={favoriteSets}
                  handleViewSet={onViewSet}
                  showDeleteModal={onDeleteSet}
                />
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>{t("favorites.sets.empty.title")}</h3>
                <p>{t("favorites.sets.empty.message")}</p>
              </div>
            )}
          </section>

          {/* Избранные карточки */}
          <section className="favorites-section">
            <h3 style={{ color: "var(--color-gold)", marginBottom: "1rem" }}>
              {t("favorites.cards.title")} ({allFavoriteCards.length})
            </h3>
            {allFavoriteCards.length > 0 ? (
              <div className="cards-grid">
                {allFavoriteCards.map((card) => (
                  <div
                    key={`${card.id}-${card.parentSet.id}`}
                    className="card-preview"
                  >
                    <div className="card-preview-header">
                      <span className="set-badge">
                        {t("favorites.from.set")}: {card.parentSet.title}
                      </span>
                    </div>
                    <div
                      className="card-preview-content"
                      onClick={() => onViewCard(card)}
                    >
                      <div className="card-preview-front">
                        <div className="card-text" title={card.front}>
                          {card.front}
                        </div>
                        <div className="card-media-indicators">
                          {card.imageUrl && (
                            <span className="media-indicator">🖼️</span>
                          )}
                          {card.audioUrl && (
                            <span className="media-indicator">🎵</span>
                          )}
                        </div>
                      </div>
                      <div className="card-preview-back">
                        <div className="card-text" title={card.back}>
                          {card.back}
                        </div>
                        <div className="card-media-indicators">
                          {card.backImageUrl && (
                            <span className="media-indicator">🖼️</span>
                          )}
                          {card.backAudioUrl && (
                            <span className="media-indicator">🎵</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🃏</div>
                <h3>{t("favorites.cards.empty.title")}</h3>
                <p>{t("favorites.cards.empty.message")}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  };

  const filteredCardsets = getFilteredCardsets();

  // Рендер для вкладки "Мои наборы"
  const renderSetsContent = () => {
    return (
      <div className="page-container sets-page">
        <div className="page-header">
          <h2>
            {showFavorites
              ? t("sets.favorites.title")
              : searchResults !== null
              ? t("search.results.title") + `: "${searchResults.query}"`
              : t("sets.my_sets")}
          </h2>

          <div className="sets-header-controls">
            {/* Кнопка переключения избранного */}
            <button
              className={`btn-tp8 ${showFavorites ? "active" : ""}`}
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

            {searchResults === null && !showFavorites && (
              <button
                className="btn-tp1"
                onClick={() => setActiveTab("create")}
              >
                {t("navigation.create")}
              </button>
            )}
          </div>
        </div>

        <div className="content-card">
          {isSearching && (
            <div className="search-indicator">🔍 {t("search.in_progress")}</div>
          )}

          {searchResults !== null &&
            filteredCardsets.length === 0 &&
            !isSearching && (
              <div className="empty-state">
                <div className="empty-icon">😔</div>
                <h3>{t("search.results.empty.title")}</h3>
                <p>{t("search.try_again")}</p>
              </div>
            )}

          {showFavorites && filteredCardsets.length === 0 && !isSearching && (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <h3>{t("favorites.sets.empty.title")}</h3>
              <p>{t("favorites.sets.empty.message")}</p>
            </div>
          )}

          {filteredCardsets.length > 0 && (
            <div className="sets-grid">
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

  // Рендер для создания набора
  const renderCreateContent = () => {
    return (
      <div className="page-container create-page">
        <div className="page-header">
          <h2>{t("sets.create.title")}</h2>
        </div>

        <div className="content-card">
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
      <div className="page-container viewset-page">
        <ViewSet
          selectedSet={selectedSet}
          setActiveTab={setActiveTab}
          handleViewCard={onViewCard}
          showDeleteModal={onDeleteCard}
          setIsAddCardModalOpen={onAddCard}
          onStartTraining={() => handleStartTraining(selectedSet)}
          onEditCard={onEditCard}
        />
      </div>
    );
  };

  return (
    <main className="main-content">
      {activeTab === "favorites" && renderFavoritesContent()}
      {activeTab === "sets" && renderSetsContent()}
      {activeTab === "create" && renderCreateContent()}
      {activeTab === "view-set" && renderViewSetContent()}
    </main>
  );
};

export default MainContent;
