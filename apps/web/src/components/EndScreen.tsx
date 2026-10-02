"use client";

import { useEffect, useState } from "react";
import {
  MAX_SCORE_PER_ROUND,
  buildShareText,
  msUntilNextLocalMidnight,
  scoreBand,
  scoreEmoji,
} from "@twih/game-core";
import type { GuessResult, Question } from "@twih/game-core";
import { siteConfig } from "@/lib/site";

export interface EndScreenProps {
  questions: Question[];
  results: GuessResult[];
  onPlayAgain: () => void;
}

// Tailwind needs full literal class names to generate CSS for them, so this
// can't be a template-literal interpolation like `text-score-${band}`.
const BAND_TEXT_COLOR: Record<ReturnType<typeof scoreBand>, string> = {
  great: "text-score-great",
  good: "text-score-good",
  ok: "text-score-ok",
  poor: "text-score-poor",
};

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function useCountdownToMidnight(): string {
  const [remaining, setRemaining] = useState(() => msUntilNextLocalMidnight());

  useEffect(() => {
    const interval = setInterval(() => setRemaining(msUntilNextLocalMidnight()), 1000);
    return () => clearInterval(interval);
  }, []);

  return formatCountdown(remaining);
}

export function EndScreen({ questions, results, onPlayAgain }: EndScreenProps) {
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const countdown = useCountdownToMidnight();
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  async function handleShare() {
    const dateLabel = new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const text = buildShareText({
      siteName: siteConfig.name,
      dateLabel,
      totalScore,
      maxScore: MAX_SCORE_PER_ROUND,
      results,
      shareUrl: `https://${siteConfig.domain}`,
    });

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled the native share sheet — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      // clipboard can be unavailable (permissions, insecure context); nothing more to do
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-6 px-6 py-12 text-center">
      <div>
        <p className="text-sm text-muted">Today&apos;s score</p>
        <p className="text-5xl font-bold text-brand">
          {totalScore}
          <span className="text-2xl text-muted">/{MAX_SCORE_PER_ROUND}</span>
        </p>
      </div>

      <ul className="w-full space-y-2">
        {questions.map((question, index) => {
          const result = results[index];
          if (!result) return null;
          const band = scoreBand(result.score);
          return (
            <li
              key={question.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 text-left"
            >
              <span className="truncate pr-3 text-sm text-foreground">{question.prompt}</span>
              <span className="flex shrink-0 items-center gap-2 text-sm font-semibold">
                <span aria-hidden>{scoreEmoji(result.score)}</span>
                <span className={BAND_TEXT_COLOR[band]}>{result.score}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={handleShare}
        className="w-full rounded-xl bg-brand px-6 py-4 text-lg font-semibold text-brand-foreground transition-transform active:scale-[0.98]"
      >
        {shareStatus === "copied" ? "Copied to clipboard!" : "Share result"}
      </button>

      <p className="text-sm text-muted">Next round in {countdown}</p>

      <p className="text-xs text-muted">
        Pro unlocks the full archive, unlimited rounds, and category packs — coming soon.
      </p>

      <button
        type="button"
        onClick={onPlayAgain}
        className="text-sm text-muted underline underline-offset-2"
      >
        Play again (mock mode — one round/day is enforced once the backend lands)
      </button>
    </main>
  );
}
