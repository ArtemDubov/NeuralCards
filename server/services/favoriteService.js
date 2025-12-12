const favoriteRepository = require("../repositories/favoriteRepository");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class FavoriteService {
  async getUserFavoriteSets(userId) {
    console.log(`📋 [SERVICE] getUserFavoriteSets для userId: ${userId}`);
    const favorites = await favoriteRepository.findFavoriteSets(userId);
    const formatted = favorites.map((fav) => ({
      id: fav.id,
      cardSet: { ...fav.cardSet, isFavorite: true },
      createdAt: fav.createdAt,
    }));
    console.log(`✅ [SERVICE] Возвращено ${formatted.length} наборов`);
    return formatted;
  }

  async getUserFavoriteCards(userId) {
    console.log(`📋 [SERVICE] getUserFavoriteCards для userId: ${userId}`);
    const favorites = await favoriteRepository.findFavoriteCards(userId);
    const formatted = favorites.map((fav) => ({
      id: fav.id,
      card: { ...fav.card, isFavorite: true },
      createdAt: fav.createdAt,
    }));
    console.log(`✅ [SERVICE] Возвращено ${formatted.length} карточек`);
    return formatted;
  }

  async addFavoriteSet(userId, setId) {
    console.log(
      `➕ [SERVICE] addFavoriteSet userId: ${userId}, setId: ${setId}`
    );

    if (!setId) {
      console.error(`❌ [SERVICE] Set ID не указан`);
      throw new Error("Set ID is required");
    }

    const parsedId = parseInt(setId);
    console.log(`🔍 [SERVICE] Парсинг ID: ${setId} -> ${parsedId}`);

    if (isNaN(parsedId)) {
      console.error(`❌ [SERVICE] Некорректный ID: ${setId}`);
      throw new Error("Invalid set ID");
    }

    console.log(`🔍 [SERVICE] Проверяем существование набора ID: ${parsedId}`);

    // Проверяем существование набора
    const cardSet = await prisma.cardSet.findUnique({
      where: { id: parsedId },
    });

    if (!cardSet) {
      console.error(`❌ [SERVICE] Набор не найден ID: ${parsedId}`);

      // Логируем все доступные наборы для отладки
      const allSets = await prisma.cardSet.findMany({
        select: { id: true, title: true, authorId: true },
        take: 10,
      });

      console.log(`📋 [SERVICE] Первые 10 наборов в БД:`, allSets);
      console.log(`👤 [SERVICE] Пользователь ID: ${userId}`);

      throw new Error(
        `Card set ${parsedId} not found. Available sets: ${allSets
          .map((s) => `#${s.id} "${s.title}"`)
          .join(", ")}`
      );
    }

    console.log(
      `✅ [SERVICE] Набор найден: "${cardSet.title}" (ID: ${cardSet.id}, Author: ${cardSet.authorId})`
    );

    // Проверяем не добавлен ли уже в избранное
    const existing = await favoriteRepository.findFavoriteSetBySetId(
      userId,
      parsedId
    );
    if (existing) {
      console.error(`❌ [SERVICE] Набор уже в избранном`);
      throw new Error("Set already in favorites");
    }

    console.log(`✅ [SERVICE] Создаем запись в избранном`);
    const favorite = await favoriteRepository.createFavoriteSet(
      userId,
      parsedId
    );

    const result = {
      id: favorite.id,
      cardSet: { ...favorite.cardSet, isFavorite: true },
      createdAt: favorite.createdAt,
    };

    console.log(`✅ [SERVICE] Набор добавлен, ID записи: ${result.id}`);
    return result;
  }

  async addFavoriteCard(userId, cardId) {
    console.log(
      `➕ [SERVICE] addFavoriteCard userId: ${userId}, cardId: ${cardId}`
    );

    if (!cardId) {
      console.error(`❌ [SERVICE] Card ID не указан`);
      throw new Error("Card ID is required");
    }

    const parsedId = parseInt(cardId);
    console.log(`🔍 [SERVICE] Парсинг ID: ${cardId} -> ${parsedId}`);

    if (isNaN(parsedId)) {
      console.error(`❌ [SERVICE] Некорректный ID: ${cardId}`);
      throw new Error("Invalid card ID");
    }

    console.log(
      `🔍 [SERVICE] Проверяем существование карточки ID: ${parsedId}`
    );

    // Проверяем существование карточки
    const card = await prisma.flashCard.findUnique({
      where: { id: parsedId },
      include: { cardSet: true },
    });

    if (!card) {
      console.error(`❌ [SERVICE] Карточка не найдена ID: ${parsedId}`);

      // Логируем несколько карточек для отладки
      const allCards = await prisma.flashCard.findMany({
        select: { id: true, front: true, cardSetId: true },
        take: 5,
      });

      console.log(`📋 [SERVICE] Первые 5 карточек в БД:`, allCards);

      throw new Error(
        `Card ${parsedId} not found. Available cards: ${allCards
          .map((c) => `#${c.id} "${c.front.substring(0, 30)}..."`)
          .join(", ")}`
      );
    }

    console.log(
      `✅ [SERVICE] Карточка найдена: "${card.front.substring(
        0,
        50
      )}..." (Set ID: ${card.cardSetId})`
    );

    const existing = await favoriteRepository.findFavoriteCardByCardId(
      userId,
      parsedId
    );
    if (existing) {
      console.error(`❌ [SERVICE] Карточка уже в избранном`);
      throw new Error("Card already in favorites");
    }

    console.log(`✅ [SERVICE] Создаем запись в избранном`);
    const favorite = await favoriteRepository.createFavoriteCard(
      userId,
      parsedId
    );

    const result = {
      id: favorite.id,
      card: { ...favorite.card, isFavorite: true },
      createdAt: favorite.createdAt,
    };

    console.log(`✅ [SERVICE] Карточка добавлена, ID записи: ${result.id}`);
    return result;
  }

  async removeFavoriteSet(favoriteId, userId) {
    console.log(
      `➖ [SERVICE] removeFavoriteSet favoriteId: ${favoriteId}, userId: ${userId}`
    );

    const parsedId = parseInt(favoriteId);
    if (isNaN(parsedId)) {
      throw new Error("Invalid favorite ID");
    }

    const favorite = await favoriteRepository.findFavoriteSetById(
      parsedId,
      userId
    );
    if (!favorite) {
      console.error(`❌ [SERVICE] Запись не найдена`);
      throw new Error("Favorite not found");
    }

    await favoriteRepository.deleteFavoriteSetById(parsedId);
    console.log(`✅ [SERVICE] Набор удален из избранного`);
    return parsedId;
  }

  async removeFavoriteCard(favoriteId, userId) {
    console.log(
      `➖ [SERVICE] removeFavoriteCard favoriteId: ${favoriteId}, userId: ${userId}`
    );

    const parsedId = parseInt(favoriteId);
    if (isNaN(parsedId)) {
      throw new Error("Invalid favorite ID");
    }

    const favorite = await favoriteRepository.findFavoriteCardById(
      parsedId,
      userId
    );
    if (!favorite) {
      console.error(`❌ [SERVICE] Запись не найдена`);
      throw new Error("Favorite not found");
    }

    await favoriteRepository.deleteFavoriteCardById(parsedId);
    console.log(`✅ [SERVICE] Карточка удалена из избранного`);
    return parsedId;
  }

  async removeFavoriteSetBySetId(userId, setId) {
    console.log(
      `➖ [SERVICE] removeFavoriteSetBySetId userId: ${userId}, setId: ${setId}`
    );

    const parsedId = parseInt(setId);
    if (isNaN(parsedId)) {
      throw new Error("Invalid set ID");
    }

    const result = await favoriteRepository.deleteFavoriteSetBySetId(
      userId,
      parsedId
    );
    if (!result) {
      console.error(`❌ [SERVICE] Запись не найдена для удаления`);
      throw new Error("Favorite not found");
    }

    console.log(
      `✅ [SERVICE] Набор удален по setId: ${parsedId}, ID записи: ${result.id}`
    );
    return result.id;
  }

  async removeFavoriteCardByCardId(userId, cardId) {
    console.log(
      `➖ [SERVICE] removeFavoriteCardByCardId userId: ${userId}, cardId: ${cardId}`
    );

    const parsedId = parseInt(cardId);
    if (isNaN(parsedId)) {
      throw new Error("Invalid card ID");
    }

    const result = await favoriteRepository.deleteFavoriteCardByCardId(
      userId,
      parsedId
    );
    if (!result) {
      console.error(`❌ [SERVICE] Запись не найдена для удаления`);
      throw new Error("Favorite not found");
    }

    console.log(
      `✅ [SERVICE] Карточка удалена по cardId: ${parsedId}, ID записи: ${result.id}`
    );
    return result.id;
  }

  async checkSetFavorite(userId, setId) {
    console.log(
      `🔍 [SERVICE] checkSetFavorite userId: ${userId}, setId: ${setId}`
    );

    const parsedId = parseInt(setId);
    if (isNaN(parsedId)) {
      return { isFavorite: false, favoriteId: null, createdAt: null };
    }

    const favorite = await favoriteRepository.checkSetIsFavorite(
      userId,
      parsedId
    );
    const result = {
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite.id : null,
      createdAt: favorite ? favorite.createdAt : null,
    };

    console.log(
      `✅ [SERVICE] Результат: ${
        result.isFavorite ? "В избранном" : "Не в избранном"
      }`
    );
    return result;
  }

  async checkCardFavorite(userId, cardId) {
    console.log(
      `🔍 [SERVICE] checkCardFavorite userId: ${userId}, cardId: ${cardId}`
    );

    const parsedId = parseInt(cardId);
    if (isNaN(parsedId)) {
      return { isFavorite: false, favoriteId: null, createdAt: null };
    }

    const favorite = await favoriteRepository.checkCardIsFavorite(
      userId,
      parsedId
    );
    const result = {
      isFavorite: !!favorite,
      favoriteId: favorite ? favorite.id : null,
      createdAt: favorite ? favorite.createdAt : null,
    };

    console.log(
      `✅ [SERVICE] Результат: ${
        result.isFavorite ? "В избранном" : "Не в избранном"
      }`
    );
    return result;
  }
}

module.exports = new FavoriteService();
