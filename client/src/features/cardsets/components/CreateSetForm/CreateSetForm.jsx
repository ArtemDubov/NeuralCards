import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import TagsInput from "../../../shared/components/TagsInput/TagsInput";
import "./CreateSetForm.css";

const CreateSetForm = ({ formData, onUpdateForm, onCreateSet, onCancel }) => {
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateSet(e);
  };

  return (
    <div className="container-tp9">
      <h2>{t("sets.create.title")}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t("sets.create.placeholder")}
          value={formData.title}
          onChange={(e) => onUpdateForm("set", { title: e.target.value })}
          required
        />

        <TagsInput
          tags={formData.tags}
          setTags={(tags) => onUpdateForm("set", { tags })}
          placeholder={t("sets.create.tags.placeholder")}
        />

        <div className="form-actions">
          <button type="button" className="btn-tp3" onClick={onCancel}>
            {t("cards.cancel")}
          </button>
          <button type="submit" className="btn-tp1">
            {t("sets.create.button")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSetForm;
