import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext"; // ← исправленный путь
import "../../../cardsets/components/CardsetList/CardsetList.css";
import "../../../cardsets/components/ViewSet/ViewSet.css";
import "./SearchResults.css";

const SearchResults = ({
  searchResults,
  isSearching,
  handleViewSet,
  showDeleteModal,
  searchQuery,
}) => {
  const { t } = useLanguage();

  if (!searchResults) return null;

  console.log("🎯 Rendering SearchResults:", {
    query: searchResults.query,
    cardsetsCount: searchResults.cardsets?.length || 0,
    cardsCount: searchResults.cards?.length || 0,
    isSearching,
  });

  return (
    <div className="search-results">
      <h2 className="main-content-title">
        {t("search.resultsFor")} "{searchResults.query}"
      </h2>

      {isSearching && (
        <div className="search-loading">{t("search.searching")}</div>
      )}

      {/* Показываем наборы */}
      <div className="search-section">
        <h3 className="search-section-title">
          {t("search.cardsets")} ({searchResults.cardsets?.length || 0})
        </h3>
        {!searchResults.cardsets || searchResults.cardsets.length === 0 ? (
          <p className="search-no-results">{t("search.noCardsets")}</p>
        ) : (
          <div className="sets-grid">
            {searchResults.cardsets.map((set) => (
              <div key={set.id} className="cardset-item">
                <div className="set-header">
                  <div
                    className="set-content"
                    onClick={() => handleViewSet(set)}
                    style={{ cursor: "pointer", flex: 1 }}
                  >
                    <h3>{set.title}</h3>
                    <span className="cards-count">
                      {set.cards ? set.cards.length : 0} {t("sets.cards_count")}
                    </span>
                  </div>
                  <div className="set-actions">
                    <button
                      className="btn-tp1"
                      onClick={() => handleViewSet(set)}
                    >
                      {t("sets.view")}
                    </button>
                    <button
                      className="btn-tp4"
                      onClick={(e) => {
                        e.stopPropagation();
                        showDeleteModal("set", set.id, set.title);
                      }}
                      title={t("delete")}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {set.tags && set.tags.length > 0 && (
                  <div className="set-tags">
                    {set.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Показываем карточки */}
      <div className="search-section">
        <h3 className="search-section-title">
          {t("search.cards")} ({searchResults.cards?.length || 0})
        </h3>
        {!searchResults.cards || searchResults.cards.length === 0 ? (
          <p className="search-no-results">{t("search.noCards")}</p>
        ) : (
          <div className="search-results-grid">
            {searchResults.cards.map((card) => (
              <div key={card.id} className="search-result-item card-item">
                <div className="search-item-content">
                  <div className="card-sides">
                    <div className="card-side">
                      <strong>{t("card.front")}:</strong>
                      <p>{card.front}</p>
                      {card.imageUrl && (
                        <div className="card-media-preview">
                          <span>🖼️ {t("card.image")}</span>
                        </div>
                      )}
                      {card.audioUrl && (
                        <div className="card-media-preview">
                          <span>🔊 {t("card.audio")}</span>
                        </div>
                      )}
                    </div>
                    <div className="card-side">
                      <strong>{t("card.back")}:</strong>
                      <p>{card.back}</p>
                      {card.backImageUrl && (
                        <div className="card-media-preview">
                          <span>🖼️ {t("card.image")}</span>
                        </div>
                      )}
                      {card.backAudioUrl && (
                        <div className="card-media-preview">
                          <span>🔊 {t("card.audio")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {card.cardsetTitle && (
                    <div className="card-set-info">
                      {t("search.fromSet")}: {card.cardsetTitle}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Общее сообщение если ничего не найдено */}
      {!isSearching &&
        (!searchResults.cardsets || searchResults.cardsets.length === 0) &&
        (!searchResults.cards || searchResults.cards.length === 0) && (
          <div className="search-no-results-overall">
            <p>{t("search.noResults")}</p>
          </div>
        )}
    </div>
  );
};

export default SearchResults;
