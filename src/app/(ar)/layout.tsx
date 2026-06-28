import type { Metadata } from "next";
import "../globals.css";
import { fontClasses } from "../fonts";

export const metadata: Metadata = {
  metadataBase: new URL("https://v1.aitransforms.ir"),
  openGraph: {
    siteName: "AITransforms",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function ArLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={fontClasses}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
