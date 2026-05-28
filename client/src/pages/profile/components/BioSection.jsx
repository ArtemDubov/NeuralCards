import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "../../../utils/icons";

/**
 * Компонент секции информации о себе с inline-редактированием
 */
export default function BioSection({ bio, onBioChange }) {
  return (
    <section className="profile-section">
      <h2>
        <FontAwesomeIcon icon={faPen} style={{ marginRight: "8px" }} />О себе
      </h2>
      <textarea
        value={bio || ""}
        onChange={(e) => onBioChange(e.target.value)}
        placeholder="Расскажите о себе..."
        rows={4}
        style={{
          width: "100%",
          resize: "vertical",
          minHeight: "80px",
          background: "var(--nt-surface, #fff)",
          border: "2px solid var(--nt-border-light, #e0e0e0)",
          borderRadius: "var(--nt-border-radius, 8px)",
          color: "var(--nt-text, #333)",
          fontFamily: "inherit",
          fontSize: "var(--nt-font-size-md, 16px)",
          padding: "var(--nt-spacing-sm, 12px) var(--nt-spacing-md, 16px)",
          transition: "all var(--transition-base, 0.2s)",
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--nt-primary, #667eea)";
          e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.15)";
        }}
        onBlurCapture={(e) => {
          e.target.style.borderColor = "var(--nt-border-light, #e0e0e0)";
          e.target.style.boxShadow = "none";
        }}
      />
    </section>
  );
}