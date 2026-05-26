export default function ArLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="ar" dir="rtl" className="contents">
      {children}
    </div>
  );
}
