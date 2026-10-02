import { scoreEmoji } from "./scoring";
import type { GuessResult } from "./types";

export interface ShareTextOptions {
  siteName: string;
  /** Human-readable date or round label, e.g. "Oct 2, 2026". */
  dateLabel: string;
  totalScore: number;
  maxScore: number;
  results: GuessResult[];
  shareUrl: string;
}

/** Share text never includes coordinates, distances, or question text — only the score bands. */
export function buildShareText({
  siteName,
  dateLabel,
  totalScore,
  maxScore,
  results,
  shareUrl,
}: ShareTextOptions): string {
  const emojis = results.map((result) => scoreEmoji(result.score)).join(" ");
  return `${siteName} — ${dateLabel}\n${totalScore}/${maxScore} ${emojis}\n${shareUrl}`;
}
