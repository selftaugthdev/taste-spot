import type { SiteConfig } from "@twih/site-config";

/**
 * TasteSpot — the Food & Drink site.
 *
 * Domain is a placeholder until a real one is purchased; nothing else in the
 * app needs to change when it's swapped in (see README "Changing the domain").
 *
 * Theme: mustard & charcoal brand, with a teal accent. Score feedback colors
 * (🟩🟨🟧🟥) are intentionally NOT part of this theme — they're fixed semantic
 * tokens defined once in apps/web/src/app/globals.css so they stay legible and
 * unambiguous no matter which site's brand color they sit next to.
 */
export const siteConfig: SiteConfig = {
  id: "food",
  name: "TasteSpot",
  tagline: "Tap where it was first made.",
  description:
    "A daily geography game for food and drink lovers. Five dishes, drinks, and ingredients a day — guess where each one truly comes from.",
  domain: "tastespot.example", // TODO: replace once a real domain is purchased

  defaultLocale: "en",
  supportedLocales: ["en"],

  theme: {
    light: {
      brand: "169 121 15", // #a9790f — deepened mustard for AA contrast on white
      brandForeground: "255 251 235", // warm near-white
      accent: "13 118 115", // #0d7673 — deepened teal for contrast on white
      background: "250 250 249", // #fafaf9
      foreground: "28 25 23", // #1c1917
      surface: "255 255 255",
      border: "231 229 228", // #e7e5e4
      muted: "120 113 108", // #78716c
    },
    dark: {
      brand: "217 165 33", // #d9a521 — mustard
      brandForeground: "28 25 23", // #1c1917
      accent: "45 156 152", // #2d9c98 — teal
      background: "24 24 27", // #18181b charcoal
      foreground: "250 250 249", // #fafaf9
      surface: "39 39 42", // #27272a
      border: "63 63 70", // #3f3f46
      muted: "161 161 170", // #a1a1aa
    },
    logo: "/sites/food/logo.svg",
    // TODO(phase 7): replace with a generated PNG/JPG once OG image generation lands.
    ogImage: "/sites/food/og-default.svg",
  },

  categories: [
    { slug: "cheese", label: "Cheese", description: "Where the world's great cheeses were first made." },
    { slug: "beer", label: "Beer", description: "The birthplaces of beer styles from lager to stout." },
    { slug: "wine", label: "Wine", description: "Origins of grape varieties and wine regions." },
    { slug: "cocktails", label: "Cocktails", description: "The bars and cities where classic cocktails were invented." },
    { slug: "bread-pastry", label: "Bread & Pastry", description: "From sourdough to croissants, where doughs were born." },
    { slug: "street-food", label: "Street Food", description: "Iconic street food and where it first hit the cart or stall." },
    { slug: "desserts", label: "Desserts", description: "The origins of the world's favorite sweets." },
    { slug: "spices", label: "Spices", description: "Where key spices were first cultivated or traded." },
    { slug: "coffee-tea", label: "Coffee & Tea", description: "The origins of coffee and tea traditions worldwide." },
    { slug: "national-dishes", label: "National Dishes", description: "Dishes that define a country or region's cuisine." },
  ],

  pro: {
    trialDays: 7,
    monthlyPriceDisplay: "€2.99/mo",
    yearlyPriceDisplay: "€19.99/yr",
    monthlyPriceIdEnvVar: "STRIPE_PRICE_ID_FOOD_MONTHLY",
    yearlyPriceIdEnvVar: "STRIPE_PRICE_ID_FOOD_YEARLY",
  },

  social: {},
};
