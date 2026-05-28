import React from "react";
import SetCard from "./SetCard";

/**
 * Sets Section Component - displays a section of card sets
 */
const SetsSection = React.memo(function SetsSection({
  title,
  icon,
  sets,
  isMySet = false,
  isOfficial = false,
  favoriteIds,
  trainingLoading,
  selectedSetId,
  onStartTraining,
  onToggleFavorite,
  onEdit,
  onDelete,
  onCopy,
  emptyMessage,
  onCreateButtonClick,
  currentTheme,
}) {
  if (sets.length === 0) return null;

  return (
    <section className="card-sets-section">
      {title && (
        <h2 className="card-sets-section-title" style={{ 
          color: currentTheme.text,
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          {icon}
          {title}
        </h2>
      )}
      
      {sets.length > 0 ? (
        <div className="card-sets-grid">
          {sets.map((set) => (
            <SetCard
              key={set.id}
              set={set}
              isMySet={isMySet}
              isOfficial={isOfficial}
              favoriteIds={favoriteIds}
              trainingLoading={trainingLoading}
              selectedSetId={selectedSetId}
              onStartTraining={onStartTraining}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEdit}
              onDelete={onDelete}
              onCopy={onCopy}
              currentTheme={currentTheme}
            />
          ))}
        </div>
      ) : (
        <div className="card-set-empty-my-sets">
          <p>{emptyMessage}</p>
          {onCreateButtonClick && (
            <button
              onClick={onCreateButtonClick}
              className="card-sets-empty-create-btn"
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "10px",
                color: "white",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                marginTop: "16px",
                background: `linear-gradient(135deg, var(--nt-primary), var(--nt-secondary))`,
              }}
            >
              Создать мой первый набор
            </button>
          )}
        </div>
      )}
    </section>
  );
});

export default SetsSection;
