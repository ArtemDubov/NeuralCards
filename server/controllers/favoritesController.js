const favoriteService = require("../services/favoriteService");

// Получить все избранные наборы пользователя
exports.getFavorites = async (req, res) => {
  try {
    console.log("🔍 GET /api/favorites - userId:", req.userId);
    const favorites = await favoriteService.getUserFavoriteSets(req.userId);
    console.log("✅ Избранные наборы загружены, количество:", favorites.length);
    res.json(favorites);
  } catch (error) {
    console.error("❌ Ошибка получения избранных наборов:", error);
    res.status(500).json({ error: error.message });
  }
};

// Получить все избранные карточки пользователя
exports.getFavoriteCards = async (req, res) => {
  try {
    console.log("🔍 GET /api/favorites/cards - userId:", req.userId);
    const favorites = await favoriteService.getUserFavoriteCards(req.userId);
    console.log(
      "✅ Избранные карточки загружены, количество:",
      favorites.length
    );
    res.json(favorites);
  } catch (error) {
    console.error("❌ Ошибка получения избранных карточек:", error);
    res.status(500).json({ error: error.message });
  }
};

// Добавить набор в избранное
exports.addFavoriteCardSet = async (req, res) => {
  try {
    const { setId } = req.body;
    console.log(
      "➕ POST /api/favorites/sets - userId:",
      req.userId,
      "setId:",
      setId
    );

    const favorite = await favoriteService.addFavoriteSet(
      req.userId,
      parseInt(setId)
    );
    console.log("✅ Набор добавлен в избранное:", favorite.id);

    res.json({
      success: true,
      message: "Набор добавлен в избранное",
      favorite,
    });
  } catch (error) {
    console.error("❌ Ошибка добавления набора в избранное:", error);
    const status = error.message.includes("required")
      ? 400
      : error.message.includes("already")
      ? 400
      : 500;
    res.status(status).json({ error: error.message });
  }
};

// Добавить карточку в избранное
exports.addFavoriteCard = async (req, res) => {
  try {
    const { cardId } = req.body;
    console.log(
      "➕ POST /api/favorites/cards - userId:",
      req.userId,
      "cardId:",
      cardId
    );

    const favorite = await favoriteService.addFavoriteCard(
      req.userId,
      parseInt(cardId)
    );
    console.log("✅ Карточка добавлена в избранное:", favorite.id);

    res.json({
      success: true,
      message: "Карточка добавлена в избранное",
      favorite,
    });
  } catch (error) {
    console.error("❌ Ошибка добавления карточки в избранное:", error);
    const status = error.message.includes("required")
      ? 400
      : error.message.includes("already")
      ? 400
      : 500;
    res.status(status).json({ error: error.message });
  }
};

// Удалить набор из избранного
exports.removeFavoriteCardSet = async (req, res) => {
  try {
    const { favoriteId } = req.params;
    console.log(
      "➖ DELETE /api/favorites/sets/:favoriteId - userId:",
      req.userId,
      "favoriteId:",
      favoriteId
    );

    const removedId = await favoriteService.removeFavoriteSet(
      parseInt(favoriteId),
      req.userId
    );
    console.log("✅ Набор удален из избранного:", removedId);

    res.json({
      success: true,
      message: "Набор удален из избранного",
      removedId,
    });
  } catch (error) {
    console.error("❌ Ошибка удаления набора из избранного:", error);
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
};

// Удалить карточку из избранного
exports.removeFavoriteCard = async (req, res) => {
  try {
    const { favoriteId } = req.params;
    console.log(
      "➖ DELETE /api/favorites/cards/:favoriteId - userId:",
      req.userId,
      "favoriteId:",
      favoriteId
    );

    const removedId = await favoriteService.removeFavoriteCard(
      parseInt(favoriteId),
      req.userId
    );
    console.log("✅ Карточка удалена из избранного:", removedId);

    res.json({
      success: true,
      message: "Карточка удалена из избранного",
      removedId,
    });
  } catch (error) {
    console.error("❌ Ошибка удаления карточки из избранного:", error);
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
};

// Проверить, добавлен ли набор в избранное
exports.checkFavoriteCardSet = async (req, res) => {
  try {
    const { setId } = req.params;
    console.log(
      "🔍 GET /api/favorites/check/set/:setId - userId:",
      req.userId,
      "setId:",
      setId
    );

    const result = await favoriteService.checkSetFavorite(
      req.userId,
      parseInt(setId)
    );
    res.json(result);
  } catch (error) {
    console.error("❌ Ошибка проверки статуса избранного набора:", error);
    res.status(500).json({ error: error.message });
  }
};

// Проверить, добавлена ли карточка в избранное
exports.checkFavoriteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    console.log(
      "🔍 GET /api/favorites/check/card/:cardId - userId:",
      req.userId,
      "cardId:",
      cardId
    );

    const result = await favoriteService.checkCardFavorite(
      req.userId,
      parseInt(cardId)
    );
    res.json(result);
  } catch (error) {
    console.error("❌ Ошибка проверки статуса избранной карточки:", error);
    res.status(500).json({ error: error.message });
  }
};

// Удалить набор из избранного по ID набора
exports.removeFavoriteCardSetBySetId = async (req, res) => {
  try {
    const { setId } = req.params;
    console.log(
      "➖ DELETE /api/favorites/sets/byset/:setId - userId:",
      req.userId,
      "setId:",
      setId
    );

    const removedId = await favoriteService.removeFavoriteSetBySetId(
      req.userId,
      parseInt(setId)
    );
    console.log("✅ Набор удален из избранного по setId:", removedId);

    res.json({
      success: true,
      message: "Набор удален из избранного",
      removedId,
    });
  } catch (error) {
    console.error("❌ Ошибка удаления набора из избранного:", error);
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
};

// Удалить карточку из избранного по ID карточки
exports.removeFavoriteCardByCardId = async (req, res) => {
  try {
    const { cardId } = req.params;
    console.log(
      "➖ DELETE /api/favorites/cards/bycard/:cardId - userId:",
      req.userId,
      "cardId:",
      cardId
    );

    const removedId = await favoriteService.removeFavoriteCardByCardId(
      req.userId,
      parseInt(cardId)
    );
    console.log("✅ Карточка удалена из избранного по cardId:", removedId);

    res.json({
      success: true,
      message: "Карточка удалена из избранного",
      removedId,
    });
  } catch (error) {
    console.error("❌ Ошибка удаления карточки из избранного:", error);
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
};
