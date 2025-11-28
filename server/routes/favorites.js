const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// ========== КАРТОЧКИ ==========

// Добавить карточку в избранное
router.post("/card/:cardId", authMiddleware, async (req, res) => {
  try {
    const cardId = parseInt(req.params.cardId);
    console.log(
      `⭐ [API] Добавление карточки ${cardId} в избранное для пользователя ${req.userId}`
    );

    // ДОБАВИМ ПОДРОБНЫЕ ЛОГИ
    console.log(`🔍 [API] Проверяем существование карточки ${cardId}`);
    const card = await prisma.flashCard.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      console.log(`❌ [API] Карточка ${cardId} не найдена`);
      return res.status(404).json({ error: "Карточка не найдена" });
    }

    console.log(`🔍 [API] Карточка найдена:`, card);
    console.log(
      `🔍 [API] Создаем запись в FavoriteCard для user ${req.userId}, card ${cardId}`
    );

    const favorite = await prisma.favoriteCard.create({
      data: {
        userId: req.userId,
        cardId: cardId,
      },
    });

    console.log(`✅ [API] Карточка ${cardId} добавлена в избранное:`, favorite);
    res.json({ success: true, favorite });
  } catch (error) {
    console.error("❌ [API] Полная ошибка добавления карточки в избранное:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });

    if (error.code === "P2002") {
      return res.json({ success: true, message: "Уже в избранном" });
    }
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Неверные данные для связи" });
    }
    res.status(500).json({ error: "Ошибка добавления в избранное" });
  }
});

// Удалить карточку из избранного
router.delete("/card/:cardId", authMiddleware, async (req, res) => {
  try {
    const cardId = parseInt(req.params.cardId);
    console.log(
      `🗑️ [API] Удаление карточки ${cardId} из избранного для пользователя ${req.userId}`
    );

    const deleted = await prisma.favoriteCard.deleteMany({
      where: {
        userId: req.userId,
        cardId: cardId,
      },
    });

    if (deleted.count === 0) {
      console.log(`❌ [API] Карточка ${cardId} не найдена в избранном`);
      return res.status(404).json({ error: "Не найдено в избранном" });
    }

    console.log(`✅ [API] Карточка ${cardId} удалена из избранного`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ [API] Ошибка удаления карточки из избранного:", error);
    res.status(500).json({ error: "Ошибка удаления из избранного" });
  }
});

// Получить избранные карточки пользователя
router.get("/cards", authMiddleware, async (req, res) => {
  try {
    console.log(
      `📥 [API] Получение избранных карточек для пользователя ${req.userId}`
    );

    const favorites = await prisma.favoriteCard.findMany({
      where: { userId: req.userId },
      include: {
        card: {
          include: {
            cardset: {
              select: {
                id: true,
                title: true,
                author: true,
              },
            },
          },
        },
      },
    });

    console.log(`✅ [API] Найдено ${favorites.length} избранных карточек`);
    res.json(favorites);
  } catch (error) {
    console.error("❌ [API] Ошибка получения избранных карточек:", error);
    res.status(500).json({ error: "Ошибка получения избранных карточек" });
  }
});

// ДОБАВЬТЕ этот роут в favorites.js после роута для /cards
router.get("/cardsets", authMiddleware, async (req, res) => {
  try {
    console.log(
      `📥 [API] Получение избранных наборов (cardsets) для пользователя ${req.userId}`
    );

    const favorites = await prisma.favoriteCardset.findMany({
      where: { userId: req.userId },
      include: {
        cardSet: {
          include: {
            cards: true,
            tags: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(
      `✅ [API] Найдено ${favorites.length} избранных наборов (cardsets)`
    );
    res.json(favorites);
  } catch (error) {
    console.error(
      "❌ [API] Ошибка получения избранных наборов (cardsets):",
      error
    );
    res.status(500).json({ error: "Ошибка получения избранных наборов" });
  }
});

// ========== НАБОРЫ ========== (существующие эндпоинты, оставляем как есть)

// Добавить набор в избранное
router.post("/:cardsetId", authMiddleware, async (req, res) => {
  try {
    const cardsetId = parseInt(req.params.cardsetId);
    console.log(
      `⭐ [API] Добавление набора ${cardsetId} в избранное для пользователя ${req.userId}`
    );

    const cardset = await prisma.cardSet.findUnique({
      where: { id: cardsetId },
    });

    if (!cardset) {
      console.log(`❌ [API] Набор ${cardsetId} не найден`);
      return res.status(404).json({ error: "Набор не найден" });
    }

    const favorite = await prisma.favoriteCardset.create({
      data: {
        userId: req.userId,
        cardsetId: cardsetId,
      },
    });

    console.log(`✅ [API] Набор ${cardsetId} добавлен в избранное`);
    res.json({ success: true, favorite });
  } catch (error) {
    console.error("❌ [API] Ошибка добавления набора в избранное:", error);
    if (error.code === "P2002") {
      return res.json({ success: true, message: "Уже в избранном" });
    }
    res.status(500).json({ error: "Ошибка добавления в избранное" });
  }
});

// Удалить набор из избранного
router.delete("/:cardsetId", authMiddleware, async (req, res) => {
  try {
    const cardsetId = parseInt(req.params.cardsetId);
    console.log(
      `🗑️ [API] Удаление набора ${cardsetId} из избранного для пользователя ${req.userId}`
    );

    const deleted = await prisma.favoriteCardset.deleteMany({
      where: {
        userId: req.userId,
        cardsetId: cardsetId,
      },
    });

    if (deleted.count === 0) {
      console.log(`❌ [API] Набор ${cardsetId} не найден в избранном`);
      return res.status(404).json({ error: "Не найдено в избранном" });
    }

    console.log(`✅ [API] Набор ${cardsetId} удален из избранного`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ [API] Ошибка удаления набора из избранного:", error);
    res.status(500).json({ error: "Ошибка удаления из избранного" });
  }
});

// Получить избранные наборы пользователя
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log(
      `📥 [API] Получение избранных наборов для пользователя ${req.userId}`
    );

    const favorites = await prisma.favoriteCardset.findMany({
      where: { userId: req.userId },
      include: {
        cardSet: {
          include: {
            cards: true,
            tags: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(`✅ [API] Найдено ${favorites.length} избранных наборов`);
    res.json(favorites);
  } catch (error) {
    console.error("❌ [API] Ошибка получения избранного:", error);
    res.status(500).json({ error: "Ошибка получения избранного" });
  }
});

module.exports = router;
