import type { WorkMetric } from "@/content/work";

// Renders a work metric. A delta (before + after) shows the two values with a
// direction-mirroring arrow between them: the numeric spans are dir="ltr" (so
// "۱۸٪" renders internally left-to-right) while the arrow flips via
// rtl:-scale-x-100, so in RTL the "before" sits on the right and the arrow
// points left — the correct native reading. A single metric just renders its
// value, inheriting page direction (so mixed strings like "۲۵ دقیقه" are not
// force-flipped). One component, two consumers (index card + case callout).
export default function WorkMetricValue({
  metric,
  className,
}: {
  metric: WorkMetric;
  className?: string;
}) {
  if (metric.before && metric.after) {
    return (
      <span className={className} style={{ whiteSpace: "nowrap" }}>
        <span dir="ltr">{metric.before}</span>
        <span aria-hidden="true" className="mx-2 inline-block rtl:-scale-x-100">
          →
        </span>
        <span dir="ltr">{metric.after}</span>
      </span>
    );
  }
  return <span className={className}>{metric.value}</span>;
}
