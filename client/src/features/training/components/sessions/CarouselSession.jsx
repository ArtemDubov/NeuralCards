import React from "react";
import { useAppStore } from "../../../../shared/stores/appStore";
import { useCarouselMode } from "../../hooks/useCarouselMode";

export const CarouselSession = ({ cards, onAnswer, onEnd }) => {
  const { t } = useAppStore();
  const carousel = useCarouselMode(cards, onAnswer);

  if (carousel.isTransitioning) {
    const nextMode = carousel.carouselStats.nextMode;

    return (
      <div className="nt-session__container">
        <div className="nt-content__card nt-util__text-center">
          <div className="nt-training__completion-icon">🎠</div>

          {nextMode ? (
            <>
              <h2 className="nt-util__text-accent">Следующий режим:</h2>
              <div className="nt-util__flex nt-util__flex-col nt-util__items-center nt-util__gap-sm nt-util__mt-md">
                <div className="nt-training__mode-icon">{nextMode.icon}</div>
                <div className="nt-training__mode-title">{nextMode.name}</div>
              </div>
              <div className="nt-util__text-3xl nt-util__font-bold nt-util__mt-lg">
                3
              </div>
              <p className="nt-util__text-secondary nt-util__mt-sm">
                Подготовка через 3 секунды...
              </p>
            </>
          ) : (
            <>
              <h2 className="nt-util__text-accent">Карусель завершена! 🎉</h2>
              <p className="nt-util__text-secondary">Подведение итогов...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="nt-session__container">
      <div className="nt-training__header">
        <div className="nt-util__flex nt-util__items-center nt-util__gap-md">
          <span className="nt-training__mode-icon">🎠</span>
          <h2 className="nt-util__text-accent">КАРУСЕЛЬ РЕЖИМОВ</h2>
        </div>

        <div className="nt-training__progress">
          Режим {carousel.carouselStats.completedModes + 1} из{" "}
          {carousel.carouselStats.totalModes}
        </div>
      </div>

      <div className="nt-content__card nt-util__mt-lg">
        <div className="nt-util__flex nt-util__items-center nt-util__gap-lg">
          <div className="nt-training__mode-icon nt-util__text-3xl">
            {carousel.currentMode?.icon}
          </div>
          <div className="nt-util__flex nt-util__flex-col nt-util__gap-xs">
            <h3 className="nt-util__text-primary nt-util__font-semibold">
              {carousel.currentMode?.name}
            </h3>
            <p className="nt-util__text-secondary nt-util__text-sm">
              {carousel.modeInstructions}
            </p>
          </div>
        </div>

        {carousel.currentCard && (
          <div className="nt-util__mt-xl">
            <div className="nt-training__card">
              <h4 className="nt-util__text-primary nt-util__text-center">
                {carousel.currentCard.front}
              </h4>

              {carousel.currentMode?.id === "quiz" &&
                carousel.modeButtons.isQuiz && (
                  <div className="nt-util__grid nt-util__gap-md nt-util__mt-lg">
                    {carousel.modeButtons.answers.map((answer, index) => (
                      <button
                        key={index}
                        className="nt-btn nt-btn--training"
                        onClick={() =>
                          carousel.handleAnswer(
                            answer === carousel.currentCard.back,
                            0
                          )
                        }
                      >
                        {answer}
                      </button>
                    ))}
                  </div>
                )}

              {carousel.currentMode?.id === "practice" && (
                <div className="nt-util__text-center nt-util__mt-lg nt-util__text-secondary">
                  <p>
                    Нажмите "Показать ответ", чтобы увидеть правильный ответ
                  </p>
                </div>
              )}

              {carousel.currentMode?.id === "memory" && (
                <div className="nt-util__text-center nt-util__mt-lg nt-util__text-secondary">
                  <p>Запомните эту карточку! Позже нужно будет найти пару.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="nt-util__flex nt-util__gap-md nt-util__mt-xl">
          <button onClick={onEnd} className="nt-btn nt-btn--secondary">
            Завершить карусель
          </button>
          <button
            onClick={carousel.skipCurrentMode}
            className="nt-btn nt-btn--ghost"
            title="Пропустить текущий режим (для отладки)"
          >
            ⏭️ Пропустить режим
          </button>
        </div>
      </div>
    </div>
  );
};
