// server/repositories/trainingRepository.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Проверяем подключение
prisma
  .$connect()
  .then(() => console.log("✅ Prisma Client connected in trainingRepository"))
  .catch((error) => console.error("❌ Failed to connect:", error));

exports.findCardSetById = async (setId) => {
  return await prisma.cardSet.findUnique({
    where: { id: parseInt(setId) },
  });
};

exports.findReviewCards = async (setId, userId) => {
  return await prisma.flashCard.findMany({
    where: {
      cardSetId: parseInt(setId),
      progress: {
        some: {
          userId: userId,
          nextReview: { lte: new Date() },
        },
      },
    },
    include: {
      progress: {
        where: { userId: userId },
      },
    },
    orderBy: {
      progress: {
        nextReview: "asc",
      },
    },
  });
};

exports.findNewCards = async (setId, userId) => {
  return await prisma.flashCard.findMany({
    where: {
      cardSetId: parseInt(setId),
      NOT: {
        progress: {
          some: { userId: userId },
        },
      },
    },
    take: 1,
  });
};

exports.findAllCardsInSet = async (setId) => {
  return await prisma.flashCard.findMany({
    where: { cardSetId: parseInt(setId) },
  });
};

exports.upsertCardProgress = async (userId, cardId, data) => {
  return await prisma.cardProgress.upsert({
    where: {
      userId_cardId: {
        userId: parseInt(userId),
        cardId: parseInt(cardId),
      },
    },
    update: data,
    create: {
      userId: parseInt(userId),
      cardId: parseInt(cardId),
      ...data,
    },
  });
};

exports.getTotalCardsInSet = async (setId) => {
  return await prisma.flashCard.count({
    where: { cardSetId: parseInt(setId) },
  });
};

exports.getStudiedCardsCount = async (setId, userId) => {
  return await prisma.cardProgress.count({
    where: {
      card: { cardSetId: parseInt(setId) },
      userId: userId,
    },
  });
};

exports.getDueCardsCount = async (setId, userId) => {
  return await prisma.cardProgress.count({
    where: {
      card: { cardSetId: parseInt(setId) },
      userId: userId,
      nextReview: { lte: new Date() },
    },
  });
};

exports.getMasteredCardsCount = async (setId, userId) => {
  return await prisma.cardProgress.count({
    where: {
      card: { cardSetId: parseInt(setId) },
      userId: userId,
      difficulty: 0,
    },
  });
};
