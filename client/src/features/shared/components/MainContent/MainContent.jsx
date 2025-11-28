import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import CardsetList from "../../../cardsets/components/CardsetList/CardsetList";
import CreateSetForm from "../../../cardsets/components/CreateSetForm/CreateSetForm";
import ViewSet from "../../../cardsets/components/ViewSet/ViewSet";
import FavoritesPage from "../../../favorites/components/FavoritesPage";
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
  onEditCard, // Добавляем этот пропс
  setActiveTab,
  setSelectedSetForTraining,

  // Формы
  forms,
  onUpdateForm,
  onResetForm,
}) => {
  const { t } = useLanguage();

  const handleStartTraining = (set) => {
    setSelectedSetForTraining(set);
    setActiveTab("training");
  };

  return (
    <main className="main-content container-tp5">
      {activeTab === "sets" && (
        <div className="tab-content container-tp5">
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

            {searchResults === null && (
              <button
                className="btn-tp1"
                onClick={() => setActiveTab("create")}
              >
                {t("navigation.create")}
              </button>
            )}
          </div>

          {isSearching && (
            <div className="search-indicator">🔍 {t("search.in_progress")}</div>
          )}

          {searchResults !== null &&
            searchResults.cardsets.length === 0 &&
            !isSearching && (
              <div className="no-results">
                <div className="no-results-icon">😔</div>
                <h3>{t("search.no_results")}</h3>
                <p>{t("search.try_again")}</p>
              </div>
            )}

          <CardsetList
            cardsets={
              searchResults !== null ? searchResults.cardsets : cardsets
            }
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
          onEditCard={onEditCard} // Передаем функцию редактирования
        />
      )}

      {activeTab === "favorites" && <FavoritesPage />}
    </main>
  );
};

export default MainContent;
