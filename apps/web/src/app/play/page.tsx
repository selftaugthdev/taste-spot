"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { mockQuestions } from "@twih/site-food";
import { selectDailyQuestions, useRound } from "@twih/game-core";
import type { GlobeArc, GlobeFocus, GlobeMark } from "@twih/game-core";
import { RevealPanel } from "@/components/RevealPanel";
import { EndScreen } from "@/components/EndScreen";

// react-globe.gl touches `window`/WebGL at module load, which breaks the
// static export's build-time prerender pass — ssr:false keeps it client-only.
// (Must import a literal default-exporting module for the exclusion to work;
// see GlobeSurfaceClient.tsx.)
const GlobeSurface = dynamic(() => import("@/components/GlobeSurfaceClient"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-surface" />,
});

const GUESS_COLOR = "#2d9c98"; // accent (teal) — matches theme.dark.accent
const ANSWER_COLOR = "#22c55e"; // score-great green — unambiguous "this is correct"

// Always the bright, true-color Blue Marble texture, regardless of the page's
// light/dark theme — a night-lights texture looks moody but makes landmasses
// nearly impossible to make out, which hurts tap accuracy far more than it
// helps atmosphere. Gameplay legibility wins over matching the page theme.
const GLOBE_IMAGE_URL = "/globe/earth-blue-marble.jpg";

export default function PlayPage() {
  const todaysQuestions = useMemo(() => selectDailyQuestions(mockQuestions), []);
  const { state, currentQuestion, totalScore, submitGuess, nextQuestion, restart } =
    useRound(todaysQuestions);

  if (state.phase === "finished") {
    return <EndScreen questions={state.questions} results={state.results} onPlayAgain={restart} />;
  }

  if (!currentQuestion) return null;

  const currentResult =
    state.phase === "revealed" ? state.results[state.results.length - 1] : undefined;

  const marks: GlobeMark[] = [];
  let arc: GlobeArc | null = null;
  let focus: GlobeFocus | null = null;

  if (state.phase === "revealed" && currentResult) {
    marks.push({ id: "guess", point: currentResult.guess, color: GUESS_COLOR });
    marks.push({ id: "answer", point: currentQuestion.answer, color: ANSWER_COLOR });
    arc = { from: currentResult.guess, to: currentQuestion.answer, color: "#a1a1aa" };

    // Naive midpoint + distance-scaled zoom so both pins stay in frame. Breaks
    // down for near-antipodal guesses (midpoint of lat/lng isn't geodesic) —
    // acceptable for MVP; a proper great-circle midpoint can replace this later.
    focus = {
      center: {
        lat: (currentResult.guess.lat + currentQuestion.answer.lat) / 2,
        lng: (currentResult.guess.lng + currentQuestion.answer.lng) / 2,
      },
      // Floor raised from 0.8: the 4096px texture visibly softens past this
      // zoom level (it's a single static image, not map tiles), so this caps
      // how close the reveal camera gets rather than magnifying into blur.
      altitude: Math.min(3.2, Math.max(1.1, currentResult.distanceKm / 4000)),
    };
  }

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 text-sm text-muted">
        <span>
          Question {state.currentIndex + 1} of {state.questions.length}
        </span>
        <span>{totalScore} pts</span>
      </div>

      <div className="px-4 pb-3">
        <p className="text-lg font-semibold text-foreground">{currentQuestion.prompt}</p>
      </div>

      <div className="relative min-h-0 flex-1">
        <GlobeSurface
          marks={marks}
          arc={arc}
          interactive={state.phase === "guessing"}
          onTap={submitGuess}
          focus={focus}
          globeImageUrl={GLOBE_IMAGE_URL}
        />
      </div>

      {state.phase === "revealed" && currentResult && (
        <RevealPanel
          question={currentQuestion}
          result={currentResult}
          isLastQuestion={state.currentIndex >= state.questions.length - 1}
          onNext={nextQuestion}
        />
      )}
    </main>
  );
}
