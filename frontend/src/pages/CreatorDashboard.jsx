import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../lib/errors";
import {
  BOOKING_STATUS_COLOR,
  formatDateTime,
  formatPrice,
  skillLevelLabel,
} from "../lib/format";
import { Badge, ErrorState, Icon, PageLoader } from "../components/ui";

function sessionBadge(session) {
  const isPast = new Date(session.start_time) < new Date();
  if (isPast) return { label: "Completed", color: "gray" };
  if (session.seats_remaining === 0) return { label: "Full", color: "yellow" };
  return null;
}

export default function CreatorDashboard() {
  const [tab, setTab] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["creator-sessions"],
    queryFn: async () => (await api.get("/creator/sessions/")).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/sessions/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creator-sessions"] });
      toast.success("Session deleted.");
      setConfirmDeleteId(null);
    },
    onError: (e) => {
      toast.error(getErrorMessage(e));
      setConfirmDeleteId(null);
    },
  });

  const sessions = data || [];
  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.start_time) >= now);
  const past = sessions.filter((s) => new Date(s.start_time) < now);
  const totalBooked = sessions.reduce((sum, s) => sum + (s.active_bookings || 0), 0);
  const totalEarnings = sessions.reduce(
    (sum, s) => sum + (s.active_bookings || 0) * (s.price || 0),
    0
  );
  const ratedSessions = sessions.filter((s) => s.avg_rating != null);
  const overallRating =
    ratedSessions.length > 0
      ? (ratedSessions.reduce((sum, s) => sum + s.avg_rating, 0) / ratedSessions.length).toFixed(1)
      : null;

  const filtered =
    tab === "upcoming" ? upcoming : tab === "past" ? past : sessions;

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">My Sessions</h1>
        <Link to="/creator/sessions/new" className="btn-primary">
          Create Session
        </Link>
      </div>

      {sessions.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard label="Total Sessions" value={sessions.length} />
          <SummaryCard label="Seats Booked" value={totalBooked} />
          <SummaryCard
            label="Total Earnings"
            value={totalEarnings === 0 ? "—" : formatPrice(totalEarnings, sessions[0]?.currency)}
          />
          <SummaryCard
            label="Overall Rating"
            value={overallRating ? `★ ${overallRating}` : "—"}
          />
        </div>
      )}

      <div className="mt-6 flex gap-1 border-b border-gray-200">
        <Tab active={tab === "all"} onClick={() => setTab("all")}>
          All <Pill>{sessions.length}</Pill>
        </Tab>
        <Tab active={tab === "upcoming"} onClick={() => setTab("upcoming")}>
          Upcoming <Pill>{upcoming.length}</Pill>
        </Tab>
        <Tab active={tab === "past"} onClick={() => setTab("past")}>
          Past <Pill>{past.length}</Pill>
        </Tab>
      </div>

      {selectedSessionId && (
        <BookingsModal sessionId={selectedSessionId} onClose={() => setSelectedSessionId(null)} />
      )}

      {filtered.length === 0 && sessions.length === 0 ? (
        <div className="my-16 flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-semibold text-gray-800">
            You haven't created any sessions yet.
          </p>
          <p className="text-sm text-gray-500">Create your first workshop.</p>
          <Link to="/creator/sessions/new" className="btn-primary mt-2">
            Create Session
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-gray-400">
          No {tab} sessions.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {filtered.map((s) => (
            <SessionRow
              key={s.id}
              session={s}
              confirming={confirmDeleteId === s.id}
              deleting={deleteMutation.isPending && confirmDeleteId === s.id}
              onDelete={() => setConfirmDeleteId(s.id)}
              onConfirm={() => deleteMutation.mutate(s.id)}
              onCancel={() => setConfirmDeleteId(null)}
              onViewBookings={() => setSelectedSessionId(s.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SessionRow({ session: s, confirming, deleting, onDelete, onConfirm, onCancel, onViewBookings }) {
  const isPast = new Date(s.start_time) < new Date();
  const booked = s.active_bookings || 0;
  const fillPct = s.capacity ? Math.round((booked / s.capacity) * 100) : 0;
  const isFull = s.seats_remaining === 0 && !isPast;
  const badge = sessionBadge(s);

  return (
    <li className="card p-4">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/sessions/${s.id}`}
              className="font-semibold leading-snug hover:underline"
            >
              {s.title}
            </Link>
            {badge && <Badge color={badge.color}>{badge.label}</Badge>}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Icon name="calendar" className="h-3.5 w-3.5 text-gray-400" />
              {formatDateTime(s.start_time)}
            </span>
            <span className="text-gray-300">·</span>
            <span>
              {s.location_type === "online" ? "Online" : "In person"} &bull;{" "}
              {skillLevelLabel(s.skill_level)}
            </span>
            <span className="text-gray-300">·</span>
            <span className="font-medium text-gray-700">
              {formatPrice(s.price, s.currency)}
            </span>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>{booked} booked</span>
              <span>{s.capacity} seats</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${
                  isPast ? "bg-gray-400" : isFull ? "bg-yellow-400" : "bg-brand"
                }`}
                style={{ width: `${Math.max(fillPct, booked > 0 ? 3 : 0)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Delete?</span>
              <button
                onClick={onConfirm}
                disabled={deleting}
                className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Yes
              </button>
              <button
                onClick={onCancel}
                className="rounded px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onViewBookings}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                title="View bookings"
              >
                <Icon name="users" className="h-4 w-4" />
              </button>
              <Link
                to={`/creator/sessions/${s.id}/edit`}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                title="Edit"
              >
                <Icon name="edit" className="h-4 w-4" />
              </Link>
              <button
                onClick={onDelete}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Icon name="trash" className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-gray-900 text-gray-900"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      {children}
    </span>
  );
}

function BookingsModal({ sessionId, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["session-bookings", sessionId],
    queryFn: async () =>
      (await api.get(`/creator/sessions/${sessionId}/bookings/`)).data,
  });
  const bookings = data?.bookings || [];
  const sessionTitle = data?.session?.title;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Bookings{sessionTitle ? ` — ${sessionTitle}` : ""}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-gray-500">Loading…</p>
        ) : bookings.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No bookings yet.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="pb-2 pr-4">Guest</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Paid</th>
                <th className="pb-2">Booked on</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-gray-100">
                  <td className="py-2 pr-4 font-medium">{b.user_name}</td>
                  <td className="py-2 pr-4 text-gray-500">{b.user_email}</td>
                  <td className="py-2 pr-4">
                    <Badge color={BOOKING_STATUS_COLOR[b.status]}>{b.status}</Badge>
                  </td>
                  <td className="py-2 pr-4">{formatPrice(b.amount_paid)}</td>
                  <td className="py-2 text-gray-400">
                    {new Date(b.created_at).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
