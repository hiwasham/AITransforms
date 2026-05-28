import "../globals.css";
import { fontClasses } from "../fonts";

export default function FaRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={fontClasses}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
