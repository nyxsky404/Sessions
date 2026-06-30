import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../lib/errors";
import { BOOKING_STATUS_COLOR, formatDateTime, formatPrice } from "../lib/format";
import { Badge, EmptyState, ErrorState, Icon, PageLoader } from "../components/ui";

export default function UserDashboard() {
  const [tab, setTab] = useState("active");
  const queryClient = useQueryClient();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Surface Stripe redirect outcome once, then clean the URL.
  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Payment successful — your booking is confirmed.");
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bookings", tab],
    queryFn: async () =>
      (await api.get("/bookings/", { params: { filter: tab } })).data,
  });

  const cancel = useMutation({
    mutationFn: (id) => api.post(`/bookings/${id}/cancel/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking cancelled.");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const bookings = data || [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-extrabold tracking-tight">My bookings</h1>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <Tab active={tab === "active"} onClick={() => setTab("active")}>
          Upcoming
        </Tab>
        <Tab active={tab === "past"} onClick={() => setTab("past")}>
          Past & cancelled
        </Tab>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState />
      ) : bookings.length === 0 ? (
        <EmptyState
          title={tab === "active" ? "No upcoming bookings" : "Nothing here yet"}
          subtitle={tab === "active" ? "Browse the catalog to book a session." : ""}
        />
      ) : (
        <ul className="mt-6 space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="card p-4">
              <div className="flex gap-4">
                <div className="hidden h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:block">
                  {b.session.image ? (
                    <img src={b.session.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">✨</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/sessions/${b.session.id}`}
                      className="font-semibold leading-snug hover:underline"
                    >
                      {b.session.title}
                    </Link>
                    <Badge color={BOOKING_STATUS_COLOR[b.status]}>{b.status}</Badge>
                  </div>

                  <dl className="mt-2 space-y-1.5 text-sm text-gray-600">
                    <DetailRow icon="calendar">
                      {formatDateTime(b.session.start_time)} · {b.duration_minutes} min
                    </DetailRow>
                    <LocationRow booking={b} />
                    <DetailRow icon="ticket">
                      {formatPrice(b.session.price, b.session.currency)}
                    </DetailRow>
                  </dl>
                </div>
              </div>

              {(b.needs_payment || (tab === "active" && b.status !== "cancelled")) && (
                <div className="mt-3 flex items-center justify-end gap-3 border-t border-gray-100 pt-3">
                  {tab === "active" && b.status !== "cancelled" && (
                    <button
                      onClick={() => cancel.mutate(b.id)}
                      disabled={cancel.isPending}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                  {b.needs_payment && <PayButton bookingId={b.id} />}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DetailRow({ icon, children }) {
  return (
    <dd className="flex items-start gap-2">
      <Icon name={icon} className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
      <span className="min-w-0">{children}</span>
    </dd>
  );
}

function LocationRow({ booking: b }) {
  const isCancelled = b.status === "cancelled";
  if (b.location_type === "online") {
    return (
      <DetailRow icon="video">
        {b.meeting_link ? (
          <a
            href={b.meeting_link}
            target="_blank"
            rel="noreferrer"
            className="break-all font-medium text-brand hover:underline"
          >
            {b.meeting_link}
          </a>
        ) : (
          <span className="text-gray-500">
            {isCancelled ? "Online" : "Online · meeting link shared once confirmed"}
          </span>
        )}
      </DetailRow>
    );
  }
  return (
    <DetailRow icon="pin">
      <span>
        <span className="font-medium text-gray-700">{b.venue_name || "In person"}</span>
        {b.full_address ? (
          ` · ${b.full_address}`
        ) : !isCancelled ? (
          <span className="text-gray-500"> · address shared once confirmed</span>
        ) : null}
      </span>
    </DetailRow>
  );
}

function PayButton({ bookingId }) {
  const toast = useToast();
  const pay = useMutation({
    mutationFn: async () =>
      (await api.post("/payments/checkout/", { booking_id: bookingId })).data,
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
  return (
    <button onClick={() => pay.mutate()} disabled={pay.isPending} className="btn-primary py-1.5 text-sm">
      {pay.isPending ? "…" : "Pay now"}
    </button>
  );
}

function Tab({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 font-semibold ${
        active ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500"
      }`}
    >
      {children}
    </button>
  );
}
