import React from "react";
import { useLanguage } from "../../../../contexts/LanguageContext";
import "./CreateSetForm.css";

const CreateSetForm = ({
  newSetTitle,
  setNewSetTitle,
  handleCreateSet,
  tags,
  setTags,
}) => {
  const { t } = useLanguage();

  return (
    <div className="container-tp9">
      <h2>{t("sets.create.title")}</h2>
      <form onSubmit={handleCreateSet}>
        <input
          type="text"
          placeholder={t("sets.create.placeholder")}
          value={newSetTitle}
          onChange={(e) => setNewSetTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder={t("sets.create.tags.placeholder")}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button type="submit" className="btn-tp1">
          {t("sets.create.button")}
        </button>
      </form>
    </div>
  );
};

export default CreateSetForm;
