import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="not-found-inline"><span>404</span><h2>Page not found</h2><p>The page you’re looking for has moved or doesn’t exist.</p><Link className="button button--primary" to="/"><ArrowLeft size={16} /> Back to dashboard</Link></div>;
}
