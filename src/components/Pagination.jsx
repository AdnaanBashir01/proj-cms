import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pageCount, total, pageSize, onPageChange }) {
  if (pageCount <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (item) => item === 1 || item === pageCount || Math.abs(item - page) <= 1,
  );

  return (
    <nav className="pagination" aria-label="Article pages">
      <p>Showing <strong>{start}–{end}</strong> of <strong>{total}</strong></p>
      <div className="pagination__controls">
        <button
          className="icon-button"
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>
        {pages.map((item, index) => (
          <span key={item} className="pagination__slot">
            {index > 0 && pages[index - 1] !== item - 1 && <span className="pagination__ellipsis">…</span>}
            <button
              type="button"
              className={item === page ? 'is-active' : ''}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          </span>
        ))}
        <button
          className="icon-button"
          type="button"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
