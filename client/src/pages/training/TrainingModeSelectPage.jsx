import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { trainingApi } from "../../features/training/api/trainingApi";
import PageShell from "../../components/layout/PageShell";
import SetSelectModal from "../../components/common/SetSelectModal";
import {
  faBolt,
  faBullseye,
  faHourglassHalf,
  faBookOpen,
  faRoute,
  faHeadphones,
  faPuzzlePiece,
  faDumbbell,
} from "../../utils/icons";

export default function TrainingModeSelectPage() {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);

  const modes = [
    {
      id: "practice",
      name: "Practice",
      icon: faBookOpen,
      description: "Простое запоминание: смотрите карточку и открывайте ответ",
      color: "#3498db",
    },
    {
      id: "quiz",
      name: "Quiz",
      icon: faBullseye,
      description: "Выберите правильный ответ из 4 вариантов",
      color: "#9b59b6",
    },
    {
      id: "marathon",
      name: "Marathon",
      icon: faRoute,
      description: "Пройти весь набор карточек подряд",
      color: "#2ecc71",
    },
    {
      id: "dictation",
      name: "Dictation",
      icon: faHeadphones,
      description: "Слушайте аудио и вводите слово — тренировка на слух",
      color: "#e67e22",
    },
    {
      id: "matching",
      name: "Matching",
      icon: faPuzzlePiece,
      description: "Соединяйте пары слов на скорость",
      color: "#1abc9c",
    },
  ];

  const startTraining = (mode) => {
    setPendingMode(mode);
    setShowSetModal(true);
  };

  const handleSetSelect = (selectedSetId) => {
    setShowSetModal(false);
    if (pendingMode) {
      localStorage.setItem("lastSelectedSetId", selectedSetId);
      launchTraining(selectedSetId, pendingMode);
      setPendingMode(null);
    }
  };

  const launchTraining = async (selectedSetId, mode) => {
    setLoading(true);
    try {
      // Practice mode
      if (mode === "practice") {
        navigate(`/training/practice/${selectedSetId}`);
        return;
      }

      // Quiz mode
      if (mode === "quiz") {
        navigate(`/training/quiz/${selectedSetId}`);
        return;
      }

      // Marathon mode
      if (mode === "marathon") {
        navigate(`/training/marathon/${selectedSetId}`);
        return;
      }

      // Deleted Sprint mode navigation

      // Dictation mode
      if (mode === "dictation") {
        navigate(`/training/dictation/${selectedSetId}`);
        return;
      }

      // Matching mode
      if (mode === "matching") {
        navigate(`/training/matching/${selectedSetId}`);
        return;
      }

      const session = await trainingApi.createSession({
        card_set_id: parseInt(selectedSetId),
        mode: mode,
      });

      navigate(`/training/${mode}/${session.data.id}`);
    } catch (error) {
      toast.error(
        "Ошибка при запуске тренировки: " +
          (error.response?.data?.detail || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell currentTheme={currentTheme}>
      <div className="training-mode-select-container">
        <div className="page-header-section">
          <h1 className="page-title" style={{ color: currentTheme.text }}>
            <FontAwesomeIcon icon={faDumbbell} style={{ marginRight: "8px" }} />
            Тренировка
          </h1>
          <p className="page-subtitle" style={{ color: currentTheme.textSecondary }}>
            Выберите режим тренировки
          </p>
        </div>

        <div className="training-modes-grid">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className="nt-mode-card"
              style={{
                background: `linear-gradient(135deg, ${mode.color}, ${mode.color}dd)`,
              }}
              onClick={() => !loading && startTraining(mode.id)}
            >
              {/* Верхняя часть */}
              <div>
                <div className="nt-mode-card-icon">
                  <FontAwesomeIcon icon={mode.icon} />
                </div>
                <div className="nt-mode-card-title">{mode.name}</div>
                <div className="nt-mode-card-desc">{mode.description}</div>
              </div>

              {/* Нижняя часть — кнопка */}
              <div className="training-mode-action">
                {loading ? (
                  <span className="nt-mode-card-badge" style={{ opacity: 0.6 }}>
                    <FontAwesomeIcon
                      icon={faHourglassHalf}
                      style={{ marginRight: "4px" }}
                    />
                    Запуск...
                  </span>
                ) : (
                  <span className="nt-mode-card-badge">Начать →</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {showSetModal && (
          <SetSelectModal
            onClose={() => {
              setShowSetModal(false);
              setPendingMode(null);
            }}
            onSelect={handleSetSelect}
            currentTheme={currentTheme}
          />
        )}
      </div>
    </PageShell>
  );
}
