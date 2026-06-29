import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import SessionCard from "../components/SessionCard";
import { Icon } from "../components/ui";

export default function Home() {
  const { user } = useAuth();
  if (user?.role === "creator") return <Navigate to="/creator/dashboard" replace />;
  return <HomeSections />;
}

/* ------------------------------- Attendee ------------------------------- */

// Curated rows shown on the landing page, Airbnb-style. Each is backed by the
// catalog list endpoint and links through to the full catalog page.
const HOME_SECTIONS = [
  { category: "", title: "Popular sessions" },
  { category: "workshop", title: "Workshops" },
  { category: "fitness", title: "Fitness & movement" },
  { category: "photography", title: "Photography" },
  { category: "cooking", title: "Cooking" },
  { category: "mentoring", title: "Mentoring & coaching" },
];

function HomeSections() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  return (
    <div>
      {/* Hero */}
      <section className="bg-white px-6 py-12 text-center sm:py-20">
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
          Book live sessions from creators you'll love
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/sessions${search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ""}`);
          }}
          className="mx-auto mt-8 flex max-w-2xl items-center rounded-full border border-gray-300 bg-white px-5 py-3 shadow-md focus-within:border-gray-900 focus-within:shadow-lg"
        >
          <Icon name="search" className="mr-3 h-5 w-5 shrink-0 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions, e.g. yoga, photography…"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-400"
          />
          <button type="submit" className="btn-primary ml-3 rounded-full px-6 py-2.5 text-sm font-semibold">
            Search
          </button>
        </form>
      </section>

      {/* Sections */}
      <div className="mt-10 space-y-12">
        {HOME_SECTIONS.map((s) => (
          <SessionSection key={s.category || "all"} category={s.category} title={s.title} />
        ))}
      </div>
    </div>
  );
}

function SessionSection({ category, title }) {
  const { data, isLoading } = useQuery({
    queryKey: ["home-section", category],
    queryFn: async () => {
      const params = category ? { category } : {};
      return (await api.get("/sessions/", { params })).data;
    },
  });

  const sessions = data?.results ?? (Array.isArray(data) ? data : []);
  // Quietly drop sections that are still loading or have nothing to show.
  if (isLoading || sessions.length === 0) return null;

  const viewAll = category ? `/sessions?category=${category}` : "/sessions";

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Link
          to={viewAll}
          className="group flex shrink-0 items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          <span className="hidden sm:inline">View all</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 transition group-hover:border-gray-900">
            <Icon name="arrowRight" className="h-4 w-4" />
          </span>
        </Link>
      </div>
      <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {sessions.slice(0, 8).map((s) => (
          <div key={s.id} className="w-60 shrink-0 snap-start sm:w-64">
            <SessionCard session={s} />
          </div>
        ))}
      </div>
    </section>
  );
}
