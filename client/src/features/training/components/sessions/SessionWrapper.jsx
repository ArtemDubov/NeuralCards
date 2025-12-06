import React from "react";
import { PracticeSession } from "./PracticeSession";
import { QuizSession } from "./QuizSession";
import { SprintSession } from "./SprintSession";
import { MemorySession } from "./MemorySession";
import { WaveSession } from "./WaveSession";
import { ExamSession } from "./ExamSession";
import { AISession } from "./AISession";
import { TournamentSession } from "./TournamentSession";
import { CarouselSession } from "./CarouselSession";
import { CountdownSession } from "./CountdownSession";
import { AudioSession } from "./AudioSession";
import { MixerSession } from "./MixerSession";

const SESSION_COMPONENTS = {
  practice: PracticeSession,
  quiz: QuizSession,
  sprint: SprintSession,
  memory: MemorySession,
  wave: WaveSession,
  exam: ExamSession,
  ai: AISession,
  tournament: TournamentSession,
  carousel: CarouselSession,
  countdown: CountdownSession,
  audio: AudioSession,
  mixer: MixerSession,
};

export const SessionWrapper = ({ mode, cards, onAnswer, onEnd }) => {
  const SessionComponent = SESSION_COMPONENTS[mode] || PracticeSession;

  return (
    <div className="nt-training-container">
      <SessionComponent cards={cards} onAnswer={onAnswer} onEnd={onEnd} />
    </div>
  );
};
