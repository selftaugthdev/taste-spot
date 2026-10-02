import { useCallback, useMemo, useState } from "react";
import { scoreGuess } from "./scoring";
import type { GeoPoint, GuessResult, Question, RoundState } from "./types";

function initialState(questions: Question[]): RoundState {
  return {
    questions,
    currentIndex: 0,
    phase: "guessing",
    results: [],
    pendingGuess: null,
  };
}

export interface UseRoundReturn {
  state: RoundState;
  currentQuestion: Question | null;
  totalScore: number;
  /** Records a tap as this question's guess and moves the round into "revealed". */
  submitGuess: (point: GeoPoint) => void;
  /** Advances to the next question, or to "finished" after the last one. */
  nextQuestion: () => void;
  /** Restarts the round from question 1 (mock/local play only — Phase 3 enforces one play/day). */
  restart: () => void;
}

/** Drives the 5-question round state machine against a fixed question list. */
export function useRound(questions: Question[]): UseRoundReturn {
  const [state, setState] = useState<RoundState>(() => initialState(questions));

  const currentQuestion = state.questions[state.currentIndex] ?? null;

  const submitGuess = useCallback(
    (point: GeoPoint) => {
      setState((prev) => {
        const question = prev.questions[prev.currentIndex];
        if (prev.phase !== "guessing" || !question) return prev;

        const { distanceKm, score } = scoreGuess(point, question.answer, question.answerRadiusKm);
        const result: GuessResult = { questionId: question.id, guess: point, distanceKm, score };

        return {
          ...prev,
          phase: "revealed",
          pendingGuess: point,
          results: [...prev.results, result],
        };
      });
    },
    [],
  );

  const nextQuestion = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "revealed") return prev;
      const isLastQuestion = prev.currentIndex >= prev.questions.length - 1;
      return {
        ...prev,
        currentIndex: isLastQuestion ? prev.currentIndex : prev.currentIndex + 1,
        phase: isLastQuestion ? "finished" : "guessing",
        pendingGuess: null,
      };
    });
  }, []);

  const restart = useCallback(() => {
    setState(initialState(questions));
  }, [questions]);

  const totalScore = useMemo(
    () => state.results.reduce((sum, result) => sum + result.score, 0),
    [state.results],
  );

  return { state, currentQuestion, totalScore, submitGuess, nextQuestion, restart };
}
