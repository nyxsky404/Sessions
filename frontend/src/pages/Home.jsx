import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import SessionCard from "../components/SessionCard";
import { CATEGORIES } from "../lib/format";
import { PageLoader, ErrorState, EmptyState } from "../components/ui";

export default function Home() {
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["sessions", category, query],
    queryFn: async () => {
      const params = {};
      if (category) params.category = category;
      if (query) params.search = query;
      return (await api.get("/sessions/", { params })).data;
    },
  });

  const sessions = data?.results ?? (Array.isArray(data) ? data : []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Find your next session</h1>
        <p className="mt-1 text-gray-500">
          Discover and book sessions from creators near you.
        </p>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search sessions…"
        className="input mb-4"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Chip active={category === ""} onClick={() => setCategory("")}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.value}
            active={category === c.value}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : sessions.length === 0 ? (
        <EmptyState message="No sessions found." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-300 text-gray-700 hover:border-gray-900"
      }`}
    >
      {children}
    </button>
  );
}
