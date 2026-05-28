import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import PageShell from "../../components/layout/PageShell";
import { useCardSetsLogic } from "./hooks/useCardSetsLogic";
import {
  HeaderActions,
  SearchBar,
  SetsSection,
} from "./components";
import CreateSetModal from "./CreateSetModal";
import EditSetModal from "./EditSetModal";
import ImportModal from "./ImportModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import ModeSelectModal from "../../components/common/ModeSelectModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faShieldHalved } from "../../utils/icons";

/**
 * CardSetsListPage - Refactored
 * Main component that orchestrates card sets list functionality
 */
export default function CardSetsListPage() {
  const { currentTheme } = useTheme();
  
  // All logic extracted to custom hook
  const {
    favoriteIds,
    searchQuery,
    showCreateModal,
    showImportModal,
    editingSet,
    showEditModal,
    deleteTargetId,
    deleteLoading,
    trainingLoading,
    selectedSetId,
    showModeModal,
    setShowModeModal,
    user,
    filteredMySets,
    filteredPublicSets,
    filteredOfficialSets,
    setSearchQuery,
    setShowCreateModal,
    setShowImportModal,
    setEditingSet,
    setShowEditModal,
    setDeleteTargetId,
    handleCreate,
    handleUpdate,
    handleImport,
    handleDelete,
    confirmDelete,
    startTraining,
    handleModeSelect,
    handleCopySet,
    toggleFavorite,
  } = useCardSetsLogic();

  return (
    <PageShell currentTheme={currentTheme}>
      {/* Header Actions */}
      <HeaderActions
        onImport={() => setShowImportModal(true)}
        onCreate={() => setShowCreateModal(true)}
        currentTheme={currentTheme}
      />

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentTheme={currentTheme}
      />

      {/* My Sets Section */}
      <SetsSection
        sets={filteredMySets}
        isMySet={true}
        favoriteIds={favoriteIds}
        trainingLoading={trainingLoading}
        selectedSetId={selectedSetId}
        onStartTraining={startTraining}
        onToggleFavorite={toggleFavorite}
        onEdit={(set) => {
          setEditingSet(set);
          setShowEditModal(true);
        }}
        onDelete={handleDelete}
        onCopy={handleCopySet}
        emptyMessage="У вас пока нет наборов"
        onCreateButtonClick={() => setShowCreateModal(true)}
        currentTheme={currentTheme}
      />

      {/* Public Sets Section */}
      <SetsSection
        title="Публичные наборы"
        icon={<FontAwesomeIcon icon={faGlobe} style={{ color: currentTheme.info }} />}
        sets={filteredPublicSets}
        favoriteIds={favoriteIds}
        trainingLoading={trainingLoading}
        selectedSetId={selectedSetId}
        onStartTraining={startTraining}
        onToggleFavorite={toggleFavorite}
        onCopy={handleCopySet}
        emptyMessage="Нет публичных наборов"
        currentTheme={currentTheme}
      />

      {/* Official Sets Section */}
      <SetsSection
        title="Официальные наборы"
        icon={<FontAwesomeIcon icon={faShieldHalved} style={{ color: currentTheme.success }} />}
        sets={filteredOfficialSets}
        isOfficial={true}
        favoriteIds={favoriteIds}
        trainingLoading={trainingLoading}
        selectedSetId={selectedSetId}
        onStartTraining={startTraining}
        onToggleFavorite={toggleFavorite}
        onCopy={handleCopySet}
        emptyMessage="Нет официальных наборов"
        currentTheme={currentTheme}
      />

      {/* Modals */}
      {showCreateModal && (
        <CreateSetModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          currentTheme={currentTheme}
        />
      )}

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          existingSets={filteredMySets}
          currentTheme={currentTheme}
        />
      )}

      {showEditModal && editingSet && (
        <EditSetModal
          set={editingSet}
          onClose={() => {
            setShowEditModal(false);
            setEditingSet(null);
          }}
          onUpdate={handleUpdate}
          currentTheme={currentTheme}
        />
      )}

      {deleteTargetId && (
        <ConfirmModal
          isOpen={!!deleteTargetId}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={() => confirmDelete(deleteTargetId)}
          title="Удалить набор?"
          message="Это действие нельзя отменить. Все карточки в этом наборе будут удалены."
          confirmText="Удалить"
          cancelText="Отмена"
          danger={true}
          loading={deleteLoading}
          currentTheme={currentTheme}
        />
      )}

      {/* Mode Select Modal */}
      {showModeModal && (
        <ModeSelectModal
          onClose={() => setShowModeModal(false)}
          onSelectMode={handleModeSelect}
          currentTheme={currentTheme}
          loading={trainingLoading}
        />
      )}
    </PageShell>
  );
}