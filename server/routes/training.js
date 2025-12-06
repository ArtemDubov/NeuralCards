const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware");

// Глобальная инициализация Prisma Client
const prisma = new PrismaClient();

// Проверяем подключение при запуске
prisma
  .$connect()
  .then(() => {
    console.log("✅ Prisma Client connected successfully in training routes");
  })
  .catch((error) => {
    console.error("❌ Failed to connect Prisma Client:", error);
  });

// GET /api/training/next-card/:setId
router.get("/next-card/:setId", authMiddleware, async (req, res) => {
  try {
    const { setId } = req.params;
    const userId = req.userId;

    console.log(`Getting next card for set ${setId}, user ${userId}`);

    // Проверяем существование набора карточек
    const cardSet = await prisma.cardSet.findUnique({
      where: { id: parseInt(setId) },
    });

    if (!cardSet) {
      return res.status(404).json({ error: "Card set not found" });
    }

    // 1. Ищем карточки для повторения (nextReview <= сейчас)
    const reviewCards = await prisma.flashCard.findMany({
      where: {
        cardsetId: parseInt(setId),
        progress: {
          some: {
            userId: userId,
            nextReview: { lte: new Date() },
          },
        },
      },
      include: {
        progress: {
          where: { userId: userId },
        },
      },
      orderBy: {
        nextReview: "asc",
      },
    });

    if (reviewCards.length > 0) {
      return res.json({
        card: reviewCards[0],
        type: "review",
        totalDue: reviewCards.length,
        message: `Found ${reviewCards.length} cards due for review`,
      });
    }

    // 2. Ищем новые карточки (без прогресса)
    const newCards = await prisma.flashCard.findMany({
      where: {
        cardsetId: parseInt(setId),
        NOT: {
          progress: {
            some: { userId: userId },
          },
        },
      },
      take: 1,
    });

    if (newCards.length > 0) {
      return res.json({
        card: newCards[0],
        type: "new",
        totalDue: 0,
        message: "New card for learning",
      });
    }

    // 3. Если все карточки изучены, но нет due карточек
    const allCards = await prisma.flashCard.findMany({
      where: { cardsetId: parseInt(setId) },
    });

    if (allCards.length === 0) {
      return res.status(404).json({ error: "No cards found in this set" });
    }

    res.json({
      card: null,
      type: "completed",
      totalDue: 0,
      message: "All cards mastered! Great job!",
    });
  } catch (error) {
    console.error("Error getting next card:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// POST /api/training/submit-answer
router.post("/submit-answer", authMiddleware, async (req, res) => {
  if (!prisma) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const { cardId, difficulty, isCorrect } = req.body;
    const userId = req.userId;

    console.log(`Submitting answer for card ${cardId}, user ${userId}`);

    if (difficulty === undefined || isCorrect === undefined) {
      return res.status(400).json({ error: "Missing difficulty or isCorrect" });
    }

    // Алгоритм интервальных повторений (упрощенный)
    const getNextInterval = (currentDifficulty, wasCorrect) => {
      if (!wasCorrect) {
        return 1; // Повторить завтра если неправильно
      }

      const intervals = {
        0: 3, // Легко - 3 дня
        1: 2, // Средне - 2 дня
        2: 1, // Трудно - 1 день
      };

      return intervals[currentDifficulty] || 1;
    };

    const nextInterval = getNextInterval(difficulty, isCorrect);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextInterval);

    // Используем upsert для создания или обновления прогресса
    const progress = await prisma.cardProgress.upsert({
      where: {
        userId_cardId: {
          userId: parseInt(userId),
          cardId: parseInt(cardId),
        },
      },
      update: {
        difficulty: parseInt(difficulty),
        interval: nextInterval,
        nextReview: nextReview,
        isCorrect: isCorrect,
      },
      create: {
        userId: parseInt(userId),
        cardId: parseInt(cardId),
        difficulty: parseInt(difficulty),
        interval: nextInterval,
        nextReview: nextReview,
        isCorrect: isCorrect,
      },
    });

    res.json({
      success: true,
      progress,
      nextReview: nextReview.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// GET /api/training/progress/:setId
router.get("/progress/:setId", authMiddleware, async (req, res) => {
  if (!prisma) {
    return res.status(500).json({ error: "Database not available" });
  }

  try {
    const { setId } = req.params;
    const userId = req.userId;

    const [totalCards, studiedCards, dueCards, masteredCards] =
      await Promise.all([
        // Всего карточек в наборе
        prisma.Card.count({
          where: { cardsetId: parseInt(setId) },
        }),
        // Изученные карточки (есть прогресс)
        prisma.cardProgress.count({
          where: {
            card: { cardsetId: parseInt(setId) },
            userId: userId,
          },
        }),
        // Карточки для повторения
        prisma.cardProgress.count({
          where: {
            card: { cardsetId: parseInt(setId) },
            userId: userId,
            nextReview: { lte: new Date() },
          },
        }),
        // Освоенные карточки (легкая сложность)
        prisma.cardProgress.count({
          where: {
            card: { cardsetId: parseInt(setId) },
            userId: userId,
            difficulty: 0,
          },
        }),
      ]);

    res.json({
      totalCards,
      studiedCards,
      dueCards,
      masteredCards,
      progressPercentage:
        totalCards > 0 ? Math.round((studiedCards / totalCards) * 100) : 0,
    });
  } catch (error) {
    console.error("Error getting progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
