import type { Metadata } from "next";
import "../globals.css";
import { fontClasses } from "../fonts";

export const metadata: Metadata = {
  title: "AITransforms — Turn Your Business Brain Into AI Systems",
  description:
    "An AI transformation studio that turns business knowledge, workflows, and documents into practical AI assistants, RAG systems, and private agents.",
};

export default function EnRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontClasses}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
