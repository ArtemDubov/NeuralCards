import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import CardsetList from "../../../cardsets/components/CardsetList/CardsetList";
import CreateSetForm from "../../../cardsets/components/CreateSetForm/CreateSetForm";
import ViewSet from "../../../cardsets/components/ViewSet/ViewSet";
import { TrainingPage } from "../../../training/components/TrainingPage";
import FavoritesPage from "../../../favorites/components/FavoritesPage";
import "./MainContent.css";

const MainContent = ({
  activeTab,
  cardsets,
  newSetTitle,
  setNewSetTitle,
  selectedSet,
  handleCreateSet,
  handleViewSet,
  handleViewCard,
  showDeleteModal,
  setIsAddCardModalOpen,
  setActiveTab,
  tags,
  setTags,
  isSearching,
  searchResults,
  loadCardsets,
}) => {
  const { t } = useLanguage();

  return (
    <main className="main-content container-tp5">
      {activeTab === "sets" && (
        <div className="tab-content container-tp5">
          {/* ЗАГОЛОВОК С КНОПКОЙ СОЗДАНИЯ */}
          <div className="sets-header">
            <h2 className="main-content-title">
              {searchResults !== null ? (
                <>
                  {t("search.resultsFor")} "{searchResults.query}"
                </>
              ) : (
                t("sets.my_sets")
              )}
            </h2>

            {/* КНОПКА СОЗДАНИЯ - ПОКАЗЫВАЕМ ТОЛЬКО КОГДА НЕ АКТИВЕН ПОИСК */}
            {searchResults === null && (
              <button
                className="btn-tp1"
                onClick={() => setActiveTab("create")}
              >
                {t("navigation.create")}
              </button>
            )}
          </div>

          {/* Индикатор поиска */}
          {isSearching && (
            <div className="search-indicator">🔍 {t("search.in_progress")}</div>
          )}

          {/* Сообщение если ничего не найдено */}
          {searchResults !== null &&
            searchResults.length === 0 &&
            !isSearching && (
              <div className="no-results">
                <div className="no-results-icon">😔</div>
                <h3>{t("search.no_results")}</h3>
                <p>{t("search.try_again")}</p>
              </div>
            )}

          <CardsetList
            cardsets={searchResults !== null ? searchResults : cardsets}
            handleViewSet={handleViewSet}
            showDeleteModal={showDeleteModal}
            onFavoriteUpdate={loadCardsets}
          />
        </div>
      )}

      {activeTab === "create" && (
        <div className="tab-content container-tp5">
          <h2>{t("sets.create.title")}</h2>
          <CreateSetForm
            newSetTitle={newSetTitle}
            setNewSetTitle={setNewSetTitle}
            handleCreateSet={handleCreateSet}
            tags={tags}
            setTags={setTags}
          />
        </div>
      )}

      {activeTab === "view-set" && selectedSet && (
        <ViewSet
          selectedSet={selectedSet}
          setActiveTab={setActiveTab}
          handleViewCard={handleViewCard}
          showDeleteModal={showDeleteModal}
          setIsAddCardModalOpen={setIsAddCardModalOpen}
        />
      )}

      {activeTab === "training" && <TrainingPage cardsets={cardsets} />}
      {activeTab === "favorites" && <FavoritesPage />}
    </main>
  );
};

export default MainContent;
