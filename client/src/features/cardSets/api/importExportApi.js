export const importExportApi = {
  // Экспорт
  exportSet: async (setId, format = "csv") => {
    const token = localStorage.getItem("access_token");
    const response = await fetch(
      `${process.env.REACT_APP_API_URL || "http://localhost:8081"}/api/card-sets/${setId}/export?format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Ошибка экспорта");
    }

    // Скачивание файла
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `set-${setId}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Импорт в существующий набор
  importToSet: async (setId, file, frontLang = "ru", backLang = "ru") => {
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("front_lang", frontLang);
    formData.append("back_lang", backLang);

    const response = await fetch(
      `${process.env.REACT_APP_API_URL || "http://localhost:8081"}/api/card-sets/${setId}/import`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Ошибка импорта");
    }

    return response.json();
  },

  // Импорт в новый набор
  importToNewSet: async (
    title,
    description,
    isPublic,
    file,
    frontLang = "ru",
    backLang = "ru",
  ) => {
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description || "");
    formData.append("is_public", isPublic);
    formData.append("file", file);
    formData.append("front_lang", frontLang);
    formData.append("back_lang", backLang);

    const response = await fetch(
      `${process.env.REACT_APP_API_URL || "http://localhost:8081"}/api/card-sets/import/new`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Ошибка импорта");
    }

    return response.json();
  },
};

export default importExportApi;
