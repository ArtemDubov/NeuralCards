import React from "react";
import "./CreateSetForm.css";

const CreateSetForm = ({ newSetTitle, setNewSetTitle, handleCreateSet }) => {
  return (
    <form onSubmit={handleCreateSet} className="create-form">
      <input
        type="text"
        placeholder="Название набора"
        value={newSetTitle}
        onChange={(e) => setNewSetTitle(e.target.value)}
        className="form-input"
        required
      />
      <button type="submit" className="action-button">
        Создать набор
      </button>
    </form>
  );
};

export default CreateSetForm;
