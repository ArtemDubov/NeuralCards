// server/controllers/uploadController.js
const uploadService = require("../services/uploadService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Настройка multer (остается в контроллере, т.к. это middleware)
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 1024 },
});

exports.uploadFile = (req, res) => {
  try {
    console.log("🔍 [CONTROLLER] Handling file upload");

    const result = uploadService.uploadFile(req.file);
    res.json(result);
  } catch (error) {
    console.error("❌ [CONTROLLER] Ошибка загрузки:", error);
    if (error.message === "Файл не загружен") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Ошибка загрузки файла" });
  }
};

exports.getUploadMiddleware = () => upload.single("file");
