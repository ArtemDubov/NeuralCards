import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import PageShell from '../../../components/layout/PageShell';
import TagsOverflow from '../../../components/common/TagsOverflow';
import ViewCardModal from '../../../components/common/ViewCardModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "../../../utils/icons";
import { cardSetsApi } from '../../../features/cardSets/api/cardSetsApi';

// Стили
import './styles/detail-page.css';

// Хуки
import { useCardSetData } from './hooks/useCardSetData';
import { useCardSearch } from './hooks/useCardSearch';
import { useFavorites } from './hooks/useFavorites';
import { useDragAndDrop } from './hooks/useDragAndDrop';

// Компоненты
import SearchBar from './components/SearchBar';
import SearchFiltersModal from './components/SearchFiltersModal';
import ViewControls from './components/ViewControls';
import CardsList from './components/CardsList';
import CardsGrid from './components/CardsGrid';

// Модалки (будут перенесены позже)
import AddCardModal from '../AddCardModal';
import EditCardModal from '../EditCardModal';

/**
 * Главный компонент страницы просмотра набора карточек
 * Объединяет все модули и управляет состоянием
 */
export default function CardSetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const toast = useToast();
  const { user } = useAuth();

  // Состояния UI
  const [viewMode, setViewMode] = useState("list");
  const [showContent, setShowContent] = useState(() => {
    const saved = localStorage.getItem(`card-show-content-${id}`);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [editingCard, setEditingCard] = useState(null);
  const [viewingCard, setViewingCard] = useState(null);
  const [insertPosition, setInsertPosition] = useState(null);

  // Используем хуки
  const { set, cards, setCards, loading, loadSet } = useCardSetData(id, toast, navigate);
  const { 
    searchQuery, 
    setSearchQuery, 
    searchFilters, 
    setSearchFilters, 
    showSearchFilters, 
    setShowSearchFilters, 
    filteredCards 
  } = useCardSearch(cards);
  const { favoriteCardIds, toggleCardFavorite, isFavorite } = useFavorites(id, toast);
  
  // Определяем права доступа
  const isOwner = set && user ? set.author_id === user.id : false;
  const isReadOnly = !isOwner;
  const isDragDisabled = isReadOnly || viewMode === "grid";

  const { sensors, handleDragEnd } = useDragAndDrop(
    filteredCards,
    setCards,
    id,
    isDragDisabled,
    toast
  );

  // Сохраняем showContent в localStorage
  React.useEffect(() => {
    localStorage.setItem(
      `card-show-content-${id}`,
      JSON.stringify(showContent),
    );
  }, [showContent, id]);

  // Обработчики
  const handleEdit = (card) => {
    setEditingCard(card);
  };

  const handleDelete = async (cardId) => {
    try {
      await cardSetsApi.deleteCard(cardId);
      setCards(cards.filter((c) => c.id !== cardId));
      toast.success("Карточка удалена");
    } catch (error) {
      toast.error("Ошибка при удалении карточки");
    }
  };

  const handleView = (card, index) => {
    setViewingCard(card);
  };

  const handleAddCard = () => {
    setInsertPosition({ position: "end" });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: currentTheme.text }}>
        Загрузка...
      </div>
    );
  }

  if (!set) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: currentTheme.text }}>
        Набор не найден
      </div>
    );
  }

  return (
    <PageShell currentTheme={currentTheme}>
      {/* Header набора */}
      <div className="card-set-detail-header">
        <div className="card-set-detail-title-row">
          <h1 style={{ color: currentTheme.text }}>{set.title}</h1>
          <span 
            className="card-set-card-count-badge"
            style={{ 
              color: currentTheme.textMuted 
            }}
          >
            {cards.length} {getCardWord(cards.length)}
          </span>
        </div>
        {set.description && (
          <p 
            className="card-set-description"
            style={{ color: currentTheme.textSecondary }}
          >
            {set.description}
          </p>
        )}
        {/* Теги */}
        {set.tags && set.tags.length > 0 && (
          <TagsOverflow
            tags={set.tags.map((t) => t.name)}
            maxVisible={5}
            currentTheme={currentTheme}
          />
        )}
      </div>

      {/* Панель действий: поиск + переключатель вида */}
      <div className="card-set-detail-action-bar">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
          showSearchFilters={showSearchFilters}
          setShowSearchFilters={setShowSearchFilters}
          filteredCount={filteredCards.length}
          totalCount={cards.length}
          currentTheme={currentTheme}
        />
        
        <ViewControls
          viewMode={viewMode}
          setViewMode={setViewMode}
          showContent={showContent}
          setShowContent={setShowContent}
          currentTheme={currentTheme}
        />
      </div>

      {/* Модалка фильтров поиска */}
      <SearchFiltersModal
        show={showSearchFilters}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
        currentTheme={currentTheme}
      />

      {/* Карточки */}
      {viewMode === "list" ? (
        <CardsList
          cards={filteredCards}
          showContent={showContent}
          isReadOnly={isReadOnly}
          isDragDisabled={isDragDisabled}
          sensors={sensors}
          handleDragEnd={handleDragEnd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onToggleFavorite={toggleCardFavorite}
          favoriteCardIds={favoriteCardIds}
          currentTheme={currentTheme}
          handleAddCardAtIndex={(index) => setInsertPosition({ index, afterCardId: filteredCards[index]?.id })}
        />
      ) : (
        <CardsGrid
          cards={filteredCards}
          showContent={showContent}
          isReadOnly={isReadOnly}
          isDragDisabled={isDragDisabled}
          sensors={sensors}
          handleDragEnd={handleDragEnd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onToggleFavorite={toggleCardFavorite}
          favoriteCardIds={favoriteCardIds}
          currentTheme={currentTheme}
        />
      )}

      {/* Кнопка добавления карточки */}
      {!isReadOnly && (
        <div className="card-set-bottom-add-card-container">
          <button
            onClick={handleAddCard}
            className="card-set-add-card-button"
            style={{
              background: `linear-gradient(135deg, var(--nt-primary), var(--nt-secondary))`,
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: "6px" }} />
            Добавить карточку
          </button>
        </div>
      )}

      {/* Модалки */}
      {insertPosition && (
        <AddCardModal
          onClose={() => setInsertPosition(null)}
          setId={id}
          insertPosition={insertPosition.index}
          onAdd={(newCard) => {
            if (insertPosition.position === "end") {
              setCards([...cards, newCard]);
            } else {
              const index = cards.findIndex(c => c.id === insertPosition.afterCardId);
              const newCards = [...cards];
              newCards.splice(index + 1, 0, newCard);
              setCards(newCards);
            }
            setInsertPosition(null);
          }}
          currentTheme={currentTheme}
        />
      )}

      {editingCard && (
        <EditCardModal
          onClose={() => setEditingCard(null)}
          card={editingCard}
          onUpdate={(updatedCard) => {
            setCards(cards.map(c => c.id === updatedCard.id ? updatedCard : c));
            setEditingCard(null);
          }}
          currentTheme={currentTheme}
        />
      )}

      {viewingCard && (
        <ViewCardModal
          card={viewingCard}
          index={cards.findIndex(c => c.id === viewingCard.id)}
          onClose={() => setViewingCard(null)}
          onEdit={(card) => {
            setViewingCard(null);
            setTimeout(() => setEditingCard(card), 100);
          }}
          isFavorite={favoriteCardIds.has(viewingCard.id)}
          onToggleFavorite={() => toggleCardFavorite(viewingCard.id)}
          currentTheme={currentTheme}
        />
      )}
    </PageShell>
  );
}

// Вспомогательная функция для склонения слова "карточка"
function getCardWord(count) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "карточек";
  if (lastDigit === 1) return "карточка";
  if (lastDigit >= 2 && lastDigit <= 4) return "карточки";
  return "карточек";
}
