import type { SiteColorRamp, SiteConfig } from "@twih/site-config";
import { siteConfig as food } from "@twih/site-food";

// Add each new site's config here (and to its package.json dependency + this
// import list) as it's built. apps/web/next.config.ts bakes SITE_ID into the
// static export at build time, so each deployed site only ever ships the one
// config it was built with.
const registry: Record<string, SiteConfig> = {
  food,
};

function resolveSiteId(): string {
  const id = process.env.SITE_ID ?? "food";
  if (!(id in registry)) {
    throw new Error(
      `Unknown SITE_ID "${id}". Known sites: ${Object.keys(registry).join(", ")}. ` +
        `Set SITE_ID when running dev/build, e.g. SITE_ID=food pnpm dev.`,
    );
  }
  return id;
}

export const siteConfig: SiteConfig = registry[resolveSiteId()]!;

/** Renders one color ramp (light or dark) as CSS custom property declarations. */
function ramToCssVars(ramp: SiteColorRamp): string {
  return [
    `--color-brand: ${ramp.brand};`,
    `--color-brand-foreground: ${ramp.brandForeground};`,
    `--color-accent: ${ramp.accent};`,
    `--color-background: ${ramp.background};`,
    `--color-foreground: ${ramp.foreground};`,
    `--color-surface: ${ramp.surface};`,
    `--color-border: ${ramp.border};`,
    `--color-muted: ${ramp.muted};`,
  ].join(" ");
}

/**
 * Produces a `<style>` body that defines this site's brand colors for both
 * color schemes. Score colors are intentionally absent here — they're fixed
 * in globals.css and never vary by site.
 */
export function siteThemeCss(config: SiteConfig): string {
  return `:root { ${ramToCssVars(config.theme.light)} } .dark { ${ramToCssVars(config.theme.dark)} }`;
}
