const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/trainingController");
const authMiddleware = require("../middleware");

// GET /api/training/next-card/:setId
router.get("/next-card/:setId", authMiddleware, trainingController.getNextCard);

// POST /api/training/submit-answer
router.post("/submit-answer", authMiddleware, trainingController.submitAnswer);

// GET /api/training/progress/:setId
router.get("/progress/:setId", authMiddleware, trainingController.getProgress);

module.exports = router;
