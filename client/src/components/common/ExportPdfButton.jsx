import React, { useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faSpinner } from "../../utils/icons";
import { statsApi } from "../../features/stats/api/statsApi";
import { generatePdfReport } from "../../utils/exportToPdf";

/**
 * Кнопка экспорта статистики в PDF
 * Загружает данные через API и генерирует PDF через window.print()
 */
export default function ExportPdfButton({ currentTheme, variant = "button" }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await statsApi.getStatsForExport();
      await generatePdfReport(response.data);
    } catch (error) {
      toast.error(
        "Ошибка при генерации PDF: " + (error.message || "Неизвестная ошибка"),
      );
    } finally {
      setLoading(false);
    }
  };

  // Inline variant — compact link-style button for navbars
  if (variant === "inline") {
    return (
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          ...styles.inlineBtn,
          color: currentTheme?.headerText || "#fff",
          opacity: loading ? 0.6 : 1,
        }}
        title="Экспорт в PDF"
      >
        <FontAwesomeIcon
          icon={loading ? faSpinner : faFilePdf}
          spin={loading}
        />
      </button>
    );
  }

  // Default full button
  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        ...styles.button,
        background: loading
          ? "rgba(255,255,255,0.2)"
          : `linear-gradient(135deg, ${currentTheme?.primary || "#3498db"}, ${currentTheme?.secondary || "#2980b9"})`,
      }}
    >
      <FontAwesomeIcon icon={loading ? faSpinner : faFilePdf} spin={loading} />
      {!loading && "Экспорт в PDF"}
    </button>
  );
}

const styles = {
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.1s",
  },
  inlineBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    fontSize: "15px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
};
