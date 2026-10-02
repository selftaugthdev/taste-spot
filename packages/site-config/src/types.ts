/**
 * A single color token expressed as "R G B" (space-separated, 0-255), which is
 * the format Tailwind needs so utilities like `bg-brand/50` can control alpha
 * via CSS variables. See apps/web/tailwind.config.ts.
 */
export type RgbTriplet = string;

export interface SiteColorRamp {
  /** Primary brand color used for CTAs, active states, the globe accent ring. */
  brand: RgbTriplet;
  /** Color brand text/icons should use when placed directly on `brand`. */
  brandForeground: RgbTriplet;
  /** Secondary accent for highlights, badges, streak flames, etc. */
  accent: RgbTriplet;
  /** Page background. */
  background: RgbTriplet;
  /** Default text color. */
  foreground: RgbTriplet;
  /** Card / surface background, one step up from `background`. */
  surface: RgbTriplet;
  /** Border color for cards, dividers, inputs. */
  border: RgbTriplet;
  /** Muted text (captions, secondary copy). */
  muted: RgbTriplet;
}

export interface SiteTheme {
  light: SiteColorRamp;
  dark: SiteColorRamp;
  /** Path under /public for the site's logo (SVG preferred). */
  logo: string;
  /** Path under /public for the default Open Graph share image. */
  ogImage: string;
}

export interface SiteCategory {
  slug: string;
  label: string;
  description: string;
}

export interface SiteProConfig {
  trialDays: number;
  monthlyPriceDisplay: string;
  yearlyPriceDisplay: string;
  /** Env var names (not values) that hold the Stripe Price IDs for this site. */
  monthlyPriceIdEnvVar: string;
  yearlyPriceIdEnvVar: string;
}

export interface SiteSocialLinks {
  twitter?: string;
  instagram?: string;
  tiktok?: string;
}

export interface SiteConfig {
  /** Matches the SITE_ID env var and the folder name under /sites. */
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Placeholder until a real domain is purchased; drives canonical URLs. */
  domain: string;
  defaultLocale: string;
  supportedLocales: string[];
  theme: SiteTheme;
  categories: SiteCategory[];
  pro: SiteProConfig;
  social: SiteSocialLinks;
}
