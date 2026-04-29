interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const btnClass =
  'px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm cursor-pointer transition-colors hover:bg-gray-100 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700 dark:hover:border-slate-500';

export function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
      <button className={btnClass} onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        ← Prev
      </button>
      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
        Page {page} of {totalPages}
        <span className="text-gray-400 dark:text-gray-500 font-normal"> ({total.toLocaleString()} players)</span>
      </span>
      <button className={btnClass} onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next →
      </button>
    </div>
  );
}
