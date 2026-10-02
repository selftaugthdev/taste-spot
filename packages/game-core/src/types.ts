export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Question {
  id: string;
  prompt: string;
  /** Category slug — must match one of the site's `categories` in its SiteConfig. */
  category: string;
  difficulty: 1 | 2 | 3;
  answer: GeoPoint;
  /** 0 for a point answer; >0 when the true answer is a region, not a single spot. */
  answerRadiusKm: number;
  funFact: string;
  /** Internal fact-checking reference — never shown to players. */
  sourceUrl: string;
  /** Only verified questions may be scheduled into a live round (enforced in admin, Phase 5). */
  verified: boolean;
}

export interface GuessResult {
  questionId: string;
  guess: GeoPoint;
  distanceKm: number;
  score: number;
}

export type RoundPhase = "guessing" | "revealed" | "finished";

export interface RoundState {
  questions: Question[];
  currentIndex: number;
  phase: RoundPhase;
  results: GuessResult[];
  /** The in-progress guess for the current question, set the instant the player taps. */
  pendingGuess: GeoPoint | null;
}

export type ScoreBand = "great" | "good" | "ok" | "poor";

// --- MapSurface contract -----------------------------------------------
// Plain data shapes only (no rendering library imports) so any consumer of
// @twih/game-core can use these types without pulling in react-globe.gl —
// only code that imports GlobeSurface.tsx directly pays that cost. A future
// 2D BodyDiagramSurface would accept this same prop shape.

export interface GlobeMark {
  id: string;
  point: GeoPoint;
  color: string;
}

export interface GlobeArc {
  from: GeoPoint;
  to: GeoPoint;
  color?: string;
}

export interface GlobeFocus {
  center: GeoPoint;
  altitude: number;
}

export interface MapSurfaceProps {
  /** Pins to render — e.g. the player's guess and/or the correct answer during reveal. */
  marks: GlobeMark[];
  /** Line drawn between two points during reveal (guess -> answer). */
  arc?: GlobeArc | null;
  /** false once a guess has been made for the current question, to block further taps. */
  interactive: boolean;
  onTap?: (point: GeoPoint) => void;
  /** Camera target the surface animates to; null leaves the camera where it is. */
  focus?: GlobeFocus | null;
}
