import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import PreviewPane from '../components/PreviewPane';
import StatusBadge from '../components/StatusBadge';
import { useCms } from '../context/CmsContext';

export default function ArticlePreviewPage() {
  const { id } = useParams();
  const { articles, loading, error, loadArticles } = useCms();
  const article = articles.find((item) => item.id === id);

  if (loading) return <LoadingState rows={6} />;
  if (error) return <ErrorState message={error} onRetry={loadArticles} />;
  if (!article) return <div className="not-found-inline"><span>404</span><h2>Preview unavailable</h2><p>We couldn’t find this article.</p><Link className="button button--primary" to="/articles">Back to articles</Link></div>;

  return (
    <div className="preview-page">
      <div className="preview-page__bar">
        <Link to="/articles" className="back-link"><ArrowLeft size={16} /> All articles</Link>
        <div><span>Previewing</span><StatusBadge status={article.status} /></div>
        <Link className="button button--primary" to={`/articles/${article.id}/edit`}><Pencil size={16} /> Edit article</Link>
      </div>
      <div className="preview-browser">
        <div className="preview-browser__chrome"><div><i /><i /><i /></div><span>storyline.site/stories/{article.id}</span><ExternalLink size={15} /></div>
        <PreviewPane article={article} />
      </div>
    </div>
  );
}
