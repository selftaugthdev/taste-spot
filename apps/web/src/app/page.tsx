import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { ThemeToggle } from "@/components/ThemeToggle";

const SCORE_BANDS = [
  { label: "Great", swatch: "bg-score-great" },
  { label: "Good", swatch: "bg-score-good" },
  { label: "Okay", swatch: "bg-score-ok" },
  { label: "Poor", swatch: "bg-score-poor" },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-brand">{siteConfig.name}</h1>
        <p className="text-muted">{siteConfig.tagline}</p>
      </div>

      <Link
        href="/play"
        className="block w-full rounded-xl bg-brand px-6 py-4 text-center text-lg font-semibold text-brand-foreground shadow-sm transition-transform active:scale-[0.98]"
      >
        Play today&apos;s round
      </Link>

      <div className="w-full rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-muted">Score feedback (fixed, not brand-dependent)</p>
        <div className="flex justify-center gap-3">
          {SCORE_BANDS.map((band) => (
            <div key={band.label} className="flex flex-col items-center gap-1">
              <span className={`h-8 w-8 rounded-md ${band.swatch}`} aria-hidden />
              <span className="text-xs text-muted">{band.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ThemeToggle />

      <p className="text-xs text-muted">
        Phase 1 scaffold — the globe, round flow, and scoring land in Phase 2.
      </p>
    </main>
  );
}
