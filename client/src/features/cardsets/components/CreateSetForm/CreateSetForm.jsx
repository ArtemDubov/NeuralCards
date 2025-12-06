import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import TagsInput from "../../../shared/components/TagsInput/TagsInput";

const CreateSetForm = ({
  formData = {},
  onUpdateForm,
  onCreateSet,
  onCancel,
}) => {
  const { t } = useAppStore();

  const safeFormData = {
    title: formData?.title || "",
    tags: formData?.tags || [],
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateSet(e);
  };

  return (
    <div className="nt-content__card">
      <h2 className="nt-util__text-accent nt-util__mb-lg">
        {t("sets.create.title")}
      </h2>
      <form onSubmit={handleSubmit} className="nt-form">
        <div className="nt-form__group">
          <input
            type="text"
            placeholder={t("sets.create.placeholder")}
            value={safeFormData.title}
            onChange={(e) => onUpdateForm("set", { title: e.target.value })}
            className="nt-form__input"
            required
          />
        </div>

        <div className="nt-form__group">
          <TagsInput
            tags={safeFormData.tags}
            setTags={(tags) => onUpdateForm("set", { tags })}
            placeholder={t("sets.create.tags.placeholder")}
          />
        </div>

        <div className="nt-form__group nt-util__flex nt-util__gap-md">
          <button
            type="button"
            className="nt-btn nt-btn--secondary"
            onClick={onCancel}
          >
            {t("cards.cancel")}
          </button>
          <button type="submit" className="nt-btn nt-btn--primary">
            {t("sets.create.button")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSetForm;
