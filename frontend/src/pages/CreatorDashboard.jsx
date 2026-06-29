import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { formatDateTime, formatPrice } from "../lib/format";
import { PageLoader, ErrorState, EmptyState } from "../components/ui";

export default function CreatorDashboard() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["creator-sessions"],
    queryFn: async () => (await api.get("/creator/sessions/")).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/sessions/${id}/`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["creator-sessions"] }),
  });

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState />;

  const sessions = data?.results ?? (Array.isArray(data) ? data : []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My sessions</h1>
        <Link to="/creator/sessions/new" className="btn-primary">
          + New session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState title="No sessions yet" subtitle="Create your first session." />
      ) : (
        <div className="divide-y rounded-xl border border-gray-100 bg-white">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <Link to={`/sessions/${s.id}`} className="font-semibold hover:underline">
                  {s.title}
                </Link>
                <p className="text-sm text-gray-500">
                  {formatDateTime(s.start_time)} · {formatPrice(s.price, s.currency)}
                </p>
                <p className="text-xs text-gray-400">
                  {s.active_bookings ?? 0}/{s.capacity} booked
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-sm">
                <Link to={`/creator/sessions/${s.id}/edit`} className="text-gray-600 hover:text-gray-900">
                  Edit
                </Link>
                <Link to={`/creator/sessions/${s.id}/bookings`} className="text-gray-600 hover:text-gray-900">
                  Bookings
                </Link>
                <button
                  onClick={() => deleteMutation.mutate(s.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
