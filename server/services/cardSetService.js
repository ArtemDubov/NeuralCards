// server/services/cardSetService.js
const cardSetRepository = require("../repositories/cardSetRepository");

exports.getCardSets = async (userId) => {
  try {
    console.log("🔍 [SERVICE] Получение наборов для пользователя:", userId);

    const cardSets = await cardSetRepository.findAllByUser(userId);

    console.log("✅ [SERVICE] Проверка isFavorite для первого набора:", {
      id: cardSets[0]?.id,
      favoriteCardSetsCount: cardSets[0]?._count?.favoriteCardSets,
      isFavorite: cardSets[0]?._count?.favoriteCardSets > 0,
    });

    const formattedCardSets = cardSets.map((set) => ({
      ...set,
      cardsCount: set._count.cards,
      isFavorite: set._count.favoriteCardSets > 0,
      _count: undefined,
    }));

    console.log("✅ [SERVICE] Наборы обработаны:", {
      total: formattedCardSets.length,
      withFavorites: formattedCardSets.filter((s) => s.isFavorite).length,
    });

    return formattedCardSets;
  } catch (error) {
    console.error("❌ [SERVICE] Ошибка получения наборов:", error);
    throw error;
  }
};

exports.getCardSetById = async (id, userId) => {
  try {
    console.log("🔍 [SERVICE] Получение набора по ID:", { id, userId });

    const cardSet = await cardSetRepository.findById(id);

    if (!cardSet) {
      throw new Error("Набор не найден");
    }

    if (cardSet.authorId !== userId && !cardSet.isPublic) {
      throw new Error("Нет доступа к этому набору");
    }

    const formattedCardSet = {
      ...cardSet,
      isFavorite: cardSet._count.favoriteCardSets > 0,
      _count: undefined,
    };

    return formattedCardSet;
  } catch (error) {
    console.error("❌ [SERVICE] Ошибка получения набора:", error);
    throw error;
  }
};

exports.createCardSet = async (data, userId) => {
  try {
    console.log("🔍 [SERVICE] Создание набора:", { data, userId });

    const { title, description, isPublic, tags } = data;

    const cardSet = await cardSetRepository.create({
      title,
      description: description || null,
      isPublic: isPublic || false,
      authorId: userId,
      tags,
    });

    return cardSet;
  } catch (error) {
    console.error("❌ [SERVICE] Ошибка создания набора:", error);
    throw error;
  }
};

exports.updateCardSet = async (id, data, userId) => {
  try {
    console.log("🔍 [SERVICE] Обновление набора:", { id, data, userId });

    const { title, description, isPublic, tags } = data;

    const existingSet = await cardSetRepository.findByIdSimple(id);

    if (!existingSet) {
      throw new Error("Набор не найден");
    }

    if (existingSet.authorId !== userId) {
      throw new Error("Нет прав для обновления этого набора");
    }

    const updateData = {
      title: title !== undefined ? title : existingSet.title,
      description:
        description !== undefined
          ? description || null
          : existingSet.description,
      isPublic:
        isPublic !== undefined ? Boolean(isPublic) : existingSet.isPublic,
      tags,
    };

    const updatedSet = await cardSetRepository.update(id, updateData);
    console.log("✅ [SERVICE] Набор обновлён:", updatedSet.id);

    return updatedSet;
  } catch (error) {
    console.error("❌ [SERVICE] Ошибка обновления набора:", error);
    throw error;
  }
};

exports.deleteCardSet = async (id, userId) => {
  try {
    console.log("🔍 [SERVICE] Удаление набора:", { id, userId });

    const existingSet = await cardSetRepository.findByIdSimple(id);

    if (!existingSet) {
      throw new Error("Набор не найден");
    }

    if (existingSet.authorId !== userId) {
      throw new Error("Нет прав для удаления этого набора");
    }

    await cardSetRepository.delete(id);
    return { message: "Набор удален" };
  } catch (error) {
    console.error("❌ [SERVICE] Ошибка удаления набора:", error);
    throw error;
  }
};

exports.searchCardSets = async (query, userId) => {
  try {
    console.log("🔍 [SERVICE] Поиск наборов:", { query, userId });

    const cardSets = await cardSetRepository.search(query, userId);

    const formattedCardSets = cardSets.map((set) => ({
      ...set,
      cardsCount: set._count.cards,
      isFavorite: set._count.favoriteCardSets > 0,
      _count: undefined,
    }));

    return formattedCardSets;
  } catch (error) {
    console.error("❌ [SERVICE] Ошибка поиска наборов:", error);
    throw error;
  }
};
