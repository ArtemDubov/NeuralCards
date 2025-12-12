const jwt = require("jsonwebtoken");
const JWT_SECRET = "neural-trident-secret-key";

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("🔐 Auth header:", authHeader);

  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    console.log("❌ No token provided");
    return res.status(401).json({ error: "Нет токена" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token decoded. User ID:", decoded.userId);

    // Убедимся, что userId есть
    if (!decoded.userId) {
      console.log("❌ No userId in token");
      return res.status(401).json({ error: "Неверный токен" });
    }

    req.userId = Number(decoded.userId);
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    res.status(401).json({ error: "Неверный токен" });
  }
};

module.exports = authMiddleware;
