const express = require("express");
const authMiddleware = require("../middleware/auth");
const favoritesController = require("../controllers/favoritesController");

const router = express.Router();

// Получить все избранные наборы пользователя
router.get("/", authMiddleware, favoritesController.getFavorites);

// Получить все избранные карточки пользователя
router.get("/cards", authMiddleware, favoritesController.getFavoriteCards);

// Добавить набор в избранное
router.post("/sets", authMiddleware, favoritesController.addFavoriteCardSet); // ← ИСПРАВЛЕНО!

// Добавить карточку в избранное
router.post("/cards", authMiddleware, favoritesController.addFavoriteCard);

// Удалить набор из избранного (по ID записи)
router.delete(
  "/sets/:favoriteId",
  authMiddleware,
  favoritesController.removeFavoriteCardSet
);

// Удалить карточку из избранного (по ID записи)
router.delete(
  "/cards/:favoriteId",
  authMiddleware,
  favoritesController.removeFavoriteCard
);

// Проверить, добавлен ли набор в избранное
router.get(
  "/check/set/:setId",
  authMiddleware,
  favoritesController.checkFavoriteCardSet
);

// Проверить, добавлена ли карточка в избранное
router.get(
  "/check/card/:cardId",
  authMiddleware,
  favoritesController.checkFavoriteCard
);

// Удалить набор из избранного по ID набора
router.delete(
  "/sets/byset/:setId",
  authMiddleware,
  favoritesController.removeFavoriteCardSetBySetId
);

// Удалить карточку из избранного по ID карточки
router.delete(
  "/cards/bycard/:cardId",
  authMiddleware,
  favoritesController.removeFavoriteCardByCardId
);

module.exports = router;
