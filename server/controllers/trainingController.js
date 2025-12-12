// server/controllers/trainingController.js
const trainingService = require("../services/trainingService");

// GET /api/training/next-card/:setId
exports.getNextCard = async (req, res) => {
  try {
    const { setId } = req.params;
    const userId = req.userId;

    console.log(
      `🔍 [CONTROLLER] Getting next card for set ${setId}, user ${userId}`
    );

    const result = await trainingService.getNextCard(setId, userId);
    res.json(result);
  } catch (error) {
    console.error("❌ [CONTROLLER] Error getting next card:", error);
    if (
      error.message === "Card set not found" ||
      error.message === "No cards found in this set"
    ) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

// POST /api/training/submit-answer
exports.submitAnswer = async (req, res) => {
  try {
    const { cardId, difficulty, isCorrect } = req.body;
    const userId = req.userId;

    console.log(
      `🔍 [CONTROLLER] Submitting answer for card ${cardId}, user ${userId}`
    );

    const result = await trainingService.submitAnswer(
      cardId,
      difficulty,
      isCorrect,
      userId
    );
    res.json(result);
  } catch (error) {
    console.error("❌ [CONTROLLER] Error submitting answer:", error);
    if (error.message === "Missing difficulty or isCorrect") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

// GET /api/training/progress/:setId
exports.getProgress = async (req, res) => {
  try {
    const { setId } = req.params;
    const userId = req.userId;

    const result = await trainingService.getProgress(setId, userId);
    res.json(result);
  } catch (error) {
    console.error("❌ [CONTROLLER] Error getting progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
