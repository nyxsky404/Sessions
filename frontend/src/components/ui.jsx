export function Spinner({ className = "" }) {
  return (
    <div
      className={`h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-brand ${className}`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function ErrorState({ message = "Something went wrong." }) {
  return (
    <div className="mx-auto my-12 max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
      {message}
    </div>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="my-12 text-center text-gray-500">
      <p className="text-lg font-semibold text-gray-700">{title}</p>
      {subtitle && <p className="mt-1 text-sm">{subtitle}</p>}
    </div>
  );
}

export function Avatar({ user, size = 36 }) {
  const letter = (user?.full_name || user?.display_name || user?.username || "?")
    .charAt(0)
    .toUpperCase();
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.full_name || user.display_name || user.username || ""}
        style={{ width: size, height: size }}
        className="rounded-full object-cover"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-orange-200 font-bold text-orange-800"
    >
      {letter}
    </div>
  );
}

export function Stars({ rating = 0, size = "text-sm" }) {
  const rounded = Math.round(rating);
  return (
    <span className={`${size} text-amber-500`} aria-label={`${rating} out of 5`}>
      {"★".repeat(rounded)}
      <span className="text-gray-300">{"★".repeat(Math.max(0, 5 - rounded))}</span>
    </span>
  );
}

export function VerifiedBadge({ className = "" }) {
  return (
    <span
      title="Verified creator"
      className={`inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ${className}`}
    >
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-blue-600" aria-hidden="true">
        <path d="M10 1l2.39 1.74 2.95-.02.9 2.8 2.4 1.72-.92 2.8.92 2.8-2.4 1.72-.9 2.8-2.95-.02L10 19l-2.39-1.74-2.95.02-.9-2.8-2.4-1.72.92-2.8-.92-2.8 2.4-1.72.9-2.8 2.95.02L10 1z" />
        <path d="M8.6 12.3L6.4 10.1l1.1-1.1 1.1 1.1 3-3 1.1 1.1-4.1 4.1z" className="fill-white" />
      </svg>
      Verified
    </span>
  );
}

export function ImagePlaceholder({ className = "" }) {
  // Neutral fallback for sessions without a cover image (no emoji).
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-1/4 w-1/4" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Lightweight stroke-icon set (Lucide-style) used across the app.
const ICON_PATHS = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.5" />
    </>
  ),
  signal: (
    <>
      <path d="M5 18v-3" />
      <path d="M10 18v-7" />
      <path d="M15 18v-9" />
      <path d="M20 18V6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 2.5 15 0 18C9.5 18.5 9.5 5.5 12 3z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="M15 10.5l6-3.5v10l-6-3.5" />
    </>
  ),
  link: (
    <>
      <path d="M9 15l6-6" />
      <path d="M11 7l1-1a4 4 0 015.7 5.7l-2 2" />
      <path d="M13 17l-1 1a4 4 0 01-5.7-5.7l2-2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0114 0" />
    </>
  ),
  ticket: (
    <>
      <path d="M4 8a2 2 0 012-2h12a2 2 0 012 2 2 2 0 000 4 2 2 0 000 4 2 2 0 01-2 2H6a2 2 0 01-2-2 2 2 0 000-4 2 2 0 000-4z" />
      <path d="M14 6v12" strokeDasharray="2 2" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  switch: (
    <>
      <path d="M4 8h12l-3-3M20 16H8l3 3" />
    </>
  ),
  logout: (
    <>
      <path d="M14 7V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-2" />
      <path d="M19 12H10m9 0l-3-3m3 3l-3 3" />
    </>
  ),
  check: <path d="M5 12.5l4 4 10-10" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 18l-6-6 6-6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="17" cy="6" r="2.5" />
      <circle cx="17" cy="18" r="2.5" />
      <path d="M8.2 10.9l6.6-3.8M8.2 13.1l6.6 3.8" />
    </>
  ),
  edit: (
    <>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </>
  ),
};

export function Icon({ name, className = "h-4 w-4" }) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}

export function Badge({ children, color = "gray" }) {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
}
