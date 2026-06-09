import {
  Geist,
  Geist_Mono,
  IBM_Plex_Sans_Arabic,
  Inter,
  Instrument_Serif,
  Noto_Sans_Arabic,
} from "next/font/google";

// English body + UI face for the EMPOWER-style redesign. Loaded locally via
// next/font (no CDN). Persian/Arabic keep their own faces via :lang() rules.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Latin-only display serif used exclusively on the Hero H1.
// Persian/Arabic remain on their own faces via the :lang() rules in globals.css.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Arabic primary face. Applied via the :lang(ar) rule in globals.css using
// the --font-arabic variable. Persian uses local IRANSans instead — see
// the @font-face block in globals.css.
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Fallback Arabic-script face for both Persian and Arabic if the primary
// face fails to load.
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export const fontClasses = `${inter.variable} ${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${ibmPlexArabic.variable} ${notoArabic.variable} h-full antialiased`;
