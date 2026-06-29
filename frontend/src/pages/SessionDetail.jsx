import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../lib/errors";
import {
  ageRestrictionLabel,
  cancellationPolicy,
  categoryLabel,
  formatDateTime,
  formatPrice,
  skillLevelLabel,
} from "../lib/format";
import SessionCard from "../components/SessionCard";
import {
  Avatar,
  ErrorState,
  Icon,
  ImagePlaceholder,
  PageLoader,
  Stars,
  VerifiedBadge,
} from "../components/ui";

export default function SessionDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [booking, setBooking] = useState(false);

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => (await api.get(`/sessions/${id}/`)).data,
  });

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState message="Session not found." />;

  const isOwner = user && session.creator?.id === user.id;
  const isCreatorMode = user?.role === "creator";
  const soldOut = session.seats_remaining <= 0;
  const seatsTaken = Math.max(0, session.capacity - session.seats_remaining);
  const fillPct = session.capacity
    ? Math.round((seatsTaken / session.capacity) * 100)
    : 0;
  const fewLeft =
    !soldOut && session.seats_remaining <= Math.max(1, Math.ceil(session.capacity * 0.25));
  const isOnline = session.location_type === "online";
  const creator = session.creator || {};
  const reviews = session.reviews || [];
  const featured = session.featured_reviews || [];

  const startCheckout = async (bookingId) => {
    const res = await api.post("/payments/checkout/", { booking_id: bookingId });
    window.location.href = res.data.checkout_url;
  };

  const handleBook = async () => {
    setBooking(true);
    try {
      const { data } = await api.post("/bookings/", { session_id: session.id });
      if (data.needs_payment) {
        toast.info("Reservation held — redirecting to payment…");
        await startCheckout(data.id);
        return;
      }
      toast.success("Booked! Find it in your bookings.");
      navigate("/dashboard");
    } catch (e) {
      toast.error(getErrorMessage(e, "Could not complete booking."));
      setBooking(false);
    }
  };

  const handleFinishPayment = async (bookingId) => {
    setBooking(true);
    try {
      await startCheckout(bookingId);
    } catch (e) {
      toast.error(getErrorMessage(e));
      setBooking(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    } catch {
      // Fallback for browsers without the async clipboard API.
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success("Link copied to clipboard.");
    }
  };

  const BookingPanel = () => {
    if (!user) {
      return (
        <Link to="/login" className="btn-primary w-full">
          Log in to book
        </Link>
      );
    }
    if (isOwner) {
      return (
        <Link to={`/creator/sessions/${session.id}/edit`} className="btn-outline w-full">
          Edit this session
        </Link>
      );
    }
    if (isCreatorMode) {
      return (
        <p className="text-center text-sm text-gray-500">
          Switch to attendee mode (in the menu) to book sessions.
        </p>
      );
    }

    const vb = session.viewer_booking;
    if (vb?.status === "confirmed") {
      return (
        <div className="space-y-2">
          <button disabled className="btn w-full bg-green-600 text-white">
            ✓ Booked
          </button>
          <Link to="/dashboard" className="block text-center text-sm text-gray-600 hover:underline">
            View in my bookings
          </Link>
        </div>
      );
    }
    if (vb?.status === "pending") {
      return (
        <div className="space-y-2">
          <button
            onClick={() => handleFinishPayment(vb.id)}
            disabled={booking}
            className="btn-primary w-full"
          >
            {booking ? "Processing…" : "Finish payment"}
          </button>
          <p className="text-center text-xs text-gray-500">
            Your seat is reserved. Complete payment to confirm.
          </p>
        </div>
      );
    }

    return (
      <button onClick={handleBook} disabled={booking || soldOut} className="btn-primary w-full">
        {soldOut ? "Sold out" : booking ? "Processing…" : "Book Now"}
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Title + creator header (full width, above the grid — Fiverr style) */}
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-gray-500">{categoryLabel(session.category)}</p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.5rem]">
          {session.title}
        </h1>

        <div className="mt-4 flex items-center gap-3">
          <Avatar user={creator} size={48} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold">{creator.display_name}</span>
              {creator.is_verified && <VerifiedBadge />}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
              {creator.rating != null ? (
                <button
                  onClick={() =>
                    document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center gap-1.5 font-semibold"
                >
                  <Stars rating={creator.rating} />
                  <span>{creator.rating}</span>
                  <span className="font-normal text-gray-500 underline">
                    ({creator.review_count} review{creator.review_count === 1 ? "" : "s"})
                  </span>
                </button>
              ) : (
                <span className="text-gray-500">New creator</span>
              )}
              <span className="text-gray-300">·</span>
              <button
                onClick={() =>
                  document.getElementById("creator")?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-gray-500 hover:text-gray-900"
              >
                {creator.sessions_hosted || 0} sessions hosted
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          {/* Cover image */}
          <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
            {session.image ? (
              <img src={session.image} alt={session.title} className="h-full w-full object-cover" />
            ) : (
              <ImagePlaceholder />
            )}
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Session information */}
          <h2 className="mb-3 text-xl font-bold tracking-tight">Session information</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Info icon="calendar" label="When" value={formatDateTime(session.start_time)} />
            <Info icon="clock" label="Duration" value={`${session.duration_minutes} minutes`} />
            <Info icon="ticket" label="Capacity" value={`${session.capacity} seats`} />
            <Info icon="signal" label="Skill level" value={skillLevelLabel(session.skill_level)} />
            <Info icon="globe" label="Language" value={session.language} />
            <Info icon="user" label="Age restriction" value={ageRestrictionLabel(session.age_restriction)} />
          </dl>

          <Section title="About this session">
            <p className="whitespace-pre-line text-gray-700">{session.description}</p>
          </Section>

          <ListSection title="What you'll learn" items={session.what_you_will_learn} marker="✓" />
          <ListSection title="Session agenda" items={session.agenda} ordered />
          <ListSection title="What's included" items={session.whats_included} marker="•" />
          <ListSection title="What to bring" items={session.what_to_bring} marker="•" />

          {session.faqs?.length > 0 && (
            <Section title="FAQs">
              <p className="mb-3 text-sm text-gray-500">
                Experience required: {skillLevelLabel(session.skill_level)}
              </p>
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                {session.faqs.map((f, i) => (
                  <FaqItem key={i} q={f.question} a={f.answer} />
                ))}
              </div>
            </Section>
          )}

          {/* Location */}
          <Section title="Location">
            <LocationBlock session={session} />
          </Section>

          {/* Creator */}
          <Section title="About the creator" id="creator">
            <div className="flex items-start gap-4">
              <Avatar user={creator} size={64} />
              <div className="flex-1">
                <p className="flex items-center gap-2 text-lg font-semibold">
                  {creator.display_name}
                  {creator.is_verified && <VerifiedBadge />}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                  {creator.rating != null && (
                    <span className="inline-flex items-center gap-1">
                      <Stars rating={creator.rating} /> {creator.rating}
                    </span>
                  )}
                  <span>{creator.years_experience || 0} yrs experience</span>
                  <span>{creator.sessions_hosted || 0} sessions hosted</span>
                  <span>{creator.attendees_count || 0} attendees</span>
                </div>
                {creator.bio ? (
                  <p className="mt-3 whitespace-pre-line text-gray-700">{creator.bio}</p>
                ) : (
                  <p className="mt-3 text-sm text-gray-400">No bio yet.</p>
                )}
              </div>
            </div>
          </Section>

          {/* Cancellation policy */}
          <Section title="Cancellation policy">
            <p className="font-medium">{cancellationPolicy(session.cancellation_policy).label}</p>
            <p className="text-sm text-gray-600">
              {cancellationPolicy(session.cancellation_policy).summary}
            </p>
          </Section>

          {/* Reviews */}
          <Section title="Reviews" id="reviews">
            {session.review_count > 0 ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold">{session.avg_rating}</span>
                  <div>
                    <Stars rating={session.avg_rating} size="text-base" />
                    <p className="text-sm text-gray-500">
                      {session.review_count} review{session.review_count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                {featured.length > 0 && (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {featured.map((r) => (
                      <div key={r.id} className="card bg-gray-50 p-4">
                        <p className="italic text-gray-700">“{r.comment}”</p>
                        <p className="mt-2 text-sm font-semibold">{r.author?.display_name}</p>
                      </div>
                    ))}
                  </div>
                )}

                <ul className="mt-6 space-y-5">
                  {reviews.map((r) => (
                    <ReviewRow key={r.id} review={r} />
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-gray-400">No reviews yet.</p>
            )}
          </Section>

          {/* Related */}
          <RelatedRow title={`More from ${creator.display_name || "this creator"}`} sessions={session.creator_sessions} />
          <RelatedRow title={`More in ${categoryLabel(session.category)}`} sessions={session.related_sessions} />
        </div>

        {/* Booking card */}
        <div className="md:col-span-1">
          <div className="card sticky top-20 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]">
            <div className="p-6">
              <div className="flex items-baseline gap-2">
                <p className="text-[1.75rem] font-extrabold tracking-tight">
                  {formatPrice(session.price, session.currency)}
                </p>
                {!session.is_free && <span className="text-sm text-gray-500">/ seat</span>}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {session.is_free
                  ? "Free to join — your seat is confirmed instantly."
                  : "Secure your spot. Pay once, no hidden fees."}
              </p>

              {/* What's included */}
              <ul className="mt-5 space-y-3 text-sm text-gray-700">
                <Feature icon="clock">
                  {session.duration_minutes} min live session
                </Feature>
                <Feature icon={isOnline ? "video" : "pin"}>
                  {isOnline ? "Online — link after booking" : session.venue_name || "In person"}
                </Feature>
                <Feature icon="signal">{skillLevelLabel(session.skill_level)} level</Feature>
                <Feature icon="globe">{session.language}</Feature>
              </ul>

              {/* Seat availability */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-semibold ${fewLeft ? "text-brand" : "text-gray-900"}`}>
                    {soldOut
                      ? "Sold out"
                      : `${session.seats_remaining} of ${session.capacity} seats left`}
                  </span>
                  <span className="text-xs text-gray-500">{seatsTaken} booked</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      soldOut ? "bg-gray-400" : fewLeft ? "bg-brand" : "bg-gray-900"
                    }`}
                    style={{ width: `${Math.max(fillPct, soldOut ? 100 : 6)}%` }}
                  />
                </div>
                {fewLeft && (
                  <p className="mt-1.5 text-xs font-medium text-brand">
                    Almost full — book soon to reserve your seat.
                  </p>
                )}
              </div>

              <div className="mt-5">
                <BookingPanel />
              </div>

              <button
                onClick={handleShare}
                className="mt-2 flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <Icon name="share" className="h-4 w-4" />
                Share this session
              </button>
            </div>

            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-xs text-gray-500">
              {cancellationPolicy(session.cancellation_policy).label} cancellation ·{" "}
              {ageRestrictionLabel(session.age_restriction)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, id }) {
  return (
    <div id={id} className="scroll-mt-24">
      <hr className="my-7 border-gray-200" />
      <h2 className="mb-3 text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

function ListSection({ title, items, marker = "•", ordered = false }) {
  if (!items || items.length === 0) return null;
  return (
    <Section title={title}>
      <ul className="space-y-2 text-gray-700">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-brand">{ordered ? `${i + 1}.` : marker}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left font-medium"
      >
        {q}
        <span className="ml-2 text-gray-400">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="mt-2 text-sm text-gray-600">{a}</p>}
    </div>
  );
}

function LocationBlock({ session }) {
  const online = session.location_type === "online";

  if (online) {
    return (
      <div>
        <p className="font-medium">Online</p>
        <p className="text-sm text-gray-500">🔒 Meeting link provided after booking.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-medium">{session.venue_name || "In person"}</p>
      <p className="text-sm text-gray-600">{session.full_address}</p>
    </div>
  );
}

function ReviewRow({ review }) {
  return (
    <li className="flex gap-3">
      <Avatar user={review.author} size={40} />
      <div>
        <p className="font-semibold">{review.author?.display_name}</p>
        <Stars rating={review.rating} />
        <p className="mt-1 text-gray-700">{review.comment}</p>
      </div>
    </li>
  );
}

function RelatedRow({ title, sessions }) {
  if (!sessions || sessions.length === 0) return null;
  const visible = sessions.slice(0, 3);
  return (
    <Section title={title}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {visible.map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>
    </Section>
  );
}

function Feature({ icon, children }) {
  return (
    <li className="flex items-center gap-3">
      <Icon name={icon} className="h-4 w-4 shrink-0 text-brand" />
      <span>{children}</span>
    </li>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <dt className="flex items-center gap-1.5 text-xs text-gray-500">
        {icon && <Icon name={icon} className="h-3.5 w-3.5 text-gray-400" />}
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-gray-900">{value}</dd>
    </div>
  );
}
