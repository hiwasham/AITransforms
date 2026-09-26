import type { Metadata } from "next";
import "../globals.css";
import { fontClasses } from "../fonts";

export const metadata: Metadata = {
  // Canonical custom domain. Makes openGraph/twitter URLs (and future OG
  // images) resolve to absolute URLs; the default Vercel URL 404s.
  metadataBase: new URL("https://v1.aitransforms.ir"),
  title: "AITransforms — Turn Your Business Brain Into AI Systems",
  description:
    "An AI transformation studio that turns business knowledge, workflows, and documents into practical AI assistants, RAG systems, and private agents.",
  openGraph: {
    siteName: "AITransforms",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// English route-group root layout. dir="ltr" at the document root.
export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={fontClasses}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
