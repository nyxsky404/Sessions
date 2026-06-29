import { Icon } from "./ui";

function pageList(current, total) {
  if (total <= 10) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([
    1,
    2,
    total,
    total - 1,
    current,
    current - 1,
    current + 1,
  ]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
  };

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-2 sm:gap-3"
      aria-label="Pagination"
    >
      <ArrowButton
        label="Previous page"
        icon="arrowLeft"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
      />

      <div className="flex items-center gap-1 sm:gap-2">
        {pageList(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`gap-${i}`} className="px-1.5 text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => go(p)}
              aria-current={p === page ? "page" : undefined}
              className="relative px-2.5 py-1 text-base transition"
            >
              <span
                className={
                  p === page
                    ? "font-bold text-gray-900"
                    : "font-medium text-gray-400 hover:text-gray-900"
                }
              >
                {p}
              </span>
              {p === page && (
                <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-gray-900" />
              )}
            </button>
          )
        )}
      </div>

      <ArrowButton
        label="Next page"
        icon="arrowRight"
        disabled={page >= totalPages}
        onClick={() => go(page + 1)}
      />
    </nav>
  );
}

function ArrowButton({ icon, label, disabled, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:border-gray-900 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
    >
      <Icon name={icon} className="h-5 w-5" />
    </button>
  );
}
