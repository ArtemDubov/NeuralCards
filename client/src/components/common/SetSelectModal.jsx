import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../contexts/AuthContext";
import { cardSetsApi } from "../../features/cardSets/api/cardSetsApi";
import { faBook, faPlus, faXmark, faCheck, faAward } from "../../utils/icons";

/**
 * Модалка выбора набора карточек.
 * Используется на странице тренировок для выбора набора перед началом.
 * Визуально повторяет стиль страницы «Мои наборы».
 */
export default function SetSelectModal({ onClose, onSelect, currentTheme }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sets, setSets] = useState([]);
  const [officialSets, setOfficialSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async () => {
    try {
      const [setsResponse, officialResponse] = await Promise.all([
        cardSetsApi.getCardSets(true),
        cardSetsApi.getOfficialSets().catch(() => ({ data: [] })),
      ]);
      // Фильтруем только наборы с карточками
      const validSets = setsResponse.data.filter(
        (s) => s.cards && s.cards.length > 0,
      );
      setSets(validSets);
      setOfficialSets(
        (officialResponse.data || []).filter(
          (s) => s.cards && s.cards.length > 0,
        ),
      );
    } catch (error) {
      // Ошибка загрузки наборов обрабатывается через toast в API слое
    } finally {
      setLoading(false);
    }
  };

  const mySets = sets.filter((s) => s.author_id === user?.id);
  const publicSets = sets.filter(
    (s) => s.author_id !== user?.id && !s.is_official,
  );
  const hasAnySets =
    mySets.length > 0 || publicSets.length > 0 || officialSets.length > 0;

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.modal,
          background: currentTheme.surface,
          color: currentTheme.text,
        }}
      >
        {/* Шапка модалки */}
        <div style={styles.header}>
          <h2 style={{ color: currentTheme.text, margin: 0 }}>
            <FontAwesomeIcon icon={faBook} style={{ marginRight: "8px" }} />
            Выберите набор для тренировки
          </h2>
          <button
            onClick={onClose}
            style={{
              ...styles.closeButton,
              background: `${currentTheme.textMuted}20`,
              color: currentTheme.textMuted,
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {loading ? (
          <div style={{ ...styles.loading, color: currentTheme.textMuted }}>
            Загрузка наборов...
          </div>
        ) : !hasAnySets ? (
          /* Нет наборов с карточками */
          <div style={styles.noSetsContainer}>
            <FontAwesomeIcon icon={faBook} style={styles.noSetsIcon} />
            <h3 style={{ color: currentTheme.text, margin: "12px 0 8px" }}>
              Нет наборов для тренировки
            </h3>
            <p
              style={{
                color: currentTheme.textSecondary,
                margin: "0 0 20px",
                fontSize: "14px",
              }}
            >
              Создайте набор и добавьте карточки, чтобы начать тренировку
            </p>
            <div style={styles.noSetsActions}>
              <button
                onClick={() => {
                  onClose();
                  navigate("/card-sets");
                  localStorage.setItem("openCreateModal", "true");
                }}
                style={{
                  ...styles.noSetsBtn,
                  background: currentTheme.primary,
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: "6px" }} />
                Создать набор
              </button>
              <button
                onClick={onClose}
                style={{
                  ...styles.noSetsBtn,
                  background: currentTheme.backgroundSecondary,
                  color: currentTheme.text,
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.body}>
            {/* Официальные наборы (Готовые) */}
            {officialSets.length > 0 && (
              <section style={styles.section}>
                <h3
                  style={{
                    color: currentTheme.text,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faAward}
                    style={{ color: currentTheme.warning || "var(--nt-warning)" }}
                  />
                  Готовые наборы
                </h3>
                <div style={styles.grid}>
                  {officialSets.map((set) => (
                    <div
                      key={set.id}
                      onClick={() => onSelect(set.id)}
                      style={{
                        ...styles.card,
                        ...styles.officialCard,
                        background: currentTheme.surface,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = currentTheme.success;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(46, 204, 113, 0.4)";
                      }}
                    >
                      <div style={styles.officialBadgeContainer}>
                        <span style={styles.officialBadge}>
                          <FontAwesomeIcon
                            icon={faCheck}
                            style={{ marginRight: "3px" }}
                          />
                          От разработчиков
                        </span>
                      </div>
                      <div style={styles.cardTop}>
                        <div
                          style={{
                            ...styles.iconBox,
                            background: `${currentTheme.success}15`,
                            color: currentTheme.success,
                          }}
                        >
                          <FontAwesomeIcon icon={faBook} />
                        </div>
                        <div style={styles.cardText}>
                          <h4
                            style={{ color: currentTheme.success, margin: 0 }}
                          >
                            {set.title}
                          </h4>
                          <p
                            style={{
                              color: currentTheme?.textSecondary || "#666",
                              margin: "4px 0 0 0",
                              fontSize: "12px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {set.description || "Нет описания"}
                          </p>
                        </div>
                      </div>
                      <p
                        style={{
                          ...styles.meta,
                          color: currentTheme.textMuted,
                          margin: "8px 0 0 0",
                        }}
                      >
                        {set.cards.length} карточек
                      </p>
                      <button
                        style={{
                          ...styles.selectButton,
                          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                        }}
                      >
                        Выбрать
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Мои наборы */}
            <section style={styles.section}>
              <h3 style={{ color: currentTheme.text }}>Мои наборы</h3>
              {mySets.length > 0 ? (
                <div style={styles.grid}>
                  {mySets.map((set) => (
                    <div
                      key={set.id}
                      onClick={() => onSelect(set.id)}
                      style={{
                        ...styles.card,
                        background: currentTheme.surface,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = currentTheme.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--nt-border, #e0e0e0)";
                      }}
                    >
                      <div style={styles.cardTop}>
                        <div
                          style={{
                            ...styles.iconBox,
                            background: `${currentTheme.primary}15`,
                            color: currentTheme.primary,
                          }}
                        >
                          <FontAwesomeIcon icon={faBook} />
                        </div>
                        <div style={styles.cardText}>
                          <h4
                            style={{ color: currentTheme.primary, margin: 0 }}
                          >
                            {set.title}
                          </h4>
                          <p
                            style={{
                              color: currentTheme?.textSecondary || "#666",
                              margin: "4px 0 0 0",
                              fontSize: "12px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {set.description || "Нет описания"}
                          </p>
                        </div>
                      </div>
                      <p
                        style={{
                          ...styles.meta,
                          color: currentTheme.textMuted,
                          margin: "8px 0 0 0",
                        }}
                      >
                        {set.cards.length} карточек
                      </p>
                      <button
                        style={{
                          ...styles.selectButton,
                          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                        }}
                      >
                        Выбрать
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <p style={{ color: currentTheme.textMuted }}>
                    У вас пока нет наборов
                  </p>
                  <button
                    onClick={() => {
                      localStorage.setItem("openCreateModal", "true");
                      navigate("/card-sets");
                    }}
                    style={{
                      ...styles.emptyCreateButton,
                      background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faPlus}
                      style={{ marginRight: "6px" }}
                    />
                    Создать мой первый набор
                  </button>
                </div>
              )}
            </section>

            {/* Публичные наборы */}
            {publicSets.length > 0 && (
              <section style={styles.section}>
                <h3 style={{ color: currentTheme.text }}>Публичные наборы</h3>
                <div style={styles.grid}>
                  {publicSets.map((set) => (
                    <div
                      key={set.id}
                      onClick={() => onSelect(set.id)}
                      style={{
                        ...styles.card,
                        background: currentTheme.surface,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = currentTheme.success;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--nt-border, #e0e0e0)";
                      }}
                    >
                      <div style={styles.cardTop}>
                        <div
                          style={{
                            ...styles.iconBox,
                            background: `${currentTheme.success}15`,
                            color: currentTheme.success,
                          }}
                        >
                          <FontAwesomeIcon icon={faBook} />
                        </div>
                        <div style={styles.cardText}>
                          <h4
                            style={{ color: currentTheme.success, margin: 0 }}
                          >
                            {set.title}
                          </h4>
                          <p
                            style={{
                              color: currentTheme?.textSecondary || "#666",
                              margin: "4px 0 0 0",
                              fontSize: "12px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {set.description || "Нет описания"}
                          </p>
                        </div>
                      </div>
                      <p
                        style={{
                          ...styles.meta,
                          color: currentTheme.textMuted,
                          margin: "8px 0 0 0",
                        }}
                      >
                        {set.cards.length} карточек
                      </p>
                      <button
                        style={{
                          ...styles.selectButton,
                          background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                        }}
                      >
                        Выбрать
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {sets.length === 0 && officialSets.length === 0 && (
              <div style={styles.emptyState}>
                <p style={{ color: currentTheme.textMuted }}>
                  Нет доступных наборов
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    width: "90%",
    maxWidth: "900px",
    maxHeight: "85vh",
    borderRadius: "16px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--nt-card-shadow, 0 8px 32px rgba(0,0,0,0.3))",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid var(--nt-border, #ddd)",
  },
  closeButton: {
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    transition: "background 0.2s",
  },
  body: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
  },
  section: {
    marginBottom: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "16px",
  },
  card: {
    padding: "16px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    border: `2px solid var(--nt-border, #e0e0e0)`,
    transition: "border-color 0.2s",
  },
  officialCard: {
    border: `2px solid rgba(46, 204, 113, 0.4)`,
  },
  officialBadgeContainer: {
    marginBottom: "8px",
  },
  officialBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 8px",
    background: "rgba(var(--nt-success-rgb, 46, 204, 113), 0.1)",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--nt-success, #2ecc71)",
  },
  cardTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "8px",
  },
  iconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    fontSize: "13px",
    marginTop: "4px",
  },
  selectButton: {
    marginTop: "12px",
    padding: "8px 20px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    width: "100%",
  },
  emptyState: {
    textAlign: "center",
    padding: "30px 20px",
  },
  emptyCreateButton: {
    padding: "10px 20px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "12px",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "16px",
  },
  noSetsContainer: {
    padding: "40px 24px",
    textAlign: "center",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  noSetsIcon: {
    fontSize: "48px",
    color: "#999",
  },
  noSetsActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
  },
  noSetsBtn: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
};
