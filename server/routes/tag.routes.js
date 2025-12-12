const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");
const authMiddleware = require("../middleware");

// Получить все теги
router.get("/", authMiddleware, tagController.getTags);

// Создать тег
router.post("/", authMiddleware, tagController.createTag);

module.exports = router;
