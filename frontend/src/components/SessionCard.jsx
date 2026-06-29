import { Link } from "react-router-dom";
import { formatPrice, formatDateTime, categoryLabel } from "../lib/format";
import { Avatar, Badge, ImagePlaceholder } from "./ui";

export default function SessionCard({ session }) {
  const priceStr = formatPrice(session.price, session.currency);
  const isFree = session.is_free || priceStr === "Free";

  return (
    <Link to={`/sessions/${session.id}`} className="card group block overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {session.image ? (
          <img
            src={session.image}
            alt={session.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder />
        )}
        <div className="absolute left-2 top-2">
          <Badge>{categoryLabel(session.category)}</Badge>
        </div>
      </div>

      <div className="p-3">
        <h3 className="truncate font-semibold text-gray-900">{session.title}</h3>

        <div className="mt-2 flex items-center gap-2">
          <Avatar user={session.creator} size={22} />
          <span className="truncate text-xs text-gray-500">
            {session.creator?.display_name}
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-500">{formatDateTime(session.start_time)}</p>

        <div className="mt-3 flex items-center justify-between">
          {isFree ? (
            <span className="text-sm font-semibold text-green-600">Free</span>
          ) : (
            <span className="font-bold text-gray-900">{priceStr}</span>
          )}
          <span className="text-xs text-gray-500">
            {session.seats_remaining} seats left
          </span>
        </div>
      </div>
    </Link>
  );
}
