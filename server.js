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

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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

// Подключаем ВСЕ роутеры
app.use("/api/favorites", require("./server/routes/favorites"));
app.use("/api/upload", require("./server/routes/uploads"));
app.use("/api/cardsets", require("./server/routes/cardsets"));
app.use("/api/cardsets", require("./server/routes/cards"));
app.use("/api/tags", require("./server/routes/tags"));
app.use("/api/search", require("./server/routes/search"));
app.use("/api/training", require("./server/routes/training"));
app.use("/api/profile", require("./server/routes/profile"));

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

// Получить профиль пользователя
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

// Проверка работы сервера
app.get("/", (req, res) => {
  res.json({ message: "Neural Trident работает!" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
