import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "../api/client";
import SessionCard from "../components/SessionCard";
import Pagination from "../components/Pagination";
import { FILTER_CATEGORIES, categoryLabel } from "../lib/format";
import { EmptyState, ErrorState, Icon, PageLoader } from "../components/ui";

const PAGE_SIZE = 24; // matches DRF PAGE_SIZE in backend settings

const SORT_OPTIONS = [
  { value: "soonest", label: "Starting soon" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const search = params.get("search") || "";
  const sort = params.get("sort") || "soonest";
  const page = Number(params.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => setSearchInput(search), [search]);

  // Merge param updates while always resetting to page 1 (except when paging).
  const update = (patch, { keepPage = false } = {}) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    if (!keepPage) next.delete("page");
    setParams(next);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["catalog", category, search, sort, page],
    queryFn: async () => {
      const q = { page };
      if (category) q.category = category;
      if (search) q.search = search;
      if (sort) q.sort = sort;
      const { data } = await api.get("/sessions/", { params: q });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const sessions = data?.results ?? (Array.isArray(data) ? data : []);
  const count = data?.count ?? sessions.length;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const heading = category ? categoryLabel(category) : "All sessions";

  return (
    <div>
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <p className="text-sm font-medium text-gray-500">
          Browse sessions{category ? ` · ${categoryLabel(category)}` : ""}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          {search ? `Results for “${search}”` : heading}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Find and book live sessions from creators — pick a topic, secure your seat.
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ search: searchInput.trim() });
        }}
        className="mt-5 flex max-w-xl items-center gap-2 rounded-full border border-gray-300 px-2 py-1.5 shadow-sm focus-within:border-gray-900"
      >
        <Icon name="search" className="ml-2 h-4 w-4 text-gray-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search sessions, e.g. yoga, photography…"
          className="flex-1 bg-transparent px-1 outline-none"
        />
        <button type="submit" className="btn-primary rounded-full px-5 py-2 text-sm">
          Search
        </button>
      </form>

      {/* Category chips */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <Chip active={category === ""} onClick={() => update({ category: "" })}>
          All
        </Chip>
        {FILTER_CATEGORIES.map((c) => (
          <Chip
            key={c.value}
            active={category === c.value}
            onClick={() => update({ category: c.value })}
          >
            {c.label}
          </Chip>
        ))}
      </div>

      {/* Toolbar: result count + sort */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-600">
          {count.toLocaleString("en-IN")} result{count === 1 ? "" : "s"}
        </p>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span className="hidden sm:inline">Sort by</span>
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-gray-900 focus:border-gray-900 focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Results */}
      <div className="mt-6">
        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <ErrorState message="Could not load sessions." />
        ) : sessions.length === 0 ? (
          <EmptyState title="No sessions found" subtitle="Try a different category or search." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {sessions.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => update({ page: String(p) }, { keepPage: true })}
            />
          </>
        )}
      </div>
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-300 hover:border-gray-900"
      }`}
    >
      {children}
    </button>
  );
}
