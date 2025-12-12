// server/repositories/uploadRepository.js
const fs = require("fs");
const path = require("path");

// Этот файл будет простым, т.к. multer работает как middleware
// и основная логика в контроллере/сервисе

exports.saveFileInfo = (filename) => {
  // В реальном приложении здесь можно сохранять информацию о файле в БД
  const fileUrl = `/uploads/${filename}`;
  return {
    success: true,
    fileUrl: fileUrl,
    filename: filename,
  };
};
