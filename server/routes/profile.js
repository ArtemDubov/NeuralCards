const express = require("express");
const { PrismaClient } = require("@prisma/client");
const authMiddleware = require("../middleware");

const router = express.Router();
const prisma = new PrismaClient();

// Получение профиля пользователя
// Получение профиля пользователя - упрощенная версия
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("=== GET /profile ===");
    console.log("User ID:", req.userId);

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        isPremium: true,
        // premiumUntil: true // Убираем, пока поле не добавлено
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Убираем проверку истечения премиума (нет поля premiumUntil)
    res.json(user);
  } catch (error) {
    console.error("Ошибка получения профиля:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получение статистики пользователя
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const cardsetsCount = await prisma.cardSet.count({
      where: { authorId: userId },
    });

    const cardsCount = await prisma.flashCard.count({
      where: {
        cardset: {
          authorId: userId,
        },
      },
    });

    const favoritesCount = await prisma.favoriteCardset.count({
      where: { userId: userId },
    });

    res.json({
      cardsetsCount,
      cardsCount,
      favoritesCount,
    });
  } catch (error) {
    console.error("Ошибка получения статистики:", error);
    res.status(500).json({ error: "Ошибка получения статистики" });
  }
});

// Активация/деактивация премиума - УПРОЩЕННАЯ ВЕРСИЯ БЕЗ premiumUntil
router.patch("/premium", authMiddleware, async (req, res) => {
  try {
    console.log("=== PATCH /premium ===");
    console.log("User ID:", req.userId);
    console.log("Action:", req.body.action);

    const userId = req.userId;
    const { action } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Пользователь не авторизован",
      });
    }

    if (!["activate", "deactivate"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Действие должно быть 'activate' или 'deactivate'",
      });
    }

    // ТОЛЬКО isPremium, БЕЗ premiumUntil
    const isPremium = action === "activate";

    const updateData = {
      isPremium: isPremium,
      // premiumUntil: null // Убираем, пока поле не добавлено в схему
    };

    console.log("Update data (без premiumUntil):", updateData);

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        isPremium: true,
        // premiumUntil: true // Убираем из select
      },
    });

    console.log("✅ User updated (без premiumUntil):", updatedUser);

    res.json({
      success: true,
      message: isPremium ? "Премиум активирован" : "Премиум отключен",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Ошибка изменения премиум статуса:", error);
    console.error("❌ Full error:", error.message);

    res.status(500).json({
      success: false,
      error: `Ошибка сервера: ${error.message}`,
    });
  }
});

module.exports = router;
