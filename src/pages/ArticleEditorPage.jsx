import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ArticleForm from '../components/ArticleForm';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import { useCms } from '../context/CmsContext';

export default function ArticleEditorPage({ mode }) {
  const { id } = useParams();
  const { articles, loading, error, loadArticles } = useCms();
  const article = mode === 'edit' ? articles.find((item) => item.id === id) : null;

  if (loading && mode === 'edit') return <div className="editor-loading"><LoadingState rows={6} /></div>;
  if (error && mode === 'edit') return <ErrorState message={error} onRetry={loadArticles} />;
  if (mode === 'edit' && !article) {
    return <div className="not-found-inline"><span>404</span><h2>That article isn’t here</h2><p>It may have been deleted or the link is no longer valid.</p><Link className="button button--primary" to="/articles"><ArrowLeft size={16} /> Back to articles</Link></div>;
  }

  return <ArticleForm key={article?.id || 'new'} article={article} mode={mode} />;
}
