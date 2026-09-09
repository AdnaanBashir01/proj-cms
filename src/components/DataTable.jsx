import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Send, Trash2, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/format';

function SortButton({ field, activeField, direction, onSort, children }) {
  const active = activeField === field;
  return (
    <button className={`table-sort ${active ? 'is-active' : ''}`} type="button" onClick={() => onSort(field)}>
      {children}
      {active ? (direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} />}
    </button>
  );
}

export default function DataTable({ articles, sort, onSort, onDelete, onToggleStatus, togglingId, selectedIds, onToggleSelect, onToggleAll }) {
  const allSelected = articles.length > 0 && articles.every((article) => selectedIds.has(article.id));

  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th><div className="table-article-heading"><input className="table-check" type="checkbox" checked={allSelected} onChange={onToggleAll} aria-label="Select all articles on this page" /><SortButton field="title" activeField={sort.field} direction={sort.direction} onSort={onSort}>Article</SortButton></div></th>
            <th><SortButton field="category" activeField={sort.field} direction={sort.direction} onSort={onSort}>Category</SortButton></th>
            <th><SortButton field="status" activeField={sort.field} direction={sort.direction} onSort={onSort}>Status</SortButton></th>
            <th><SortButton field="updatedAt" activeField={sort.field} direction={sort.direction} onSort={onSort}>Last updated</SortButton></th>
            <th className="data-table__actions-heading"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td data-label="Article">
                <div className="article-cell">
                  <input className="table-check" type="checkbox" checked={selectedIds.has(article.id)} onChange={() => onToggleSelect(article.id)} aria-label={`Select ${article.title}`} />
                  <img src={article.featuredImage || '/images/editorial-1.svg'} alt="" />
                  <div>
                    <Link to={`/articles/${article.id}/edit`}>{article.title}</Link>
                    <span>by {article.author}</span>
                  </div>
                </div>
              </td>
              <td data-label="Category"><span className="category-label">{article.category}</span></td>
              <td data-label="Status"><StatusBadge status={article.status} /></td>
              <td data-label="Updated"><div className="date-cell">{formatDate(article.updatedAt)}<span>{new Date(article.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span></div></td>
              <td className="data-table__actions">
                <Link className="table-action" to={`/articles/${article.id}/preview`} aria-label={`Preview ${article.title}`} title="Preview"><Eye size={17} /></Link>
                <Link className="table-action" to={`/articles/${article.id}/edit`} aria-label={`Edit ${article.title}`} title="Edit"><Pencil size={16} /></Link>
                <button
                  className="table-action"
                  type="button"
                  onClick={() => onToggleStatus(article)}
                  disabled={togglingId === article.id}
                  aria-label={`${article.status === 'published' ? 'Unpublish' : 'Publish'} ${article.title}`}
                  title={article.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {article.status === 'published' ? <Undo2 size={16} /> : <Send size={16} />}
                </button>
                <button className="table-action table-action--danger" type="button" onClick={() => onDelete(article)} aria-label={`Delete ${article.title}`} title="Delete"><Trash2 size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
