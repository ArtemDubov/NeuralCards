const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware");

const router = express.Router();
const prisma = new PrismaClient();

// Получить все теги
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        cardsets: true,
      },
    });
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения тегов" });
  }
});

// Создать тег
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await prisma.tag.create({
      data: { name },
    });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: "Ошибка создания тега" });
  }
});

module.exports = router;
