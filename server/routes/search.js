const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// 🎯 УМНЫЙ ПОИСК С ИСПОЛЬЗОВАНИЕМ ПОИСКОВЫХ ВЕКТОРОВ
router.get("/unified-search", authMiddleware, async (req, res) => {
  console.log("🔍 Unified search endpoint called!");
  try {
    const { query } = req.query;

    console.log("🔍 Search query:", query);
    console.log("🔍 User ID:", req.userId);

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Пустой поисковый запрос" });
    }

    // 🔍 ПОИСК ПО КАРТОЧКАМ
    const flashcards = await prisma.flashCard.findMany({
      where: {
        cardset: {
          authorId: req.userId,
        },
        OR: [
          { front: { contains: query, mode: "insensitive" } },
          { back: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        front: true,
        back: true,
        cardset: {
          select: {
            title: true,
            id: true,
          },
        },
      },
      take: 10,
    });

    // 🔍 ПОИСК ПО НАБОРАМ
    console.log("🔍 Before cardSet.findMany");
    let cardsets = [];
    try {
      const cardsets = await prisma.cardSet.findMany({
        where: {
          authorId: req.userId,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          _count: {
            select: {
              cards: true,
            },
          },
        },
        take: 10,
      });
      console.log("🔍 After cardSet.findMany");
    } catch (error) {
      console.log("🔍 Error in cardSet.findMany:", error.message);
      console.log("🔍 Error stack:", error.stack);
      throw error;
    }

    console.log("🔍 Found flashcards:", flashcards.length);
    console.log("🔍 Found cardsets:", cardsets.length);

    // 📦 ОБЪЕДИНЯЕМ РЕЗУЛЬТАТЫ
    const results = {
      flashcards: flashcards.map((card) => ({
        ...card,
        type: "flashcard",
      })),
      cardsets: cardsets.map((set) => ({
        ...set,
        type: "cardset",
      })),
    };

    res.json(results);
  } catch (error) {
    console.error("Ошибка поиска:", error);
    res.status(500).json({ error: "Ошибка поиска" });
  }
});

module.exports = router;
