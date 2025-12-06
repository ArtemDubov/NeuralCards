const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const app = express();
const PORT = 5001;
const JWT_SECRET = "neural-trident-secret-key";
const prisma = new PrismaClient();

// 🔧 ОБНОВЛЕНО: Добавлены PUT и PATCH в методы CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], // Добавлены PUT и PATCH
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});
app.use(express.json({ type: "application/json" }));
app.use(express.urlencoded({ extended: true }));

// Раздаем статические файлы
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========== 🔥 ИСПРАВЛЕННЫЙ РЕГИСТРАЦИЯ ==========
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Пользователь с таким email уже существует" });
    }

    // 2. Хэшируем пароль и создаем пользователя
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    // 3. Создаем токен для нового пользователя
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // 4. ✅ ВОЗВРАЩАЕМ ТОКЕН И ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
    res.json({
      message: "Пользователь создан",
      token, // ← ВАЖНО: токен!
      userId: user.id,
      name: user.name,
      email: user.email,
      user: {
        // ← дополнительный объект user
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(400).json({ error: "Ошибка регистрации: " + error.message });
  }
});

// ========== 🔥 ИСПРАВЛЕННЫЙ ЛОГИН ==========
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Находим пользователя
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Пользователь не найден" });
    }

    // 2. Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Неверный пароль" });
    }

    // 3. Создаем токен
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // 4. ✅ ВОЗВРАЩАЕМ ТОКЕН И ВСЕ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
    res.json({
      message: "Успешный вход",
      token,
      userId: user.id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium || false, // ← ДОБАВЛЯЕМ
      premiumUntil: user.premiumUntil, // ← ДОБАВЛЯЕМ
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium || false, // ← ДОБАВЛЯЕМ
        premiumUntil: user.premiumUntil, // ← ДОБАВЛЯЕМ
      },
    });
  } catch (error) {
    console.error("Ошибка входа:", error);
    res.status(500).json({ error: "Ошибка сервера при входе" });
  }
});

// Подключаем ВСЕ роутеры
app.use("/api/favorites", require("./server/routes/favorites"));
app.use("/api/upload", require("./server/routes/uploads"));
app.use("/api/cardsets", require("./server/routes/cardsets"));
app.use("/api/cardsets", require("./server/routes/cards"));
app.use("/api/tags", require("./server/routes/tags"));
app.use("/api/training", require("./server/routes/training"));
app.use("/api/profile", require("./server/routes/profile"));

// Проверка работы сервера
app.get("/", (req, res) => {
  res.json({ message: "Neural Trident работает!" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log("Доступные эндпоинты:");
  console.log("  POST /api/register - регистрация");
  console.log("  POST /api/login - вход");
  console.log("  GET  /api/profile - профиль (требует токен)");
  console.log("  PUT  /api/cardsets/:id - редактирование набора (НОВЫЙ)");
});
