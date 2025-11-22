import React from "react";
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
  tags, // Добавляем теги
  setTags, // И функцию для их обновления
}) => {
  return (
    <main className="main-content">
      {activeTab === "sets" && (
        <div className="tab-content">
          <h2>Мои наборы карточек</h2>
          <CardsetList
            cardsets={cardsets}
            handleViewSet={handleViewSet}
            showDeleteModal={showDeleteModal}
          />
        </div>
      )}

      {activeTab === "create" && (
        <div className="tab-content">
          <h2>Создать новый набор</h2>
          <CreateSetForm
            newSetTitle={newSetTitle}
            setNewSetTitle={setNewSetTitle}
            tags={tags} // Передаем теги
            setTags={setTags} // И функцию для их обновления
            handleCreateSet={handleCreateSet}
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
