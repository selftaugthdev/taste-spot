import type { Question } from "./types";

/** Local calendar date as YYYY-MM-DD, matching the player's own timezone (like Wordle). */
export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashStringToSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

// Deterministic PRNG so "the same day" always shuffles the same way for every player.
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * THIS IS A MOCK STAND-IN for Phase 3's `get_daily_round` Supabase RPC, which
 * will serve an admin-scheduled set of 5 verified questions per calendar
 * date. Until then, this deterministically shuffles the local mock question
 * pool by date so every player sees the same "daily" round without a backend.
 */
export function selectDailyQuestions(
  questions: Question[],
  date: Date = new Date(),
  count = 5,
): Question[] {
  const seed = hashStringToSeed(localDateKey(date));
  const random = mulberry32(seed);
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled.slice(0, count);
}

/** Milliseconds until the player's next local midnight. */
export function msUntilNextLocalMidnight(now: Date = new Date()): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}
