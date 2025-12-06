// layouts/MainLayout/MainLayout.jsx
import React from "react";
import { useMainAppLogic } from "./useMainAppLogic";
import Header from "../../features/shared/components/Header/Header";
import Navigation from "../../features/shared/components/Navigation/Navigation";
import MainContent from "../../features/shared/components/MainContent/MainContent";
import { ModalManager } from "../../features/shared/components/ModalManager";

export function MainLayout() {
  const {
    user,
    activeTab,
    forms,
    selectedSet,
    cardsets,
    t,
    handleLogout,
    handleCreateSet,
    handleViewSet,
    handleDeleteSet,
    setActiveTab,
    updateForm,
    resetForm,
    openModal,
    closeModal,
  } = useMainAppLogic();

  return (
    <div className="nt-app">
      <Header user={user} onLogout={handleLogout} setActiveTab={setActiveTab} />
      <div className="">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <MainContent
          activeTab={activeTab}
          selectedSet={selectedSet}
          onCreateSet={handleCreateSet}
          onDeleteSet={handleDeleteSet}
          onViewSet={handleViewSet}
          setActiveTab={setActiveTab}
          forms={forms}
          onUpdateForm={updateForm}
          onResetForm={resetForm}
          openModal={openModal}
          closeModal={closeModal}
          t={t}
        />
      </div>
      <ModalManager />
    </div>
  );
}
