// server/controllers/cardSetsController.js
const cardSetService = require("../services/cardSetService");

exports.getCardSets = async (req, res) => {
  try {
    console.log("🔍 [CONTROLLER] GET /api/cardSets - userId:", req.userId);
    const cardSets = await cardSetService.getCardSets(req.userId);
    res.json(cardSets);
  } catch (error) {
    console.error("❌ [CONTROLLER] Ошибка получения наборов:", error);
    res.status(500).json({ error: "Ошибка получения наборов" });
  }
};

exports.getCardSetById = async (req, res) => {
  try {
    const { id } = req.params;
    const cardSet = await cardSetService.getCardSetById(id, req.userId);
    res.json(cardSet);
  } catch (error) {
    console.error("❌ [CONTROLLER] Ошибка получения набора:", error);
    if (error.message === "Набор не найден") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Нет доступа к этому набору") {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: "Ошибка получения набора" });
  }
};

exports.createCardSet = async (req, res) => {
  try {
    const { title, description, isPublic, tags } = req.body;
    const cardSet = await cardSetService.createCardSet(
      { title, description, isPublic, tags },
      req.userId
    );
    res.status(201).json(cardSet);
  } catch (error) {
    console.error("❌ [CONTROLLER] Ошибка создания набора:", error);
    res.status(500).json({ error: "Ошибка создания набора" });
  }
};

exports.updateCardSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isPublic, tags } = req.body;

    console.log("🔄 [CONTROLLER] Обновление набора:", {
      id,
      title,
      description,
      isPublic,
      tags,
      userId: req.userId,
    });

    const updatedSet = await cardSetService.updateCardSet(
      id,
      { title, description, isPublic, tags },
      req.userId
    );

    res.json(updatedSet);
  } catch (error) {
    console.error("❌ [CONTROLLER] Ошибка обновления набора:", error);
    if (error.message === "Набор не найден") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Нет прав для обновления этого набора") {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({
      error: "Ошибка обновления набора",
      details: error.message,
    });
  }
};

exports.deleteCardSet = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await cardSetService.deleteCardSet(id, req.userId);
    res.json(result);
  } catch (error) {
    console.error("❌ [CONTROLLER] Ошибка удаления набора:", error);
    if (error.message === "Набор не найден") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Нет прав для удаления этого набора") {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: "Ошибка удаления набора" });
  }
};

exports.searchCardSets = async (req, res) => {
  try {
    const { query } = req.params;
    const cardSets = await cardSetService.searchCardSets(query, req.userId);
    res.json(cardSets);
  } catch (error) {
    console.error("❌ [CONTROLLER] Ошибка поиска наборов:", error);
    res.status(500).json({ error: "Ошибка поиска наборов" });
  }
};
