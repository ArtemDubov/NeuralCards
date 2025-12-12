const express = require("express");
const router = express.Router();
const cardController = require("../controllers/cardController");
const authMiddleware = require("../middleware");

// Добавить карточку в набор
router.post("/:setId(\\d+)/cards", authMiddleware, cardController.addCard);

// Обновление карточки
router.put(
  "/:setId(\\d+)/cards/:cardId(\\d+)",
  authMiddleware,
  cardController.updateCard
);

// Удаление карточки
router.delete(
  "/:setId(\\d+)/cards/:cardId(\\d+)",
  authMiddleware,
  cardController.deleteCard
);

// Добавить несколько карточек массово
router.post(
  "/:setId(\\d+)/cards/batch",
  authMiddleware,
  cardController.addBatchCards
);

module.exports = router;
