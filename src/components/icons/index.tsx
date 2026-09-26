import type { SVGProps } from "react";

// Inline Tabler-style icon set. Replaces the CDN @tabler/icons-webfont used in
// the reference HTML — no network dependency, no package, RTL-safe (icons that
// imply direction use currentColor strokes and can be mirrored by callers with
// rtl:-scale-x-100 where appropriate).
//
// Each path is traced from the Tabler open-source set (MIT). Keys match the
// `ti-*` names referenced in the module data so content can name an icon as a
// string and resolve it here.

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const icons = {
  "ti-target": (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </Base>
  ),
  "ti-file-text": (p: IconProps) => (
    <Base {...p}>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M9 9h1M9 13h6M9 17h6" />
    </Base>
  ),
  "ti-clipboard-text": (p: IconProps) => (
    <Base {...p}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="2" />
      <path d="M9 12h6M9 16h6" />
    </Base>
  ),
  "ti-building-store": (p: IconProps) => (
    <Base {...p}>
      <path d="M3 21h18" />
      <path d="M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7" />
      <path d="M4 21v-9M20 21v-9" />
      <path d="M3 7l1.5-4h15L21 7" />
      <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
    </Base>
  ),
  "ti-chart-line": (p: IconProps) => (
    <Base {...p}>
      <path d="M4 19h16" />
      <path d="M4 15l4-6 4 2 5-7" />
    </Base>
  ),
  "ti-repeat": (p: IconProps) => (
    <Base {...p}>
      <path d="M4 12V9a3 3 0 0 1 3-3h13M17 3l3 3-3 3" />
      <path d="M20 12v3a3 3 0 0 1-3 3H4M7 21l-3-3 3-3" />
    </Base>
  ),
  "ti-arrow-bar-right": (p: IconProps) => (
    <Base {...p}>
      <path d="M4 12h11M11 8l4 4-4 4M19 4v16" />
    </Base>
  ),
  "ti-shield-check": (p: IconProps) => (
    <Base {...p}>
      <path d="M12 3l8 3v6c0 4-3 7-8 9-5-2-8-5-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </Base>
  ),
  "ti-brain": (p: IconProps) => (
    <Base {...p}>
      <path d="M12 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 2" />
      <path d="M12 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 2" />
      <path d="M12 4v16" />
    </Base>
  ),
  "ti-eye": (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="2" />
      <path d="M21 12c-2.5 4-5.5 6-9 6s-6.5-2-9-6c2.5-4 5.5-6 9-6s6.5 2 9 6z" />
    </Base>
  ),
  "ti-database": (p: IconProps) => (
    <Base {...p}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </Base>
  ),
  "ti-adjustments-horizontal": (p: IconProps) => (
    <Base {...p}>
      <circle cx="8" cy="6" r="2" />
      <path d="M10 6h10M4 6h2" />
      <circle cx="16" cy="12" r="2" />
      <path d="M18 12h2M4 12h10" />
      <circle cx="10" cy="18" r="2" />
      <path d="M12 18h8M4 18h2" />
    </Base>
  ),
  "ti-users": (p: IconProps) => (
    <Base {...p}>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8M21 21v-2a4 4 0 0 0-3-3.85" />
    </Base>
  ),
  "ti-user-search": (p: IconProps) => (
    <Base {...p}>
      <circle cx="9" cy="7" r="3" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h1" />
      <circle cx="16.5" cy="17.5" r="2.5" />
      <path d="M18.5 19.5L21 22" />
    </Base>
  ),
  "ti-school": (p: IconProps) => (
    <Base {...p}>
      <path d="M22 9L12 5 2 9l10 4 10-4z" />
      <path d="M6 10.6V16c0 1 2.7 3 6 3s6-2 6-3v-5.4" />
    </Base>
  ),
  "ti-list-check": (p: IconProps) => (
    <Base {...p}>
      <path d="M3.5 5.5L5 7l2.5-2.5" />
      <path d="M3.5 11.5L5 13l2.5-2.5" />
      <path d="M3.5 17.5L5 19l2.5-2.5" />
      <path d="M11 6h9M11 12h9M11 18h9" />
    </Base>
  ),
  "ti-contract": (p: IconProps) => (
    <Base {...p}>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M5 8V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2h-3" />
      <path d="M9 12h6M9 16l2 2" />
      <path d="M3 16l3-1 6 6-3 1-3-3z" />
    </Base>
  ),
  "ti-topology-ring": (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M12 7v3M10.5 6.5L6 16.5M13.5 6.5L18 16.5M7 18h10" />
    </Base>
  ),
  "ti-rocket": (p: IconProps) => (
    <Base {...p}>
      <path d="M4 13a8 8 0 0 1 7-7 6 6 0 0 1 5 5 8 8 0 0 1-7 7l-3-1-2-2z" />
      <circle cx="14" cy="10" r="1.5" />
      <path d="M7 14l-3 3 0 3 3 0 3-3" />
    </Base>
  ),
  "ti-send": (p: IconProps) => (
    <Base {...p}>
      <path d="M10 14l11-11M21 3l-6.5 18-3.5-7-7-3.5z" />
    </Base>
  ),
  "ti-cpu": (p: IconProps) => (
    <Base {...p}>
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </Base>
  ),
  "ti-trending-up": (p: IconProps) => (
    <Base {...p}>
      <path d="M3 17l6-6 4 4 8-8M21 7v4M21 7h-4" />
    </Base>
  ),
  "ti-bulb": (p: IconProps) => (
    <Base {...p}>
      <path d="M9 18h6M10 21h4" />
      <path d="M8 14a5 5 0 1 1 8 0c-.5.7-1 1.3-1 2H9c0-.7-.5-1.3-1-2z" />
    </Base>
  ),
  "ti-building": (p: IconProps) => (
    <Base {...p}>
      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M16 9h2a2 2 0 0 1 2 2v10M3 21h18" />
      <path d="M8 7h2M8 11h2M8 15h2" />
    </Base>
  ),
  "ti-user-check": (p: IconProps) => (
    <Base {...p}>
      <circle cx="9" cy="7" r="3" />
      <path d="M5 21v-2a4 4 0 0 1 4-4h2" />
      <path d="M15 16l2 2 4-4" />
    </Base>
  ),
  "ti-arrow-right": (p: IconProps) => (
    <Base {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Base>
  ),
  "ti-arrow-left": (p: IconProps) => (
    <Base {...p}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Base>
  ),
} as const;

export type IconName = keyof typeof icons;

// Resolve an icon by name. Returns the target glyph, falling back to a neutral
// dot if a name is missing so a typo never crashes the render.
export function Icon({
  name,
  ...props
}: { name: IconName } & IconProps) {
  const Glyph = icons[name] ?? icons["ti-target"];
  return <Glyph {...props} />;
}
