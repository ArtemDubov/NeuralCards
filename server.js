const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// ВАЖНО: Сначала CORS, потом body-parser
app.use(cors());

// Подробное логирование ВСЕХ запросов (после CORS, перед body-parser)
app.use((req, res, next) => {
  console.log("========================================");
  console.log(`📨 ${req.method} ${req.url}`);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Content-Length:", req.headers["content-length"]);
  next();
});

// ВАЖНО: Body-parser ДО статики
app.use(express.json({ limit: "10mb" })); // Увеличиваем лимит
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware для логирования тела ПОСЛЕ парсинга
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    console.log("Parsed Body:", req.body);
  }
  console.log("========================================");
  next();
});

// Создаем папку uploads если её нет
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Статические файлы для загрузок
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Импорт роутеров
const profileRouter = require("./server/routes/profile.routes");
const cardSetsRouter = require("./server/routes/cardSets.routes");
const favoritesRouter = require("./server/routes/favorites.routes");
const trainingRouter = require("./server/routes/training.routes");
const cardRouter = require("./server/routes/card.routes");
const tagRouter = require("./server/routes/tag.routes");
const uploadRouter = require("./server/routes/upload.routes");

// Middleware для авторизации
const authMiddleware = require("./server/middleware/auth");

// Маршруты API
app.use("/api/profile", authMiddleware, profileRouter);
app.use("/api/cardSets", authMiddleware, cardSetsRouter);
app.use("/api/favorites", authMiddleware, favoritesRouter);
app.use("/api/training", authMiddleware, trainingRouter);
app.use("/api/cards", authMiddleware, cardRouter);
app.use("/api/tags", authMiddleware, tagRouter);
app.use("/api/uploads", authMiddleware, uploadRouter);

// Регистрация и вход
app.post("/api/register", async (req, res) => {
  try {
    console.log("=== REGISTER ENDPOINT ===");
    const { name, email, password } = req.body;
    console.log("Register data:", {
      name,
      email,
      password: password ? "***" : "empty",
    });

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Все поля обязательны для заполнения",
      });
    }

    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await prisma.$disconnect();
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isPremium: false,
        avatarEmoji: null,
        avatarUrl: null,
        avatarColor: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isPremium: true,
        createdAt: true,
        avatarColor: true,
      },
    });

    const jwt = require("jsonwebtoken");
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
      expiresIn: "30d",
    });

    await prisma.$disconnect();

    res.json({
      success: true,
      token,
      userId: user.id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
    });
  } catch (error) {
    console.error("❌ Ошибка регистрации:", error);
    res.status(500).json({
      error: "Ошибка сервера при регистрации",
      details: error.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    console.log("=== LOGIN ENDPOINT ===");
    console.log("Raw request body:", req.body);

    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).json({
        error: "Email и пароль обязательны",
      });
    }

    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isPremium: true,
        premiumUntil: true, // ← ИСПРАВЛЕНО: было null
        avatarEmoji: true,
        avatarUrl: true,
        avatarColor: true, // ← ДОБАВЬТЕ это поле
      },
    });

    if (!user) {
      console.log("❌ User not found:", email);
      await prisma.$disconnect();
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    console.log("✅ User found:", user.id);

    const bcrypt = require("bcrypt");
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      console.log("❌ Invalid password");
      await prisma.$disconnect();
      return res.status(401).json({ error: "Неверный email или пароль" });
    }

    console.log("✅ Password valid");

    const jwt = require("jsonwebtoken");
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, {
      expiresIn: "30d",
    });

    await prisma.$disconnect();

    const { password: _, ...userWithoutPassword } = user;

    // Преобразуем avatarUrl
    if (
      userWithoutPassword.avatarUrl &&
      !userWithoutPassword.avatarUrl.startsWith("http")
    ) {
      const cleanUrl = userWithoutPassword.avatarUrl.replace(/^\/+/, "");
      userWithoutPassword.avatarUrl = `/api/${cleanUrl}`;
    }

    console.log("✅ Sending successful response");
    res.json({
      success: true,
      token,
      userId: user.id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil,
      avatarEmoji: user.avatarEmoji,
      avatarUrl: userWithoutPassword.avatarUrl,
      avatarColor: user.avatarColor, // ← ДОБАВЬТЕ это поле
    });
  } catch (error) {
    console.error("❌ Ошибка входа:", error);
    console.error("❌ Stack trace:", error.stack);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error name:", error.name);
    console.error("❌ Full error object:", JSON.stringify(error, null, 2));

    res.status(500).json({
      error: "Ошибка сервера при входе",
      details: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📁 Папка uploads: ${uploadsDir}`);
});
