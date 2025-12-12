// server/repositories/cardRepository.js
const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");
const prisma = new PrismaClient();

exports.create = async (data) => {
  const {
    front,
    back,
    imageUrl,
    audioUrl,
    backImageUrl,
    backAudioUrl,
    cardSetId,
  } = data;

  return await prisma.flashCard.create({
    data: {
      front,
      back,
      imageUrl: imageUrl || null,
      audioUrl: audioUrl || null,
      backImageUrl: backImageUrl || null,
      backAudioUrl: backAudioUrl || null,
      cardSetId: parseInt(cardSetId),
    },
  });
};

exports.findById = async (id) => {
  return await prisma.flashCard.findUnique({
    where: { id: parseInt(id) },
  });
};

exports.update = async (id, data) => {
  const { front, back, imageUrl, audioUrl, backImageUrl, backAudioUrl } = data;

  return await prisma.flashCard.update({
    where: { id: parseInt(id) },
    data: {
      front,
      back,
      imageUrl,
      audioUrl,
      backImageUrl,
      backAudioUrl,
    },
  });
};

exports.delete = async (id) => {
  const card = await prisma.flashCard.findUnique({
    where: { id: parseInt(id) },
  });

  if (!card) {
    throw new Error("Карточка не найдена");
  }

  const deleteFile = (filePath) => {
    if (filePath) {
      const fullPath = path.join(
        __dirname,
        "../uploads",
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

  return await prisma.flashCard.delete({
    where: { id: parseInt(id) },
  });
};

exports.createBatch = async (cardsData, cardSetId) => {
  const cardSet = await prisma.cardSet.findUnique({
    where: { id: parseInt(cardSetId) },
  });

  if (!cardSet) {
    throw new Error("Набор не найден");
  }

  if (!Array.isArray(cardsData)) {
    throw new Error("Ожидается массив карточек");
  }

  const createdCards = [];

  for (const cardData of cardsData) {
    const { front, back } = cardData;

    if (!front && !back) {
      console.log("⚠️ Пропущена пустая карточка:", cardData);
      continue;
    }

    try {
      const card = await prisma.flashCard.create({
        data: {
          front: front?.trim() || "",
          back: back?.trim() || "",
          imageUrl: null,
          audioUrl: null,
          backImageUrl: null,
          backAudioUrl: null,
          cardSetId: parseInt(cardSetId),
        },
      });

      createdCards.push(card);
    } catch (cardError) {
      console.error("❌ Ошибка создания отдельной карточки:", cardError);
    }
  }

  return createdCards;
};
