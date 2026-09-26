import Link from "next/link";

type Props = {
  href?: string;
  size?: "sm" | "lg";
  className?: string;
  /** "ink" (default) for light surfaces, "inverse" for dark surfaces. */
  tone?: "ink" | "inverse";
};

// AITransforms wordmark. Shared by Header (linked) and Footer (static).
// Inter semibold text + a small blue arrow glyph that echoes the
// "Business Brain → AI Systems" metaphor used across the site.
// The glyph mirrors for RTL via rtl:-scale-x-100.
export default function Wordmark({
  href,
  size = "lg",
  className,
  tone = "ink",
}: Props) {
  const toneClass = tone === "inverse" ? "text-white" : "text-ink";
  const textClass =
    size === "lg"
      ? `text-lg font-bold tracking-tight ${toneClass}`
      : `text-base font-bold tracking-tight ${toneClass}`;

  const content = (
    <span
      className={[
        "inline-flex items-center gap-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={textClass}>AITransforms</span>
      <svg
        width="14"
        height="10"
        viewBox="0 0 14 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-accent rtl:-scale-x-100"
      >
        <path d="M0.5 5 L12.5 5" />
        <path d="M8.5 1 L12.5 5 L8.5 9" />
      </svg>
    </span>
  );

  return href ? (
    <Link href={href} aria-label="AITransforms — home">
      {content}
    </Link>
  ) : (
    content
  );
}
