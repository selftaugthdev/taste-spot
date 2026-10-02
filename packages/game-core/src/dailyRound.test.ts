import { describe, expect, it } from "vitest";
import { localDateKey, selectDailyQuestions } from "./dailyRound";
import type { Question } from "./types";

function makeQuestions(n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i}`,
    prompt: `prompt ${i}`,
    category: "test",
    difficulty: 1,
    answer: { lat: 0, lng: 0 },
    answerRadiusKm: 0,
    funFact: "fact",
    sourceUrl: "https://example.com",
    verified: false,
  }));
}

describe("selectDailyQuestions", () => {
  it("picks the same questions for the same calendar date (every player sees the same round)", () => {
    const pool = makeQuestions(20);
    const day = new Date(2026, 0, 15, 9, 30);
    const dayLater = new Date(2026, 0, 15, 23, 59);
    expect(selectDailyQuestions(pool, day)).toEqual(selectDailyQuestions(pool, dayLater));
  });

  it("picks a different round for a different date (usually)", () => {
    const pool = makeQuestions(20);
    const a = selectDailyQuestions(pool, new Date(2026, 0, 15));
    const b = selectDailyQuestions(pool, new Date(2026, 0, 16));
    expect(a).not.toEqual(b);
  });

  it("returns exactly `count` questions, defaulting to 5", () => {
    const pool = makeQuestions(20);
    expect(selectDailyQuestions(pool, new Date(2026, 0, 15))).toHaveLength(5);
    expect(selectDailyQuestions(pool, new Date(2026, 0, 15), 3)).toHaveLength(3);
  });
});

describe("localDateKey", () => {
  it("formats as YYYY-MM-DD", () => {
    expect(localDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
