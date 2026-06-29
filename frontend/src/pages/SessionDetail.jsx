import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { formatPrice, formatDateTime, categoryLabel } from "../lib/format";
import { Avatar, Badge, PageLoader, ErrorState, ImagePlaceholder } from "../components/ui";

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => (await api.get(`/sessions/${id}/`)).data,
  });

  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  if (isLoading) return <PageLoader />;
  if (isError || !session) return <ErrorState />;

  const isFree = session.is_free;
  const soldOut = session.seats_remaining === 0;

  async function startCheckout(bookingId) {
    const res = await api.post("/payments/checkout/", { booking_id: bookingId });
    window.location.href = res.data.checkout_url;
  }

  async function handleBook() {
    if (!user) return navigate("/login");
    setBooking(true);
    setError("");
    try {
      const { data } = await api.post("/bookings/", { session_id: session.id });
      if (data.needs_payment) {
        await startCheckout(data.id);
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Could not complete booking.");
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
        {session.image ? (
          <img src={session.image} alt={session.title} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Badge>{categoryLabel(session.category)}</Badge>
          <h1 className="mt-3 text-3xl font-bold">{session.title}</h1>

          <div className="mt-3 flex items-center gap-2">
            <Avatar user={session.creator} size={32} />
            <span className="text-sm text-gray-600">{session.creator?.display_name}</span>
          </div>

          <p className="mt-6 whitespace-pre-line text-gray-700">{session.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <Info label="When" value={formatDateTime(session.start_time)} />
            <Info label="Duration" value={`${session.duration_minutes} min`} />
            <Info label="Capacity" value={`${session.capacity} seats`} />
            <Info
              label="Location"
              value={session.location_type === "online" ? "Online" : session.location_text || "In person"}
            />
          </dl>
        </div>

        <div className="md:col-span-1">
          <div className="card sticky top-24 p-5">
            <div className="text-2xl font-bold">
              {isFree ? "Free" : formatPrice(session.price, session.currency)}
            </div>
            <p className="mt-1 text-sm text-gray-500">{session.seats_remaining} seats left</p>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <button
              onClick={handleBook}
              disabled={booking || soldOut}
              className="btn-primary mt-4 w-full"
            >
              {soldOut ? "Sold out" : booking ? "…" : isFree ? "Book now" : "Reserve & pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
