export default function FaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div lang="fa" dir="rtl" className="contents">
      {children}
    </div>
  );
}
