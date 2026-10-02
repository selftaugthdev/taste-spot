import { scoreBand } from "@twih/game-core";
import type { GuessResult, Question } from "@twih/game-core";

const BAND_LABEL: Record<ReturnType<typeof scoreBand>, string> = {
  great: "Great guess!",
  good: "Good guess",
  ok: "Not bad",
  poor: "Way off",
};

const BAND_SWATCH: Record<ReturnType<typeof scoreBand>, string> = {
  great: "text-score-great",
  good: "text-score-good",
  ok: "text-score-ok",
  poor: "text-score-poor",
};

export interface RevealPanelProps {
  question: Question;
  result: GuessResult;
  isLastQuestion: boolean;
  onNext: () => void;
}

export function RevealPanel({ question, result, isLastQuestion, onNext }: RevealPanelProps) {
  const band = scoreBand(result.score);

  return (
    <div className="w-full space-y-4 rounded-t-2xl border-t border-border bg-surface p-5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="flex items-baseline justify-between">
        <span className={`text-lg font-bold ${BAND_SWATCH[band]}`}>{BAND_LABEL[band]}</span>
        <span className="text-2xl font-bold text-foreground">{result.score} pts</span>
      </div>

      <p className="text-sm text-muted">
        {Math.round(result.distanceKm).toLocaleString()} km from the real spot.
      </p>

      <p className="text-sm text-foreground">{question.funFact}</p>

      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-xl bg-brand px-6 py-3 text-base font-semibold text-brand-foreground transition-transform active:scale-[0.98]"
      >
        {isLastQuestion ? "See results" : "Next question"}
      </button>
    </div>
  );
}
