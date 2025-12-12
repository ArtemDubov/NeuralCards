const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class FavoriteRepository {
  // Наборы
  async findFavoriteSets(userId) {
    console.log(`🔍 [REPO] findFavoriteSets для userId: ${userId}`);
    const result = await prisma.favoriteCardSet.findMany({
      where: { userId },
      include: {
        cardSet: {
          include: { cards: true, tags: true },
        },
      },
    });
    console.log(`✅ [REPO] Найдено наборов: ${result.length}`);
    return result;
  }

  async findFavoriteCards(userId) {
    console.log(`🔍 [REPO] findFavoriteCards для userId: ${userId}`);
    const result = await prisma.favoriteCard.findMany({
      where: { userId },
      include: {
        card: { include: { cardSet: true } },
      },
    });
    console.log(`✅ [REPO] Найдено карточек: ${result.length}`);
    return result;
  }

  async findFavoriteSetBySetId(userId, setId) {
    console.log(
      `🔍 [REPO] findFavoriteSetBySetId userId: ${userId}, setId: ${setId}`
    );
    const result = await prisma.favoriteCardSet.findFirst({
      where: { userId, cardSetId: setId },
    });
    console.log(
      `✅ [REPO] Результат: ${result ? `Найден ID ${result.id}` : "Не найден"}`
    );
    return result;
  }

  async findFavoriteCardByCardId(userId, cardId) {
    console.log(
      `🔍 [REPO] findFavoriteCardByCardId userId: ${userId}, cardId: ${cardId}`
    );
    const result = await prisma.favoriteCard.findFirst({
      where: { userId, cardId },
    });
    console.log(
      `✅ [REPO] Результат: ${result ? `Найден ID ${result.id}` : "Не найден"}`
    );
    return result;
  }

  async findFavoriteSetById(favoriteId, userId) {
    console.log(
      `🔍 [REPO] findFavoriteSetById favoriteId: ${favoriteId}, userId: ${userId}`
    );
    const result = await prisma.favoriteCardSet.findFirst({
      where: { id: favoriteId, userId },
    });
    console.log(
      `✅ [REPO] Результат: ${
        result ? `Найден setId ${result.cardSetId}` : "Не найден"
      }`
    );
    return result;
  }

  async findFavoriteCardById(favoriteId, userId) {
    console.log(
      `🔍 [REPO] findFavoriteCardById favoriteId: ${favoriteId}, userId: ${userId}`
    );
    const result = await prisma.favoriteCard.findFirst({
      where: { id: favoriteId, userId },
    });
    console.log(
      `✅ [REPO] Результат: ${
        result ? `Найден cardId ${result.cardId}` : "Не найден"
      }`
    );
    return result;
  }

  async createFavoriteSet(userId, setId) {
    console.log(
      `➕ [REPO] createFavoriteSet userId: ${userId}, setId: ${setId}`
    );
    try {
      const result = await prisma.favoriteCardSet.create({
        data: { userId, cardSetId: setId },
        include: {
          cardSet: {
            include: { cards: true, tags: true },
          },
        },
      });
      console.log(`✅ [REPO] Создана запись ID: ${result.id}`);
      return result;
    } catch (error) {
      console.error(`❌ [REPO] Ошибка создания: ${error.message}`);
      throw error;
    }
  }

  async createFavoriteCard(userId, cardId) {
    console.log(
      `➕ [REPO] createFavoriteCard userId: ${userId}, cardId: ${cardId}`
    );
    try {
      const result = await prisma.favoriteCard.create({
        data: { userId, cardId },
        include: {
          card: { include: { cardSet: true } },
        },
      });
      console.log(`✅ [REPO] Создана запись ID: ${result.id}`);
      return result;
    } catch (error) {
      console.error(`❌ [REPO] Ошибка создания: ${error.message}`);
      throw error;
    }
  }

  async deleteFavoriteSetById(favoriteId) {
    console.log(`➖ [REPO] deleteFavoriteSetById favoriteId: ${favoriteId}`);
    const result = await prisma.favoriteCardSet.delete({
      where: { id: favoriteId },
    });
    console.log(`✅ [REPO] Удалена запись: ${result.id}`);
    return result;
  }

  async deleteFavoriteCardById(favoriteId) {
    console.log(`➖ [REPO] deleteFavoriteCardById favoriteId: ${favoriteId}`);
    const result = await prisma.favoriteCard.delete({
      where: { id: favoriteId },
    });
    console.log(`✅ [REPO] Удалена запись: ${result.id}`);
    return result;
  }

  async deleteFavoriteSetBySetId(userId, setId) {
    console.log(
      `➖ [REPO] deleteFavoriteSetBySetId userId: ${userId}, setId: ${setId}`
    );
    const favorite = await this.findFavoriteSetBySetId(userId, setId);
    if (!favorite) {
      console.log(`⚠️ [REPO] Запись не найдена для удаления`);
      return null;
    }
    const result = await this.deleteFavoriteSetById(favorite.id);
    return result;
  }

  async deleteFavoriteCardByCardId(userId, cardId) {
    console.log(
      `➖ [REPO] deleteFavoriteCardByCardId userId: ${userId}, cardId: ${cardId}`
    );
    const favorite = await this.findFavoriteCardByCardId(userId, cardId);
    if (!favorite) {
      console.log(`⚠️ [REPO] Запись не найдена для удаления`);
      return null;
    }
    const result = await this.deleteFavoriteCardById(favorite.id);
    return result;
  }

  async checkSetIsFavorite(userId, setId) {
    console.log(
      `🔍 [REPO] checkSetIsFavorite userId: ${userId}, setId: ${setId}`
    );
    const result = await prisma.favoriteCardSet.findFirst({
      where: { userId, cardSetId: setId },
      select: { id: true, createdAt: true },
    });
    console.log(
      `✅ [REPO] Результат: ${result ? "В избранном" : "Не в избранном"}`
    );
    return result;
  }

  async checkCardIsFavorite(userId, cardId) {
    console.log(
      `🔍 [REPO] checkCardIsFavorite userId: ${userId}, cardId: ${cardId}`
    );
    const result = await prisma.favoriteCard.findFirst({
      where: { userId, cardId },
      select: { id: true, createdAt: true },
    });
    console.log(
      `✅ [REPO] Результат: ${result ? "В избранном" : "Не в избранном"}`
    );
    return result;
  }
}

module.exports = new FavoriteRepository();
