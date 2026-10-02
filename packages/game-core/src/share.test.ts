import { describe, expect, it } from "vitest";
import { buildShareText } from "./share";
import type { GuessResult } from "./types";

describe("buildShareText", () => {
  const results: GuessResult[] = [
    { questionId: "q1", guess: { lat: 1, lng: 1 }, distanceKm: 12.3, score: 950 },
    { questionId: "q2", guess: { lat: 2, lng: 2 }, distanceKm: 1800.4, score: 420 },
  ];

  it("includes the site name, date, score, and one emoji per question", () => {
    const text = buildShareText({
      siteName: "TasteSpot",
      dateLabel: "Oct 2, 2026",
      totalScore: 1370,
      maxScore: 5000,
      results,
      shareUrl: "https://tastespot.example",
    });

    expect(text).toContain("TasteSpot");
    expect(text).toContain("Oct 2, 2026");
    expect(text).toContain("1370/5000");
    expect(text).toContain("https://tastespot.example");
    // one emoji per question, and no leaked distances/coordinates
    expect([...text.matchAll(/\p{Extended_Pictographic}/gu)]).toHaveLength(results.length);
    expect(text).not.toMatch(/\d+\.\d*\s*km/);
    expect(text).not.toContain("12.3");
    expect(text).not.toContain("1800.4");
  });
});
