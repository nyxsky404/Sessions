import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { formatDateTime, formatPrice } from "../lib/format";
import { Badge, EmptyState, ErrorState, PageLoader, Spinner } from "../components/ui";

export default function UserDashboard() {
  const [tab, setTab] = useState("active");
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["bookings", tab],
    queryFn: async () =>
      (await api.get("/bookings/", { params: { filter: tab } })).data,
  });

  const cancel = useMutation({
    mutationFn: (id) => api.post(`/bookings/${id}/cancel/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });

  const bookings = data || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">My bookings</h1>

      <div className="mt-4 flex gap-2">
        {["active", "past"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              tab === t ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <ErrorState />
        ) : bookings.length === 0 ? (
          <EmptyState title="No bookings" subtitle="Sessions you book will show up here." />
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="card flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <Link to={`/sessions/${b.session.id}`} className="font-semibold hover:underline">
                    {b.session.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(b.session.start_time)} ·{" "}
                    {formatPrice(b.session.price, b.session.currency)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge color={b.status === "confirmed" ? "green" : "yellow"}>{b.status}</Badge>
                  {b.status !== "cancelled" && (
                    <button
                      onClick={() => cancel.mutate(b.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
