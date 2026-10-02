import type { GeoPoint, ScoreBand } from "./types";

const EARTH_RADIUS_KM = 6371;

export const SCORING_CONSTANTS = {
  MAX_SCORE_PER_QUESTION: 1000,
  QUESTIONS_PER_ROUND: 5,
  /**
   * Every this many km past the answer's radius, the score halves. Chosen so
   * the curve roughly matches the target points in the design spec (0km=1000,
   * ~500km≈800, ~2000km≈400, 5000km+ trending to 0) while staying a single,
   * easy-to-explain tunable number.
   */
  DISTANCE_HALF_LIFE_KM: 1500,
  /** Reserved for a future time bonus; unused while the game has no timer. */
  TIME_BONUS_ENABLED: false,
} as const;

export const MAX_SCORE_PER_ROUND =
  SCORING_CONSTANTS.MAX_SCORE_PER_QUESTION * SCORING_CONSTANTS.QUESTIONS_PER_ROUND;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance between two lat/lng points, in kilometers. */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Up to MAX_SCORE_PER_QUESTION, full marks inside `answerRadiusKm`, decaying
 * by half every DISTANCE_HALF_LIFE_KM beyond the radius. Never negative.
 */
export function scoreForDistance(distanceKm: number, answerRadiusKm = 0): number {
  if (distanceKm <= answerRadiusKm) {
    return SCORING_CONSTANTS.MAX_SCORE_PER_QUESTION;
  }
  const effectiveDistance = distanceKm - answerRadiusKm;
  const raw =
    SCORING_CONSTANTS.MAX_SCORE_PER_QUESTION *
    Math.pow(2, -effectiveDistance / SCORING_CONSTANTS.DISTANCE_HALF_LIFE_KM);
  return Math.max(0, Math.round(raw));
}

/** Convenience wrapper: distance + score together for a guess against an answer. */
export function scoreGuess(guess: GeoPoint, answer: GeoPoint, answerRadiusKm = 0) {
  const distanceKm = haversineDistanceKm(guess, answer);
  return { distanceKm, score: scoreForDistance(distanceKm, answerRadiusKm) };
}

export function scoreBand(score: number): ScoreBand {
  if (score >= 800) return "great";
  if (score >= 500) return "good";
  if (score >= 200) return "ok";
  return "poor";
}

export const SCORE_BAND_EMOJI: Record<ScoreBand, string> = {
  great: "\u{1F7E9}", // 🟩
  good: "\u{1F7E8}", // 🟨
  ok: "\u{1F7E7}", // 🟧
  poor: "\u{1F7E5}", // 🟥
};

export function scoreEmoji(score: number): string {
  return SCORE_BAND_EMOJI[scoreBand(score)];
}
