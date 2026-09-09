import { FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ filtered = false, onClear }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><FileText size={25} /></div>
      <h3>{filtered ? 'No articles match those filters' : 'Your first story starts here'}</h3>
      <p>{filtered ? 'Try broadening your search or clearing a filter.' : 'Create an article and bring your publication to life.'}</p>
      {filtered ? (
        <button className="button button--secondary" type="button" onClick={onClear}>Clear all filters</button>
      ) : (
        <Link className="button button--primary" to="/articles/new"><Plus size={17} /> New article</Link>
      )}
    </div>
  );
}
