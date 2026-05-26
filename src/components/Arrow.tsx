type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

// Reusable right-arrow glyph used for service bullets and the framework
// step separators. Wordmark keeps its own inline SVG so the brand mark stays
// independently editable. rtl:-scale-x-100 mirrors the arrow in fa/ar.
export default function Arrow({ size = "sm", className }: Props) {
  const s =
    size === "lg"
      ? { w: 24, h: 14, vb: "0 0 24 14", line: "M0.5 7 L22.5 7", head: "M17.5 2 L22.5 7 L17.5 12" }
      : size === "md"
        ? { w: 14, h: 10, vb: "0 0 14 10", line: "M0.5 5 L12.5 5", head: "M8.5 1 L12.5 5 L8.5 9" }
        : { w: 12, h: 8, vb: "0 0 12 8", line: "M0.5 4 L10.5 4", head: "M7.5 1 L10.5 4 L7.5 7" };

  return (
    <svg
      width={s.w}
      height={s.h}
      viewBox={s.vb}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={["rtl:-scale-x-100", className].filter(Boolean).join(" ")}
    >
      <path d={s.line} />
      <path d={s.head} />
    </svg>
  );
}
