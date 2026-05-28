import "../globals.css";
import { fontClasses } from "../fonts";

export default function ArRootLayout({
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
