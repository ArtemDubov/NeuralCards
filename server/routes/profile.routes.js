const express = require("express");
const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");
const profileController = require("../controllers/profileController");

const router = express.Router();

// Получение профиля пользователя
router.get("/", authMiddleware, profileController.getProfile);

// Обновление email с подтверждением пароля
router.put("/email", authMiddleware, profileController.updateEmail);

// Обновление пароля
router.put("/password", authMiddleware, profileController.updatePassword);

// Обновление имени пользователя
router.put("/name", authMiddleware, profileController.updateName);

// Обновление аватара (цвет И/ИЛИ эмодзи ИЛИ фото)
router.patch("/avatar", authMiddleware, profileController.updateAvatar);

// Загрузка фото (отдельный endpoint)
router.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("avatar"),
  profileController.uploadAvatar
);

// Обновление премиум статуса
router.patch("/premium", authMiddleware, profileController.updatePremium);

module.exports = router;
