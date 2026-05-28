import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../../contexts/ThemeContext";
import { cardSetsApi } from "../../features/cardSets/api/cardSetsApi";
import { favoritesApi } from "../../features/favorites";
import TagsOverflow from "../../components/common/TagsOverflow";
import PageShell from "../../components/layout/PageShell";
import SortableGridCard from "../card-sets/SortableGridCard";
import FavoriteSetsList from "./components/FavoriteSetsList";
import FavoriteCardListItem from "./components/FavoriteCardListItem";
import {
  faStar,
  faBook,
  faLayerGroup,
  faList,
  faThLarge,
  faEye,
  faEyeSlash,
} from "../../utils/icons";

export default function FavoritesPage() {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("sets");
  const [sets, setSets] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardViewMode, setCardViewMode] = useState("grid"); // 'grid' | 'list'
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const [setIds, cardIds] = await Promise.all([
        favoritesApi.getList("card_set"),
        favoritesApi.getList("card"),
      ]);

      // Загружаем наборы
      if (setIds.length > 0) {
        const response = await cardSetsApi.getCardSets(true);
        const allSets = response.data;
        setSets(allSets.filter((s) => setIds.includes(s.id)));
      } else {
        setSets([]);
      }

      // Загружаем карточки
      if (cardIds.length > 0) {
        const response = await cardSetsApi.getCardSets(true);
        const allCards = [];
        for (const set of response.data) {
          if (set.cards) {
            for (const card of set.cards) {
              if (cardIds.includes(card.id)) {
                allCards.push({ ...card, setName: set.title, setId: set.id });
              }
            }
          }
        }
        setCards(allCards);
      } else {
        setCards([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (type, id) => {
    try {
      await favoritesApi.remove(type, id);
      if (type === "card_set") {
        setSets(sets.filter((s) => s.id !== id));
      } else {
        setCards(cards.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleToggleCardFavorite = async (cardId) => {
    try {
      await favoritesApi.toggle("card", cardId);
      // Перезагружаем список
      await loadFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  if (loading) {
    return (
      <PageShell currentTheme={currentTheme}>
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: currentTheme.text,
          }}
        >
          Загрузка избранного...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell currentTheme={currentTheme}>
      {/* Заголовок страницы */}
      <div className="page-header-section" style={{ marginBottom: "24px" }}>
        <h1 className="page-title" style={{ color: currentTheme.text }}>
          <FontAwesomeIcon
            icon={faStar}
            style={{ marginRight: "8px", color: "var(--nt-warning)" }}
          />
          Избранное
        </h1>
      </div>

      {/* Табы */}
      <div className="favorites-tabs">
        <button
          onClick={() => setActiveTab("sets")}
          className={`favorites-tab ${activeTab === "sets" ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faBook} style={{ marginRight: "6px" }} />
          Наборы ({sets.length})
        </button>
        <button
          onClick={() => setActiveTab("cards")}
          className={`favorites-tab ${activeTab === "cards" ? 'active' : ''}`}
        >
          <FontAwesomeIcon icon={faLayerGroup} style={{ marginRight: "6px" }} />
          Карточки ({cards.length})
        </button>
        
        {/* Переключатель вида - только для карточек */}
        {activeTab === "cards" && cards.length > 0 && (
          <>
            <div className="card-set-view-divider" />
            <button
              onClick={() => setCardViewMode(cardViewMode === "list" ? "grid" : "list")}
              className="card-set-view-toggle-btn"
              style={{
                background: currentTheme.primary,
                color: "white",
              }}
              title={cardViewMode === "list" ? "Переключить на плитку" : "Переключить на список"}
            >
              <FontAwesomeIcon icon={cardViewMode === "list" ? faList : faThLarge} />
            </button>
            
            <div className="card-set-view-divider" />
            
            <button
              onClick={() => setShowContent(!showContent)}
              className="card-set-eye-toggle-btn"
              style={{
                background: showContent ? "var(--nt-success)" : currentTheme.textMuted,
                color: "white",
              }}
              title={showContent ? "Скрыть содержимое" : "Показать содержимое"}
            >
              <FontAwesomeIcon icon={showContent ? faEye : faEyeSlash} />
            </button>
          </>
        )}
      </div>

      {/* Наборы — только плитка */}
      {activeTab === "sets" && (
        <FavoriteSetsList
          sets={sets}
          currentTheme={currentTheme}
          onRemove={handleRemoveFavorite}
        />
      )}

      {/* Карточки — список/плитка */}
      {activeTab === "cards" &&
        (cards.length === 0 ? (
          <div className="favorites-empty">
            <p style={{ color: currentTheme.textSecondary }}>
              Избранных карточек пока нет
            </p>
            <p style={{ color: currentTheme.textMuted, fontSize: "14px" }}>
              Нажмите на звёздочку у карточки, чтобы добавить её сюда
            </p>
          </div>
        ) : (
          <>
            {cardViewMode === "grid" ? (
              <div className="cards-grid">
                {cards.map((card, index) => (
                  <SortableGridCard
                    key={card.id}
                    card={card}
                    displayIndex={index + 1}
                    currentTheme={currentTheme}
                    showContent={showContent}
                    favoriteCardIds={new Set(cards.map(c => c.id))}
                    onClick={() => {}}
                    onToggleFavorite={handleToggleCardFavorite}
                    onEdit={null}
                    onDelete={null}
                  />
                ))}
              </div>
            ) : (
              <div className="card-set-cards-list">
                {cards.map((card, index) => (
                  <FavoriteCardListItem
                    key={card.id}
                    card={card}
                    index={index}
                    currentTheme={currentTheme}
                    onToggleFavorite={handleToggleCardFavorite}
                  />
                ))}
              </div>
            )}
          </>
        ))}
    </PageShell>
  );
}
