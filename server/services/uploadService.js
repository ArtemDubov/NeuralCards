// server/services/uploadService.js
const uploadRepository = require("../repositories/uploadRepository");

exports.uploadFile = (file) => {
  try {
    console.log("🔍 [SERVICE] Processing uploaded file:", file?.filename);

    if (!file) {
      throw new Error("Файл не загружен");
    }

    return uploadRepository.saveFileInfo(file.filename);
  } catch (error) {
    console.error("❌ [SERVICE] Error uploading file:", error);
    throw error;
  }
};
