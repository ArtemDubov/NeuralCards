const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");

class ProfileService {
  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    // Преобразуем URL для фронтенда
    if (user.avatarUrl && !user.avatarUrl.startsWith("http")) {
      const cleanUrl = user.avatarUrl.replace(/^\/+/, "").replace(/^api\//, "");
      user.avatarUrl = `/api/${cleanUrl}`;
    }

    return user;
  }

  async updateEmail(userId, newEmail, password) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new Error("User not found");

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) throw new Error("Invalid email format");

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error("Invalid password");

    // Проверка на существующий email
    const existingUser = await userRepository.findByEmail(newEmail);
    if (existingUser && existingUser.id !== userId) {
      throw new Error("Email already in use");
    }

    return await userRepository.update(userId, { email: newEmail });
  }

  async updatePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new Error("User not found");

    if (newPassword.length < 8)
      throw new Error("Password must be at least 8 characters");
    if (currentPassword === newPassword)
      throw new Error("New password must be different");

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) throw new Error("Invalid current password");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await userRepository.updatePassword(userId, hashedPassword);
  }

  async updateName(userId, newName, password) {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new Error("User not found");

    if (newName.trim().length < 2)
      throw new Error("Name must be at least 2 characters");
    if (newName.trim().length > 50)
      throw new Error("Name must not exceed 50 characters");

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new Error("Invalid password");

    return await userRepository.update(userId, { name: newName.trim() });
  }

  async updateAvatar(userId, avatarData) {
    const { emoji, color, imageUrl } = avatarData;

    const updateData = {};
    if (emoji !== undefined) updateData.avatarEmoji = emoji || null;
    if (color !== undefined) updateData.avatarColor = color;
    if (imageUrl !== undefined && imageUrl !== null) {
      updateData.avatarUrl = imageUrl;
      updateData.avatarEmoji = null;
      updateData.avatarColor = null;
    }

    if (emoji === null && color === null && imageUrl === null) {
      updateData.avatarEmoji = null;
      updateData.avatarColor = null;
      updateData.avatarUrl = null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No data provided for update");
    }

    const updatedUser = await userRepository.updateAvatar(userId, updateData);

    // Преобразуем URL для фронтенда
    if (updatedUser.avatarUrl && !updatedUser.avatarUrl.startsWith("http")) {
      const cleanUrl = updatedUser.avatarUrl
        .replace(/^\/+/, "")
        .replace(/^api\//, "");
      updatedUser.avatarUrl = `/api/${cleanUrl}`;
    }

    return updatedUser;
  }

  async updatePremiumStatus(userId, action) {
    const updateData = {
      isPremium: action === "activate",
      premiumUntil:
        action === "activate"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
    };

    return await userRepository.updatePremiumStatus(
      userId,
      updateData.isPremium,
      updateData.premiumUntil
    );
  }
}

module.exports = new ProfileService();
