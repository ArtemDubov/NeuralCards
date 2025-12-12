// server/repositories/userRepository.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const userSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  isPremium: true,
  avatarEmoji: true,
  avatarUrl: true,
  avatarColor: true,
};

class UserRepository {
  async findById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
  }

  async findByIdWithPassword(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async update(userId, data) {
    return await prisma.user.update({
      where: { id: userId },
      data: { ...data, updatedAt: new Date() },
      select: userSelect,
    });
  }

  async updatePassword(userId, hashedPassword) {
    return await this.update(userId, { password: hashedPassword });
  }

  async updateAvatar(userId, avatarData) {
    return await this.update(userId, avatarData);
  }

  async updatePremiumStatus(userId, isPremium, premiumUntil = null) {
    return await this.update(userId, { isPremium, premiumUntil });
  }
}

module.exports = new UserRepository();
