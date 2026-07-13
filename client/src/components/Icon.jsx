

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
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M2.5 12S6 5.5 12 5.5c1.8 0 3.4.6 4.7 1.4M21.5 12s-3.5 6.5-9.5 6.5c-1.8 0-3.4-.6-4.7-1.4" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M4 20 20 4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 8 8 5.5L20 8" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
      <path d="m17 8 4 4-4 4M21 12H10" />
    </>
  ),
  "arrow-left": <path d="M19 12H5m6-7-7 7 7 7" />,
  camera: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3a1.5 1.5 0 0 1 1.5 1.5V19a2 2 0 0 1-2 2H4.5a2 2 0 0 1-2-2V9.5A1.5 1.5 0 0 1 4 8z" />
      <circle cx="12" cy="14" r="3.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8L12 3z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V13" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  star: (
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.8l-5.3 2.8 1.1-5.8-4.3-4.1 5.9-.8L12 3.5z" />
  ),
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 9.5v4l2.5 1.5M9.5 2.5h5M12 2.5V6" />
    </>
  ),
  pause: <path d="M9 5.5v13M15 5.5v13" strokeWidth="2.6" />,
  repeat: (
    <>
      <path d="M4 12V9a4 4 0 0 1 4-4h12l-3-3m3 3-3 3" />
      <path d="M20 12v3a4 4 0 0 1-4 4H4l3 3m-3-3 3-3" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  maximize: (
    <>
      <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" />
      <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  "volume-off": (
    <>
      <path d="M4 9.5v5h3.5L12 19V5L7.5 9.5H4z" />
      <path d="m16 9.5 5 5m0-5-5 5" />
    </>
  ),
  droplet: (
    <path d="M12 3.5c3.2 4 6 7 6 10.2a6 6 0 0 1-12 0C6 10.5 8.8 7.5 12 3.5z" />
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <path d="m8.8 13.6-1.8 7 5-2.6 5 2.6-1.8-7" />
    </>
  ),
  bookmark: <path d="M6.5 3.5h11V21L12 17l-5.5 4V3.5z" />,
  ruler: (
    <>
      <rect x="3" y="8.5" width="18" height="7" rx="1.5" />
      <path d="M7 8.5v3M11 8.5v4.5M15 8.5v3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.8" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
  scale: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8.5 9a5 5 0 0 1 7 0l-2.4 2.6a1.6 1.6 0 0 0-2.2 0L8.5 9z" />
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
