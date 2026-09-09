import { Download, FilePenLine, Filter, Plus, Send, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { useCms } from '../context/CmsContext';
import { useDebounce } from '../hooks/useDebounce';

const PAGE_SIZE = 7;

export default function ArticlesPage() {
  const { articles, categories, loading, error, loadArticles, deleteArticle, patchArticle, bulkUpdateArticles, bulkDeleteArticles, notify } = useCms();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [sort, setSort] = useState({ field: 'updatedAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 220);

  useEffect(() => {
    const handleGlobalSearch = (event) => setQuery(event.detail || '');
    window.addEventListener('storyline:article-search', handleGlobalSearch);
    return () => window.removeEventListener('storyline:article-search', handleGlobalSearch);
  }, []);

  useEffect(() => {
    const params = {};
    if (debouncedQuery) params.q = debouncedQuery;
    if (status !== 'all') params.status = status;
    if (category !== 'all') params.category = category;
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [debouncedQuery, status, category, setSearchParams]);

  const filtered = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase();
    return articles.filter((article) => {
      const haystack = `${article.title} ${article.author} ${article.category} ${article.tags.join(' ')}`.toLowerCase();
      return (!term || haystack.includes(term))
        && (status === 'all' || article.status === status)
        && (category === 'all' || article.category === category);
    }).sort((a, b) => {
      const left = sort.field.includes('At') ? new Date(a[sort.field]).getTime() : String(a[sort.field]).toLowerCase();
      const right = sort.field.includes('At') ? new Date(b[sort.field]).getTime() : String(b[sort.field]).toLowerCase();
      if (left < right) return sort.direction === 'asc' ? -1 : 1;
      if (left > right) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [articles, debouncedQuery, status, category, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    const availableIds = new Set(articles.map((article) => article.id));
    setSelectedIds((items) => new Set([...items].filter((id) => availableIds.has(id))));
  }, [articles]);

  const handleSort = (field) => {
    setSort((current) => ({ field, direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const clearFilters = () => {
    setQuery('');
    setStatus('all');
    setCategory('all');
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteArticle(deleteTarget.id);
      setSelectedIds((items) => {
        const next = new Set(items);
        next.delete(deleteTarget.id);
        return next;
      });
      setDeleteTarget(null);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (article) => {
    setTogglingId(article.id);
    try {
      await patchArticle(article.id, { status: article.status === 'published' ? 'draft' : 'published' });
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds((items) => {
      const next = new Set(items);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const togglePageSelection = () => {
    const allSelected = paged.every((article) => selectedIds.has(article.id));
    setSelectedIds((items) => {
      const next = new Set(items);
      paged.forEach((article) => allSelected ? next.delete(article.id) : next.add(article.id));
      return next;
    });
  };

  const applyBulkStatus = async (nextStatus) => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    setBulkBusy(true);
    try {
      await bulkUpdateArticles(ids, { status: nextStatus });
      setSelectedIds(new Set());
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  const confirmBulkDelete = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    setBulkBusy(true);
    try {
      await bulkDeleteArticles(ids);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  const isFiltered = !!debouncedQuery || status !== 'all' || category !== 'all';

  const exportArticles = () => {
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['Title', 'Author', 'Category', 'Status', 'Tags', 'Created', 'Updated'],
      ...filtered.map((article) => [
        article.title,
        article.author,
        article.category,
        article.status,
        article.tags.join(', '),
        article.createdAt,
        article.updatedAt,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `storyline-articles-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify(`${filtered.length} article${filtered.length === 1 ? '' : 's'} exported`, 'info');
  };

  return (
    <div className="articles-page">
      <section className="page-heading">
        <div><p className="eyebrow">Content library</p><h2>Every story, in one place</h2><p>Write, review, and publish content across your publication.</p></div>
        <Link className="button button--primary" to="/articles/new"><Plus size={17} /> New article</Link>
      </section>

      <section className="panel article-library">
        <div className="article-library__topline">
          <div><h3>All articles</h3><span>{articles.length} total</span></div>
          <button className="button button--secondary button--small library-view-button" type="button" onClick={exportArticles} disabled={!filtered.length}><Download size={15} /> Export CSV</button>
        </div>
        <div className="article-filters">
          <SearchBar value={query} onChange={setQuery} placeholder="Search title, author or tag…" label="Search articles" />
          <div className="article-filters__select"><Filter size={16} /><label className="sr-only" htmlFor="status-filter">Filter by status</label><select id="status-filter" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option></select></div>
          <div className="article-filters__select"><label className="sr-only" htmlFor="category-filter">Filter by category</label><select id="category-filter" value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select></div>
          {isFiltered && <button className="filter-clear" type="button" onClick={clearFilters}>Clear filters</button>}
        </div>

        {selectedIds.size > 0 && (
          <div className="bulk-actions" aria-live="polite">
            <div><strong>{selectedIds.size}</strong><span>selected</span></div>
            <div>
              <button type="button" onClick={() => applyBulkStatus('published')} disabled={bulkBusy}><Send size={15} /> Publish</button>
              <button type="button" onClick={() => applyBulkStatus('draft')} disabled={bulkBusy}><FilePenLine size={15} /> Move to drafts</button>
              <button className="is-danger" type="button" onClick={() => setBulkDeleteOpen(true)} disabled={bulkBusy}><Trash2 size={15} /> Delete</button>
              <button className="bulk-actions__clear" type="button" onClick={() => setSelectedIds(new Set())} aria-label="Clear selection"><X size={16} /></button>
            </div>
          </div>
        )}

        {loading ? <LoadingState rows={7} /> : error ? <ErrorState message={error} onRetry={loadArticles} /> : !paged.length ? <EmptyState filtered={isFiltered} onClear={clearFilters} /> : (
          <>
            <DataTable articles={paged} sort={sort} onSort={handleSort} onDelete={setDeleteTarget} onToggleStatus={toggleStatus} togglingId={togglingId} selectedIds={selectedIds} onToggleSelect={toggleSelection} onToggleAll={togglePageSelection} />
            <Pagination page={page} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </section>

      <Modal open={!!deleteTarget} title="Delete this article?" confirmLabel="Delete article" onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} busy={deleting}>
        <p><strong>“{deleteTarget?.title}”</strong> will be permanently removed from your publication. This action cannot be undone.</p>
      </Modal>

      <Modal open={bulkDeleteOpen} title={`Delete ${selectedIds.size} selected articles?`} confirmLabel="Delete selected" onClose={() => setBulkDeleteOpen(false)} onConfirm={confirmBulkDelete} busy={bulkBusy}>
        <p>The selected articles will be permanently removed. This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
