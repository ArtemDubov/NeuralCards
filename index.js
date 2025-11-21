const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 5002;
const JWT_SECRET = "neural-trident-secret-key";
const authMiddleware = require("./server/middleware/auth");
const uploadRoutes = require("./server/routes/uploads");

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});
app.use(express.json({ type: "application/json" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api", uploadRoutes);
// Раздаем статические файлы из папки uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Подключаем роутеры
app.use("/api/favorites", require("./server/routes/favorites"));

app.use("/uploads", express.static(path.join(__dirname, "server/uploads")));

const prisma = new PrismaClient();

// Получить профиль пользователя (требует токен)
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Создать набор карточек
app.post("/api/cardsets", authMiddleware, async (req, res) => {
  try {
    const { title, description, isPublic } = req.body;
    const cardset = await prisma.cardSet.create({
      data: {
        title,
        description,
        isPublic: isPublic || false,
        authorId: req.userId,
      },
    });
    res.json(cardset);
  } catch (error) {
    res.status(500).json({ error: "Ошибка создания набора" });
  }
});

// Получить все наборы пользователя
// Получение всех наборов пользователя с карточками
app.get("/api/cardsets", authMiddleware, async (req, res) => {
  try {
    const cardsets = await prisma.cardSet.findMany({
      where: { authorId: req.userId },
      include: {
        cards: true, // Включаем связанные карточки
      },
    });
    res.json(cardsets);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения наборов" });
  }
});

// Добавить карточку в набор
app.post("/api/cardsets/:id/cards", authMiddleware, async (req, res) => {
  try {
    const { front, back, imageUrl, audioUrl, backImageUrl, backAudioUrl } =
      req.body;
    const card = await prisma.flashCard.create({
      data: {
        front,
        back,
        imageUrl: imageUrl || null,
        audioUrl: audioUrl || null,
        backImageUrl: backImageUrl || null,
        backAudioUrl: backAudioUrl || null,
        cardsetId: parseInt(req.params.id),
      },
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: "Ошибка создания карточки" });
  }
});

// Обновление карточки
app.put(
  "/api/cardsets/:setId/cards/:cardId",
  authMiddleware,
  async (req, res) => {
    try {
      const { front, back, imageUrl, audioUrl, backImageUrl, backAudioUrl } =
        req.body;
      const card = await prisma.flashCard.update({
        where: { id: parseInt(req.params.cardId) },
        data: {
          front,
          back,
          imageUrl,
          audioUrl,
          backImageUrl,
          backAudioUrl,
        },
      });
      res.json(card);
    } catch (error) {
      res.status(500).json({ error: "Ошибка обновления карточки" });
    }
  }
);

// Регистрация пользователя
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    res.json({ message: "Пользователь создан", userId: user.id });
  } catch (error) {
    res.status(400).json({ error: "Ошибка регистрации" });
  }
});

// Логин пользователя
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Пользователь не найден" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Неверный пароль" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Успешный вход",
      token,
      userId: user.id,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка входа" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Neural Trident работает!" });
});

// Удаление карточки
app.delete(
  "/api/cardsets/:setId/cards/:cardId",
  authMiddleware,
  async (req, res) => {
    try {
      // Находим карточку чтобы получить пути к файлам
      const card = await prisma.flashCard.findUnique({
        where: { id: parseInt(req.params.cardId) },
      });

      if (!card) {
        return res.status(404).json({ error: "Карточка не найдена" });
      }

      // Удаляем файлы с диска если они есть
      const deleteFile = (filePath) => {
        if (filePath) {
          const fullPath = path.join(
            __dirname,
            "server/uploads",
            path.basename(filePath)
          );
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      };

      deleteFile(card.imageUrl);
      deleteFile(card.audioUrl);
      deleteFile(card.backImageUrl);
      deleteFile(card.backAudioUrl);

      // Удаляем карточку из БД
      await prisma.flashCard.delete({
        where: { id: parseInt(req.params.cardId) },
      });

      res.json({ message: "Карточка удалена" });
    } catch (error) {
      console.error("Ошибка удаления карточки:", error);
      res.status(500).json({ error: "Ошибка удаления карточки" });
    }
  }
);

// Удаление набора
// Удаление набора
app.delete("/api/cardsets/:setId", authMiddleware, async (req, res) => {
  try {
    // Сначала проверяем существование набора
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

    // Проверяем что пользователь удаляет свой набор
    if (cardset.authorId !== req.userId) {
      return res.status(403).json({ error: "Нельзя удалить чужой набор" });
    }

    // Удаляем файлы карточек
    for (const card of cardset.cards) {
      const deleteFile = (filePath) => {
        if (filePath) {
          const fullPath = path.join(
            __dirname,
            "server/uploads",
            path.basename(filePath)
          );
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      };

      deleteFile(card.imageUrl);
      deleteFile(card.audioUrl);
      deleteFile(card.backImageUrl);
      deleteFile(card.backAudioUrl);
    }

    // Ручное удаление всех связанных данных (на всякий случай)
    await prisma.flashCard.deleteMany({
      where: { cardsetId: parseInt(req.params.setId) },
    });

    await prisma.favorite.deleteMany({
      where: { cardsetId: parseInt(req.params.setId) },
    });

    // Удаляем сам набор
    await prisma.cardSet.delete({
      where: { id: parseInt(req.params.setId) },
    });

    res.json({ message: "Набор и все связанные данные удалены" });
  } catch (error) {
    console.error("Ошибка удаления набора:", error);
    res.status(500).json({ error: "Ошибка удаления набора" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
