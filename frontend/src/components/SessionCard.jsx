import { Link } from "react-router-dom";
import { formatPrice, skillLevelLabel } from "../lib/format";
import { Avatar, ImagePlaceholder } from "./ui";

// Compact stroke icons per category — all same weight/color as siblings
const CategoryIcon = ({ category }) => {
  const paths = {
    workshop:         <><rect x="4" y="4" width="16" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></>,
    mentoring:        <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0112 0"/><path d="M16 11a3 3 0 010 6M19 11a5 5 0 010 8"/></>,
    fitness:          <><path d="M3 12h3l2-6 4 12 2-6h3"/></>,
    photography:      <><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13.5" r="3"/><path d="M9 7l1.5-3h3L15 7"/></>,
    cooking:          <><path d="M12 3a4 4 0 014 4v1H8V7a4 4 0 014-4z"/><rect x="6" y="8" width="12" height="12" rx="2"/></>,
    consultation:     <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21l4-4 4 4"/></>,
    programming:      <><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12"/></>,
    design:           <><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>,
    business:         <><rect x="3" y="13" width="4" height="8"/><rect x="10" y="8" width="4" height="13"/><rect x="17" y="3" width="4" height="18"/></>,
    marketing:        <><path d="M3 12l5-5 4 4 5-5"/><path d="M17 7h4v4"/></>,
    finance:          <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>,
    career:           <><path d="M5 12l5 5L20 7"/></>,
    language_learning:<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-2.5 3-2.5 15 0 18M12 3c2.5 3 2.5 15 0 18"/></>,
    music:            <><path d="M9 18V6l12-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
    art_crafts:       <><path d="M12 19c-3.3 0-6-2.7-6-6 0-1.7.7-3.2 1.8-4.3L12 4l4.2 4.7C17.3 9.8 18 11.3 18 13c0 3.3-2.7 6-6 6z"/></>,
    health_wellness:  <><path d="M12 21.6C6.5 17.5 3 13.5 3 9.5A5.5 5.5 0 0112 5.3 5.5 5.5 0 0121 9.5c0 4-3.5 8-9 12.1z"/></>,
    gaming:           <><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M8 12h4M10 10v4M15 11.5h.01M17 12.5h.01"/></>,
    other:            <><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[category] ?? paths.other}
    </svg>
  );
};

function formatRelativeDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const today      = new Date(now.getFullYear(),  now.getMonth(),  now.getDate());
  const sessionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((sessionDay - today) / 86_400_000);
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (diff === 0) return `Today • ${time}`;
  if (diff === 1) return `Tomorrow • ${time}`;
  if (diff > 1 && diff < 7)
    return `${date.toLocaleDateString(undefined, { weekday: "short" })} • ${time}`;
  return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} • ${time}`;
}

function formatDuration(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} mins`;
  const h = minutes / 60;
  return Number.isInteger(h) ? `${h} hr${h > 1 ? "s" : ""}` : `${h} hrs`;
}

function SeatsDot({ seats }) {
  if (seats === 0) return <span className="text-gray-400">Sold out</span>;
  if (seats === 1) return <><span className="text-red-500">●</span>{" "}1 seat left</>;
  if (seats <= 5)  return <><span className="text-orange-400">●</span>{" "}{seats} seats left</>;
  return              <><span className="text-green-500">●</span>{" "}{seats} seats left</>;
}

function VerifiedDot() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 fill-blue-500" aria-label="Verified">
      <path d="M10 1l2.39 1.74 2.95-.02.9 2.8 2.4 1.72-.92 2.8.92 2.8-2.4 1.72-.9 2.8-2.95-.02L10 19l-2.39-1.74-2.95.02-.9-2.8-2.4-1.72.92-2.8-.92-2.8 2.4-1.72.9-2.8 2.95.02L10 1z" />
      <path d="M8.6 12.3L6.4 10.1l1.1-1.1 1.1 1.1 3-3 1.1 1.1-4.1 4.1z" fill="white" />
    </svg>
  );
}

export default function SessionCard({ session, framed = true }) {
  const relDate  = formatRelativeDate(session.start_time);
  const duration = formatDuration(session.duration_minutes);
  const isOnline = session.location_type === "online";
  const priceStr = formatPrice(session.price, session.currency);
  const isFree   = session.is_free || priceStr === "Free";
  const hasRating= session.avg_rating != null && session.review_count > 0;

  return (
    <Link
      to={`/sessions/${session.id}`}
      className={`group block ${
        framed
          ? "rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          : ""
      }`}
    >
      {/* ── Image ─────────────────────────────────────── */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
        {session.image ? (
          <img
            src={session.image}
            alt={session.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

      </div>

      {/* ── Content ───────────────────────────────────── */}
      <div className={`${framed ? "px-1 pb-3" : ""} mt-3`}>

        {/* Title */}
        <h3 className="line-clamp-2 font-semibold leading-snug text-gray-900">
          {session.title}
        </h3>

        {/* Creator row + rating on the right */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar user={session.creator} size={22} />
            <span className="truncate text-xs text-gray-500">{session.creator?.display_name}</span>
            {session.creator?.is_verified && <VerifiedDot />}
          </div>
          {hasRating && (
            <span className="flex shrink-0 items-center gap-0.5 text-xs text-gray-500">
              <svg viewBox="0 0 24 24" className="h-3 w-3 fill-amber-400 stroke-none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span className="font-medium text-gray-700">{session.avg_rating}</span>
              <span className="text-gray-400">({session.review_count})</span>
            </span>
          )}
        </div>

        {/* Date */}
        <p className="mt-1.5 text-xs text-gray-900">{relDate}</p>

        {/* Meta row: duration · location · skill */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-900">
          {duration && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.5"/>
              </svg>
              {duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            {isOnline ? (
              <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-2.5 3-2.5 15 0 18M12 3c2.5 3 2.5 15 0 18"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/></svg>
            )}
            {isOnline ? "Online" : "In person"}
          </span>
          {session.skill_level && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 18v-3M10 18v-7M15 18v-9M20 18V6"/>
              </svg>
              {skillLevelLabel(session.skill_level)}
            </span>
          )}
        </div>

        {/* Price + Seats */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {isFree ? (
            <span className="text-sm font-semibold text-green-600">Free</span>
          ) : (
            <span className="text-base font-bold text-gray-900">{priceStr}</span>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <SeatsDot seats={session.seats_remaining} />
          </span>
        </div>
      </div>
    </Link>
  );
}
