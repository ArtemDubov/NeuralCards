const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Получить все наборы пользователя с карточками и тегами
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cardsets = await prisma.cardSet.findMany({
      where: { authorId: req.userId },
      include: {
        cards: true,
        tags: true,
      },
    });
    res.json(cardsets);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения наборов" });
  }
});

// Создать набор карточек с тегами
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, isPublic, tags } = req.body;

    const cardset = await prisma.cardSet.create({
      data: {
        title,
        description,
        isPublic: isPublic || false,
        authorId: req.userId,
        tags: {
          connectOrCreate:
            tags?.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })) || [],
        },
      },
      include: {
        tags: true,
      },
    });
    res.json(cardset);
  } catch (error) {
    res.status(500).json({ error: "Ошибка создания набора" });
  }
});

// Удаление набора
router.delete("/:setId", authMiddleware, async (req, res) => {
  try {
    const cardset = await prisma.cardSet.findUnique({
      where: { id: parseInt(req.params.setId) },
      include: {
        cards: true,
        favorites: true,
      },
    });

    if (!cardset) {
      return res.status(404).json({ error: "Набор не найден" });
    }

    if (cardset.authorId !== req.userId) {
      return res.status(403).json({ error: "Нельзя удалить чужой набор" });
    }

    // Удаляем сам набор (каскадное удаление настроено в Prisma)
    await prisma.cardSet.delete({
      where: { id: parseInt(req.params.setId) },
    });

    res.json({ message: "Набор и все связанные данные удалены" });
  } catch (error) {
    console.error("Ошибка удаления набора:", error);
    res.status(500).json({ error: "Ошибка удаления набора" });
  }
});

module.exports = router;
