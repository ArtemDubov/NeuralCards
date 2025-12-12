const profileService = require("../services/profileService");

exports.getProfile = async (req, res) => {
  try {
    console.log("=== GET /api/profile ===");
    console.log("📦 Запрос от пользователя ID:", req.userId);

    const user = await profileService.getUserProfile(req.userId);
    console.log("✅ Профиль успешно загружен для пользователя:", user.email);
    res.json(user);
  } catch (error) {
    console.error("🔥 Ошибка получения профиля:", error);
    res.status(error.message === "User not found" ? 404 : 500).json({
      error: error.message,
    });
  }
};

exports.updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    console.log("=== PUT /api/profile/email ===");
    console.log("👤 Пользователь ID:", req.userId);
    console.log("📧 Новый email:", newEmail);

    const updatedUser = await profileService.updateEmail(
      req.userId,
      newEmail,
      password
    );
    console.log("✅ Email успешно обновлен");
    res.json({
      success: true,
      message: "Email успешно обновлен",
      user: updatedUser,
    });
  } catch (error) {
    console.error("🔥 Ошибка обновления email:", error);
    const status = error.message.includes("Invalid")
      ? 400
      : error.message.includes("already in use")
      ? 409
      : 500;
    res.status(status).json({ error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log("=== PUT /api/profile/password ===");
    console.log("👤 Пользователь ID:", req.userId);

    await profileService.updatePassword(
      req.userId,
      currentPassword,
      newPassword
    );
    console.log("✅ Пароль успешно обновлен");
    res.json({ success: true, message: "Пароль успешно обновлен" });
  } catch (error) {
    console.error("🔥 Ошибка обновления пароля:", error);
    const status = error.message.includes("Invalid")
      ? 401
      : error.message.includes("must be")
      ? 400
      : 500;
    res.status(status).json({ error: error.message });
  }
};

exports.updateName = async (req, res) => {
  try {
    const { newName, password } = req.body;
    console.log("=== PUT /api/profile/name ===");
    console.log("👤 Пользователь ID:", req.userId);
    console.log("👤 Новое имя:", newName);

    const updatedUser = await profileService.updateName(
      req.userId,
      newName,
      password
    );
    console.log("✅ Имя успешно обновлено");
    res.json({
      success: true,
      message: "Имя успешно обновлено",
      user: updatedUser,
    });
  } catch (error) {
    console.error("🔥 Ошибка обновления имени:", error);
    const status = error.message.includes("Invalid")
      ? 401
      : error.message.includes("must be")
      ? 400
      : 500;
    res.status(status).json({ error: error.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const { emoji, color, imageUrl } = req.body;
    console.log("=== PATCH /api/profile/avatar ===");
    console.log("👤 Пользователь ID:", req.userId);
    console.log("📥 Данные запроса:", { emoji, color, imageUrl });

    const updatedUser = await profileService.updateAvatar(req.userId, {
      emoji,
      color,
      imageUrl,
    });
    console.log("✅ Аватар успешно обновлен");
    res.json({
      success: true,
      message: "Аватар обновлен",
      user: updatedUser,
    });
  } catch (error) {
    console.error("🔥 Ошибка обновления аватара:", error);
    res.status(error.message.includes("No data") ? 400 : 500).json({
      error: error.message,
    });
  }
};

exports.updatePremium = async (req, res) => {
  try {
    const { action } = req.body;
    console.log("=== PATCH /api/profile/premium ===");
    console.log("👤 Пользователь ID:", req.userId, "Действие:", action);

    const updatedUser = await profileService.updatePremiumStatus(
      req.userId,
      action
    );
    console.log("✅ Премиум статус обновлен");
    res.json({
      success: true,
      message:
        action === "activate" ? "Премиум активирован" : "Премиум деактивирован",
      user: updatedUser,
    });
  } catch (error) {
    console.error("🔥 Ошибка обновления премиум статуса:", error);
    res.status(500).json({ error: error.message });
  }
};

// Для загрузки фото (нужны файлы) - оставляем пока что
exports.uploadAvatar = async (req, res) => {
  try {
    // Эта функция требует работы с файлами - пока оставляем как есть
    // Можно вынести в отдельный сервис
    res.status(501).json({ error: "Not implemented yet in new structure" });
  } catch (error) {
    console.error("🔥 Ошибка загрузки аватара:", error);
    res.status(500).json({ error: error.message });
  }
};
