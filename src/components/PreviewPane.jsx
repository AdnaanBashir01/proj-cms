import { CalendarDays, Clock3 } from 'lucide-react';
import { formatDate, initials, readingTime } from '../utils/format';

function renderInlineFormatting(text) {
  const tokens = text.split(/(\*\*.+?\*\*|__.+?__|_.+?_|\[[^\]]+\]\(https?:\/\/[^)]+\))/g);
  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) return <strong key={index}>{token.slice(2, -2)}</strong>;
    if (token.startsWith('__') && token.endsWith('__')) return <u key={index}>{token.slice(2, -2)}</u>;
    if (token.startsWith('_') && token.endsWith('_')) return <em key={index}>{token.slice(1, -1)}</em>;
    const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    return token;
  });
}

function renderBlock(paragraph, index) {
  const text = paragraph.trim();
  if (text.startsWith('## ')) return <h2 key={index}>{renderInlineFormatting(text.slice(3))}</h2>;
  if (text.startsWith('• ')) return <p className="article-preview__list-item" key={index}>{renderInlineFormatting(text.slice(2))}</p>;
  return <p key={index}>{renderInlineFormatting(text)}</p>;
}

export default function PreviewPane({ article, compact = false }) {
  const paragraphs = (article.body || '').split(/\n+/).filter(Boolean);
  return (
    <article className={`article-preview ${compact ? 'article-preview--compact' : ''}`}>
      <div className="article-preview__image">
        <img src={article.featuredImage || '/images/editorial-1.svg'} alt={article.title ? `Featured artwork for ${article.title}` : 'Article featured artwork'} />
        <span>{article.category || 'Category'}</span>
      </div>
      <div className="article-preview__content">
        <div className="article-preview__eyebrow">{article.category || 'Uncategorized'} · Storyline</div>
        <h1>{article.title || 'Your article title will appear here'}</h1>
        <div className="article-preview__meta">
          <span className="avatar avatar--sand">{initials(article.author || 'Your Name')}</span>
          <span><strong>{article.author || 'Your name'}</strong><small><CalendarDays size={13} /> {formatDate(article.updatedAt || new Date())} <i>·</i> <Clock3 size={13} /> {readingTime(article.body)} min read</small></span>
        </div>
        <div className="article-preview__body">
          {paragraphs.length ? paragraphs.map(renderBlock) : <p className="article-preview__placeholder">Start writing to see your story take shape in real time.</p>}
        </div>
        {!!article.tags?.length && (
          <div className="article-preview__tags">
            {article.tags.map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
        )}
      </div>
    </article>
  );
}
