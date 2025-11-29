import React, { memo } from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";

const SearchResults = memo(
  ({ searchResults, isSearching, searchQuery, onViewSet, onViewCard }) => {
    const { t } = useLanguage();

    if (!searchResults) return null;

    const { cardsets, cards, query } = searchResults;
    const hasSets = cardsets.length > 0;
    const hasCards = cards.length > 0;
    const hasResults = hasSets || hasCards;

    if (isSearching) {
      return (
        <div className="search-results">
          <div className="search-results__loading">
            <div className="loading-spinner"></div>
            <p>Поиск "{query}"...</p>
          </div>
        </div>
      );
    }

    if (!hasResults) {
      return (
        <div className="search-results">
          <div className="search-results__empty">
            <div className="empty-icon">🔍</div>
            <h3>{t("search.results.empty.title")}</h3>
            <p>{t("search.results.empty.message", { query })}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="search-results">
        <div className="search-results__header">
          <h2>{t("search.results.title")}</h2>
          <div className="search-results__stats">
            Найдено: {cardsets.length} наборов, {cards.length} карточек
          </div>
        </div>

        {hasSets && (
          <section className="search-results__section">
            <h3>{t("search.results.sets")}</h3>
            <div className="search-results__grid">
              {cardsets.map((set) => (
                <div key={set.id} className="cardset-item container-tp2">
                  <div className="set-header">
                    <div
                      className="set-content"
                      onClick={() => onViewSet(set)}
                      style={{ cursor: "pointer", flex: 1 }}
                    >
                      <h3>{set.title}</h3>
                      <span className="cards-count">
                        {set.cards?.length || 0} {t("sets.cards_count")}
                      </span>
                      {set.tags && set.tags.length > 0 && (
                        <div className="set-tags">
                          {set.tags.map((tag) => (
                            <span key={tag} className="tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="set-actions">
                      <button
                        onClick={() => onViewSet(set)}
                        className="btn-secondary"
                      >
                        Открыть
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {hasCards && (
          <section className="search-results__section">
            <h3>{t("search.results.cards")}</h3>
            <div className="search-results__grid">
              {cards.map((card) => (
                <div key={card.id} className="card-item container-tp2">
                  <div className="card-preview">
                    <div className="card-side">
                      <strong>Лицевая сторона:</strong>
                      <p>{card.front || "—"}</p>
                    </div>
                    <div className="card-side">
                      <strong>Обратная сторона:</strong>
                      <p>{card.back || "—"}</p>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => onViewCard(card)}
                      className="btn-secondary"
                    >
                      Просмотр
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }
);

export default SearchResults;
