// server/services/cardService.js
const cardRepository = require("../repositories/cardRepository");

exports.addCard = async (data) => {
  try {
    console.log("🔍 [SERVICE] Добавление карточки:", data);
    return await cardRepository.create(data);
  } catch (error) {
    console.error("❌ [SERVICE] Ошибка создания карточки:", error);
    throw error;
  }
};

exports.updateCard = async (id, data) => {
  try {
    console.log("🔍 [SERVICE] Обновление карточки:", { id, data });
    return await cardRepository.update(id, data);
  } catch (error) {
    console.error("❌ [SERVICE] Ошибка обновления карточки:", error);
    throw error;
  }
};

exports.deleteCard = async (id) => {
  try {
    console.log("🔍 [SERVICE] Удаление карточки:", id);
    await cardRepository.delete(id);
    return { message: "Карточка удалена" };
  } catch (error) {
    console.error("❌ [SERVICE] Ошибка удаления карточки:", error);
    throw error;
  }
};

exports.addBatchCards = async (cardsData, cardSetId) => {
  try {
    console.log("📥 [SERVICE] Массовое создание карточек:", {
      cardSetId,
      count: Array.isArray(cardsData) ? cardsData.length : "не массив",
    });

    const createdCards = await cardRepository.createBatch(cardsData, cardSetId);

    console.log("✅ [SERVICE] Создано карточек:", createdCards.length);
    return createdCards;
  } catch (error) {
    console.error("❌ [SERVICE] Ошибка массового создания карточек:", error);
    throw error;
  }
};
