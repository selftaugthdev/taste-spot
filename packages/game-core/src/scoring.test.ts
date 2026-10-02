import { describe, expect, it } from "vitest";
import {
  SCORING_CONSTANTS,
  haversineDistanceKm,
  scoreBand,
  scoreForDistance,
  scoreGuess,
} from "./scoring";

describe("haversineDistanceKm", () => {
  it("returns 0 for identical points", () => {
    expect(haversineDistanceKm({ lat: 48.8566, lng: 2.3522 }, { lat: 48.8566, lng: 2.3522 })).toBe(0);
  });

  it("matches the known quarter-circumference distance from the equator to the pole", () => {
    const distance = haversineDistanceKm({ lat: 0, lng: 0 }, { lat: 90, lng: 0 });
    // pi * R / 2, R = 6371km
    expect(distance).toBeCloseTo(10007.5, 0);
  });

  it("is symmetric", () => {
    const a = { lat: 51.5072, lng: -0.1276 }; // London
    const b = { lat: 40.7128, lng: -74.006 }; // New York
    expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a), 6);
  });
});

describe("scoreForDistance", () => {
  it("awards full points at zero distance", () => {
    expect(scoreForDistance(0)).toBe(SCORING_CONSTANTS.MAX_SCORE_PER_QUESTION);
  });

  it("awards full points anywhere inside the answer radius", () => {
    expect(scoreForDistance(80, 100)).toBe(SCORING_CONSTANTS.MAX_SCORE_PER_QUESTION);
    expect(scoreForDistance(100, 100)).toBe(SCORING_CONSTANTS.MAX_SCORE_PER_QUESTION);
  });

  it("roughly matches the target decay curve from the design spec", () => {
    expect(scoreForDistance(500)).toBeGreaterThan(750);
    expect(scoreForDistance(500)).toBeLessThan(850);

    expect(scoreForDistance(2000)).toBeGreaterThan(350);
    expect(scoreForDistance(2000)).toBeLessThan(450);

    // 5000km+ should trend toward (but needn't hit) zero
    expect(scoreForDistance(5000)).toBeLessThan(150);
    expect(scoreForDistance(15000)).toBeLessThan(20);
  });

  it("measures decay from the edge of the answer radius, not from its center", () => {
    const noRadius = scoreForDistance(600, 0);
    const withRadius = scoreForDistance(600, 100); // effective distance 500
    expect(withRadius).toBeGreaterThan(noRadius);
  });

  it("never goes negative and is monotonically non-increasing with distance", () => {
    const distances = [0, 100, 500, 1000, 2000, 5000, 10000, 20000];
    let previous = Infinity;
    for (const d of distances) {
      const score = scoreForDistance(d);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(previous);
      previous = score;
    }
  });
});

describe("scoreGuess", () => {
  it("combines distance and score for a guess against an answer", () => {
    const answer = { lat: 48.8566, lng: 2.3522 };
    const result = scoreGuess(answer, answer);
    expect(result.distanceKm).toBe(0);
    expect(result.score).toBe(SCORING_CONSTANTS.MAX_SCORE_PER_QUESTION);
  });
});

describe("scoreBand", () => {
  it("buckets scores into the right band", () => {
    expect(scoreBand(1000)).toBe("great");
    expect(scoreBand(800)).toBe("great");
    expect(scoreBand(799)).toBe("good");
    expect(scoreBand(500)).toBe("good");
    expect(scoreBand(499)).toBe("ok");
    expect(scoreBand(200)).toBe("ok");
    expect(scoreBand(199)).toBe("poor");
    expect(scoreBand(0)).toBe("poor");
  });
});
