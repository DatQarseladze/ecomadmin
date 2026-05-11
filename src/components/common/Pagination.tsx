interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  itemLabel = "ჩანაწერი",
}: PaginationProps) {
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd   = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {total === 0 ? "0" : `${rangeStart}–${rangeEnd}`} / {total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-blue-600 text-white"
                : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
