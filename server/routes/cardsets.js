const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware");

const router = express.Router();
const prisma = new PrismaClient();

// Получить все наборы пользователя с карточками и тегами
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 GET /api/cardsets - userId:", req.userId);

    const cardsets = await prisma.cardSet.findMany({
      where: { authorId: req.userId },
      include: {
        cards: true,
        tags: true,
        favoriteCardsets: {
          where: { userId: req.userId },
        },
      },
    });

    // Добавляем поле isFavorite к каждому набору
    const cardsetsWithFavorites = cardsets.map((set) => ({
      ...set,
      isFavorite: set.favoriteCardsets.length > 0,
    }));

    res.json(cardsetsWithFavorites);
  } catch (error) {
    console.error("❌ Ошибка получения наборов:", error);
    res.status(500).json({ error: "Ошибка получения наборов" });
  }
});

// Создать набор карточек с тегами
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, isPublic, tags } = req.body;

    console.log("🔍 POST /api/cardsets - userId:", req.userId);
    console.log("📦 Полученные данные:", {
      title,
      description,
      isPublic,
      tags,
    });

    // Проверяем что userId установлен
    if (!req.userId) {
      console.error("❌ userId не установлен в middleware");
      return res.status(401).json({ error: "Пользователь не авторизован" });
    }

    // Создаем данные для набора
    const data = {
      title,
      description,
      isPublic: isPublic || false,
      authorId: req.userId,
    };

    // Добавляем теги только если они есть
    if (tags && tags.length > 0) {
      data.tags = {
        connectOrCreate: tags.map((tag) => ({
          where: { name: tag.name },
          create: { name: tag.name },
        })),
      };
    }

    const cardset = await prisma.cardSet.create({
      data: data,
      include: {
        tags: true,
        cards: true,
      },
    });

    console.log("✅ Создан набор:", cardset.id);
    res.json(cardset);
  } catch (error) {
    console.error("❌ Ошибка создания набора:", error);
    res.status(500).json({ error: "Ошибка создания набора: " + error.message });
  }
});

// ОБНОВИТЬ НАБОР КАРТОЧЕК С ТЕГАМИ (НОВЫЙ ENDPOINT)
router.put("/:setId", authMiddleware, async (req, res) => {
  try {
    const { title, description, isPublic, tags } = req.body;
    const { setId } = req.params;

    console.log("✏️ PUT /api/cardsets/:setId - userId:", req.userId);
    console.log("📦 Данные для обновления:", {
      setId,
      title,
      description,
      isPublic,
      tags,
    });

    // Проверяем, что набор существует и принадлежит пользователю
    const existingSet = await prisma.cardSet.findFirst({
      where: {
        id: parseInt(setId),
        authorId: req.userId,
      },
      include: {
        tags: true,
      },
    });

    if (!existingSet) {
      return res
        .status(404)
        .json({ error: "Набор не найден или у вас нет прав" });
    }

    // Подготавливаем данные для обновления
    const data = {
      title: title !== undefined ? title : existingSet.title,
      description:
        description !== undefined ? description : existingSet.description,
      isPublic: isPublic !== undefined ? isPublic : existingSet.isPublic,
    };

    // Обновляем теги, если они переданы
    if (tags !== undefined) {
      if (tags && tags.length > 0) {
        // Преобразуем теги в правильный формат (массив объектов)
        const tagsArray = Array.isArray(tags) ? tags : [tags];

        // Используем connectOrCreate для тегов
        data.tags = {
          set: [], // Сначала очищаем все теги
          connectOrCreate: tagsArray.map((tag) => {
            // Обрабатываем как строку, так и объект
            const tagName = typeof tag === "string" ? tag : tag.name || tag;
            return {
              where: { name: tagName.trim() },
              create: { name: tagName.trim() },
            };
          }),
        };
      } else {
        // Если теги переданы как пустой массив, удаляем все теги
        data.tags = {
          set: [],
        };
      }
    }

    // Обновляем набор
    const updatedSet = await prisma.cardSet.update({
      where: { id: parseInt(setId) },
      data: data,
      include: {
        tags: true,
        cards: true,
        favoriteCardsets: {
          where: { userId: req.userId },
        },
      },
    });

    // Добавляем поле isFavorite
    const setWithFavorite = {
      ...updatedSet,
      isFavorite: updatedSet.favoriteCardsets.length > 0,
    };

    console.log("✅ Набор обновлен:", setWithFavorite.id);
    res.json(setWithFavorite);
  } catch (error) {
    console.error("❌ Ошибка обновления набора:", error);
    res
      .status(500)
      .json({ error: "Ошибка обновления набора: " + error.message });
  }
});

// Удаление набора
router.delete("/:setId", authMiddleware, async (req, res) => {
  try {
    const cardset = await prisma.cardSet.findUnique({
      where: { id: parseInt(req.params.setId) },
      include: {
        cards: true,
        favoriteCardsets: true,
        author: true,
        tags: true,
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

// Эндпоинт поиска наборов и карточек
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;

    console.log("🔍 Search query:", query);
    console.log("🔍 User ID:", req.userId);

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: "Пустой поисковый запрос" });
    }

    const searchResults = await prisma.cardSet.findMany({
      where: {
        authorId: req.userId,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            cards: {
              some: {
                OR: [
                  {
                    front: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                  {
                    back: {
                      contains: query,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          },
          {
            tags: {
              some: {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },
      include: {
        cards: true,
        tags: true,
      },
    });

    console.log("🔍 Search results:", searchResults.length);
    res.json(searchResults);
  } catch (error) {
    console.error("Ошибка поиска:", error);
    res.status(500).json({ error: "Ошибка поиска" });
  }
});

module.exports = router;
