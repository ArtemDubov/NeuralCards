const express = require("express");
const authMiddleware = require("../middleware/auth");
const cardSetsController = require("../controllers/cardSetsController"); // ← ИСПРАВЛЕНО!

const router = express.Router();

// Получить все наборы (публичные и свои)
router.get("/", authMiddleware, cardSetsController.getCardSets);

// Получить набор по ID
router.get("/:id", authMiddleware, cardSetsController.getCardSetById);

// Создать новый набор
router.post("/", authMiddleware, cardSetsController.createCardSet);

// Обновить набор
router.put("/:id", authMiddleware, cardSetsController.updateCardSet);

// Удалить набор
router.delete("/:id", authMiddleware, cardSetsController.deleteCardSet);

// Поиск наборов
router.get("/search/:query", authMiddleware, cardSetsController.searchCardSets);

module.exports = router;
