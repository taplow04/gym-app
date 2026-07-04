

// FORGE — inline SVG icon set (24×24, stroke-based, currentColor).
// No icon library: ~20 hand-tuned glyphs keep the bundle lean and the
// weight consistent with the type system.

const ICONS = {
  home: (
    <>
      <path d="m3 10.5 9-7.5 9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
    </>
  ),
  chart: (
    <>
      <path d="M5 21v-8M12 21V4M19 21v-12" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m5 13 4 4L19 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3" />
      <path d="M6 7l1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  flame: (
    <path d="M12 3c1.2 2.8-.6 4.4-1.8 6-1.1 1.5-2.2 3-2.2 5a6 6 0 0 0 12 0c0-2.4-1.3-4.3-2.8-5.8-.4 1.3-1.2 2.3-2.4 2.9C14.5 8.6 14 5.4 12 3z" />
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />,
  trophy: (
    <>
      <path d="M6 3h12v6a6 6 0 0 1-12 0V3z" />
      <path d="M6 5H3a3.5 3.5 0 0 0 3.5 4M18 5h3a3.5 3.5 0 0 1-3.5 4" />
      <path d="M12 15v4M8 21h8" />
    </>
  ),
  trend: (
    <>
      <path d="m2 17 6.5-6.5 5 5L22 7" />
      <path d="M16 7h6v6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  zap: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
  edit: <path d="m17 3 4 4L8 20l-5 1 1-5L17 3z" />,
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5" />
      <path d="M4 21h16" />
    </>
  ),
  reset: (
    <>
      <path d="M3 12a9 9 0 1 0 2.8-6.5L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
};

export default function Icon({ name, size = 22, strokeWidth = 2, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {ICONS[name] || null}
    </svg>
  );
}
