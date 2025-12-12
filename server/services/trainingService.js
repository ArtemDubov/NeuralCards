// server/services/trainingService.js
const trainingRepository = require("../repositories/trainingRepository");

const getNextInterval = (currentDifficulty, wasCorrect) => {
  if (!wasCorrect) {
    return 1; // Повторить завтра если неправильно
  }

  const intervals = {
    0: 3, // Легко - 3 дня
    1: 2, // Средне - 2 дня
    2: 1, // Трудно - 1 день
  };

  return intervals[currentDifficulty] || 1;
};

exports.getNextCard = async (setId, userId) => {
  try {
    console.log(
      `🔍 [SERVICE] Getting next card for set ${setId}, user ${userId}`
    );

    const cardSet = await trainingRepository.findCardSetById(setId);
    if (!cardSet) {
      throw new Error("Card set not found");
    }

    // 1. Ищем карточки для повторения
    const reviewCards = await trainingRepository.findReviewCards(setId, userId);
    if (reviewCards.length > 0) {
      return {
        card: reviewCards[0],
        type: "review",
        totalDue: reviewCards.length,
        message: `Found ${reviewCards.length} cards due for review`,
      };
    }

    // 2. Ищем новые карточки
    const newCards = await trainingRepository.findNewCards(setId, userId);
    if (newCards.length > 0) {
      return {
        card: newCards[0],
        type: "new",
        totalDue: 0,
        message: "New card for learning",
      };
    }

    // 3. Если все карточки изучены
    const allCards = await trainingRepository.findAllCardsInSet(setId);
    if (allCards.length === 0) {
      throw new Error("No cards found in this set");
    }

    return {
      card: null,
      type: "completed",
      totalDue: 0,
      message: "All cards mastered! Great job!",
    };
  } catch (error) {
    console.error("❌ [SERVICE] Error getting next card:", error);
    throw error;
  }
};

exports.submitAnswer = async (cardId, difficulty, isCorrect, userId) => {
  try {
    console.log(
      `🔍 [SERVICE] Submitting answer for card ${cardId}, user ${userId}`
    );

    if (difficulty === undefined || isCorrect === undefined) {
      throw new Error("Missing difficulty or isCorrect");
    }

    const nextInterval = getNextInterval(difficulty, isCorrect);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextInterval);

    const progressData = {
      difficulty: parseInt(difficulty),
      interval: nextInterval,
      nextReview: nextReview,
      isCorrect: isCorrect,
    };

    const progress = await trainingRepository.upsertCardProgress(
      userId,
      cardId,
      progressData
    );

    return {
      success: true,
      progress,
      nextReview: nextReview.toISOString().split("T")[0],
    };
  } catch (error) {
    console.error("❌ [SERVICE] Error submitting answer:", error);
    throw error;
  }
};

exports.getProgress = async (setId, userId) => {
  try {
    const [totalCards, studiedCards, dueCards, masteredCards] =
      await Promise.all([
        trainingRepository.getTotalCardsInSet(setId),
        trainingRepository.getStudiedCardsCount(setId, userId),
        trainingRepository.getDueCardsCount(setId, userId),
        trainingRepository.getMasteredCardsCount(setId, userId),
      ]);

    return {
      totalCards,
      studiedCards,
      dueCards,
      masteredCards,
      progressPercentage:
        totalCards > 0 ? Math.round((studiedCards / totalCards) * 100) : 0,
    };
  } catch (error) {
    console.error("❌ [SERVICE] Error getting progress:", error);
    throw error;
  }
};
