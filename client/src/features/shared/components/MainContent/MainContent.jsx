import React, { useState } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import CardsetList from "../../../cardsets/components/CardsetList/CardsetList";
import CreateSetForm from "../../../cardsets/components/CreateSetForm/CreateSetForm";
import ViewSet from "../../../cardsets/components/ViewSet/ViewSet";
import "./MainContent.css";

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
  const [showFavorites, setShowFavorites] = useState(false);

  const handleStartTraining = (set) => {
    setSelectedSetForTraining(set);
    setActiveTab("training");
  };

  // Функция для фильтрации наборов
  const getFilteredCardsets = () => {
    let filtered = searchResults !== null ? searchResults.cardsets : cardsets;

    if (showFavorites) {
      filtered = filtered.filter((set) => set.isFavorite);
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
      <div className="tab-content container-tp5">
        <div className="favorites-header">
          <h2 className="main-content-title">⭐ Избранное</h2>
        </div>

        {/* Избранные наборы */}
        <section className="favorites-section">
          <h3>Избранные наборы ({favoriteSets.length})</h3>
          {favoriteSets.length > 0 ? (
            <CardsetList
              cardsets={favoriteSets}
              handleViewSet={onViewSet}
              showDeleteModal={onDeleteSet}
            />
          ) : (
            <p className="empty-state">Нет избранных наборов</p>
          )}
        </section>

        {/* Избранные карточки */}
        <section className="favorites-section">
          <h3>Избранные карточки ({allFavoriteCards.length})</h3>
          {allFavoriteCards.length > 0 ? (
            <div className="cards-grid">
              {allFavoriteCards.map((card) => (
                <div
                  key={`${card.id}-${card.parentSet.id}`}
                  className="card-preview container-tp4"
                >
                  <div className="card-preview-header">
                    <span className="set-badge">
                      Из набора: {card.parentSet.title}
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
            <p className="empty-state">Нет избранных карточек</p>
          )}
        </section>
      </div>
    );
  };

  const filteredCardsets = getFilteredCardsets();

  return (
    <main className="main-content container-tp5">
      {activeTab === "favorites" && renderFavoritesContent()}

      {activeTab === "sets" && (
        <div className="container-tp2">
          <div className="sets-header">
            <h2 className="main-content-title">
              {showFavorites
                ? "⭐ Избранные наборы"
                : searchResults !== null
                ? `Результаты поиска: "${searchResults.query}"`
                : t("sets.my_sets")}
            </h2>

            <div className="sets-header-controls">
              {/* Кнопка переключения избранного */}
              <button
                className={`btn-tp8 ${showFavorites ? "active" : ""}`}
                onClick={() => setShowFavorites(!showFavorites)}
                title={
                  showFavorites ? "Показать все наборы" : "Показать избранное"
                }
              >
                ⭐ {showFavorites ? "Все наборы" : "Избранное"}
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

          {isSearching && (
            <div className="search-indicator">🔍 {t("search.in_progress")}</div>
          )}

          {searchResults !== null &&
            filteredCardsets.length === 0 &&
            !isSearching && (
              <div className="no-results">
                <div className="no-results-icon">😔</div>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить запрос поиска</p>
              </div>
            )}

          {showFavorites && filteredCardsets.length === 0 && !isSearching && (
            <div className="no-results">
              <div className="no-results-icon">⭐</div>
              <h3>Нет избранных наборов</h3>
              <p>Добавьте наборы в избранное, чтобы они отображались здесь</p>
            </div>
          )}

          <CardsetList
            cardsets={filteredCardsets}
            handleViewSet={onViewSet}
            showDeleteModal={onDeleteSet}
          />
        </div>
      )}

      {activeTab === "create" && (
        <div className="tab-content container-tp5">
          <h2>{t("sets.create.title")}</h2>
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
      )}

      {activeTab === "view-set" && selectedSet && (
        <ViewSet
          selectedSet={selectedSet}
          setActiveTab={setActiveTab}
          handleViewCard={onViewCard}
          showDeleteModal={onDeleteCard}
          setIsAddCardModalOpen={onAddCard}
          onStartTraining={() => handleStartTraining(selectedSet)}
          onEditCard={onEditCard}
        />
      )}
    </main>
  );
};

export default MainContent;
