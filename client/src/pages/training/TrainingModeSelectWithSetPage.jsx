import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useToast } from "../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ModeSelectModal from "../../components/common/ModeSelectModal";
import PageShell from "../../components/layout/PageShell";
import { trainingApi } from "../../features/training/api/trainingApi";
import { faDumbbell } from "../../utils/icons";

/**
 * TrainingModeSelectWithSetPage - страница выбора режима тренировки для конкретного набора
 * Используется при переходе по маршруту /training/mode-select/:setId
 */
export default function TrainingModeSelectWithSetPage() {
  const navigate = useNavigate();
  const { setId } = useParams();
  const { currentTheme } = useTheme();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleModeSelect = async (mode) => {
    if (!setId) return;
    setLoading(true);
    try {
      localStorage.setItem("lastSelectedSetId", setId);

      // Practice mode - прямой переход без создания сессии
      if (mode === "practice") {
        navigate(`/training/practice/${setId}`);
        return;
      }

      // Quiz mode - прямой переход без создания сессии
      if (mode === "quiz") {
        navigate(`/training/quiz/${setId}`);
        return;
      }

      // Marathon mode - прямой переход без создания сессии
      if (mode === "marathon") {
        navigate(`/training/marathon/${setId}`);
        return;
      }

      // Dictation mode - прямой переход без создания сессии
      if (mode === "dictation") {
        navigate(`/training/dictation/${setId}`);
        return;
      }

      // Matching mode - прямой переход без создания сессии
      if (mode === "matching") {
        navigate(`/training/matching/${setId}`);
        return;
      }

      // Для других режимов создаем сессию
      const session = await trainingApi.createSession({
        card_set_id: parseInt(setId),
        mode: mode,
      });

      navigate(`/training/${mode}/${session.data.id}`);
    } catch (error) {
      console.error("Error starting training:", error);
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
      <div className="page-header-section">
        <h1 className="page-title" style={{ color: currentTheme.text }}>
          <FontAwesomeIcon icon={faDumbbell} style={{ marginRight: "8px" }} />
          Выбор режима тренировки
        </h1>
        <p className="page-subtitle" style={{ color: currentTheme.textSecondary }}>
          Выберите подходящий режим для вашего набора
        </p>
      </div>

      <ModeSelectModal
        onClose={() => navigate("/card-sets")}
        onSelectMode={handleModeSelect}
        currentTheme={currentTheme}
        loading={loading}
      />
    </PageShell>
  );
}
