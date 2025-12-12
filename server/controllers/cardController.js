// server/controllers/cardController.js
const cardService = require("../services/cardService");

exports.addCard = async (req, res) => {
  try {
    const { front, back, imageUrl, audioUrl, backImageUrl, backAudioUrl } =
      req.body;
    const card = await cardService.addCard({
      front,
      back,
      imageUrl,
      audioUrl,
      backImageUrl,
      backAudioUrl,
      cardSetId: req.params.setId,
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: "Ошибка создания карточки" });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { front, back, imageUrl, audioUrl, backImageUrl, backAudioUrl } =
      req.body;
    const card = await cardService.updateCard(parseInt(req.params.cardId), {
      front,
      back,
      imageUrl,
      audioUrl,
      backImageUrl,
      backAudioUrl,
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: "Ошибка обновления карточки" });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const result = await cardService.deleteCard(parseInt(req.params.cardId));
    res.json(result);
  } catch (error) {
    console.error("❌ [CONTROLLER] Ошибка удаления карточки:", error);
    if (error.message === "Карточка не найдена") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Ошибка удаления карточки" });
  }
};

exports.addBatchCards = async (req, res) => {
  try {
    const cardsData = req.body;
    const createdCards = await cardService.addBatchCards(
      cardsData,
      req.params.setId
    );
    res.json(createdCards);
  } catch (error) {
    console.error("❌ [CONTROLLER] Ошибка массового создания карточек:", error);
    if (error.message === "Набор не найден") {
      return res.status(404).json({
        error: error.message,
        code: "SET_NOT_FOUND",
      });
    }
    if (error.message === "Ожидается массив карточек") {
      return res.status(400).json({
        error: error.message,
        code: "INVALID_DATA_FORMAT",
      });
    }
    res.status(500).json({
      error: "Ошибка создания карточек",
      details: error.message,
    });
  }
};
