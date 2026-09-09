import {
  BookOpen,
  Clock3,
  DraftingCompass,
  FileCheck2,
  FolderTree,
  MoreHorizontal,
  Plus,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCms } from "../context/CmsContext";
import StatCard from "../components/StatCard";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import StatusBadge from "../components/StatusBadge";
import { formatDate, initials, timeAgo } from "../utils/format";

export default function DashboardPage() {
  const { articles, loading, error, loadArticles, categories } = useCms();
  const published = articles.filter(
    (article) => article.status === "published",
  );
  const drafts = articles.filter((article) => article.status === "draft");
  const recent = articles.slice(0, 5);
  const categoryStats = categories
    .map((name) => ({
      name,
      count: articles.filter((article) => article.category === name).length,
    }))
    .sort((a, b) => b.count - a.count);
  const maxCategory = Math.max(...categoryStats.map((item) => item.count), 1);
  const firstName = "Adnan";
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  if (error && !articles.length)
    return <ErrorState message={error} onRetry={loadArticles} />;

  return (
    <div className="dashboard-page">
      <section className="page-heading page-heading--dashboard">
        <div>
          <p className="eyebrow">
            {new Intl.DateTimeFormat("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(new Date())}
          </p>
          <h2>
            {greeting}, {firstName} <span aria-hidden="true">🫠</span>
          </h2>
          <p>Here’s what’s happening with your publication today.</p>
        </div>
        <Link className="button button--primary" to="/articles/new">
          <Plus size={17} /> New article
        </Link>
      </section>

      {loading ? (
        <LoadingState cards />
      ) : (
        <section className="stats-grid" aria-label="Publishing summary">
          <StatCard
            label="Total articles"
            value={articles.length}
            note="from last month"
            icon={BookOpen}
            trend={8.4}
            tone="green"
          />
          <StatCard
            label="Published"
            value={published.length}
            note={`${Math.round((published.length / Math.max(articles.length, 1)) * 100)}% of all content`}
            icon={FileCheck2}
            trend={12}
            tone="blue"
          />
          <StatCard
            label="In draft"
            value={drafts.length}
            note={drafts.length ? "waiting for review" : "inbox is clear"}
            icon={DraftingCompass}
            trend={-2.1}
            tone="sand"
          />
          <StatCard
            label="Categories"
            value={categories.length}
            note="active topics"
            icon={FolderTree}
            tone="violet"
          />
        </section>
      )}

      <div className="dashboard-grid">
        <section className="panel panel--wide">
          <div className="panel__heading">
            <div>
              <h3>Recent content</h3>
              <p>Your team’s latest stories and drafts.</p>
            </div>
            <Link to="/articles">
              View all <span>→</span>
            </Link>
          </div>
          {loading ? (
            <LoadingState rows={5} />
          ) : (
            <div className="recent-list">
              {recent.map((article) => (
                <div className="recent-row" key={article.id}>
                  <img
                    src={article.featuredImage || "/images/editorial-1.svg"}
                    alt=""
                  />
                  <div className="recent-row__title">
                    <Link to={`/articles/${article.id}/edit`}>
                      {article.title}
                    </Link>
                    <span>
                      {article.category} · {article.author}
                    </span>
                  </div>
                  <StatusBadge status={article.status} />
                  <div className="recent-row__date">
                    <strong>
                      {formatDate(article.updatedAt, { year: undefined })}
                    </strong>
                    <span>{timeAgo(article.updatedAt)}</span>
                  </div>
                  <Link
                    className="icon-button"
                    to={`/articles/${article.id}/edit`}
                    aria-label={`Edit ${article.title}`}
                  >
                    <MoreHorizontal size={18} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="panel publishing-card">
          <div className="panel__heading">
            <div>
              <h3>Publishing pulse</h3>
              <p>This month’s progress.</p>
            </div>
          </div>
          <div
            className="publishing-ring"
            style={{
              "--progress": `${Math.round((published.length / Math.max(articles.length, 1)) * 100) * 3.6}deg`,
            }}
          >
            <div>
              <strong>
                {Math.round(
                  (published.length / Math.max(articles.length, 1)) * 100,
                )}
                %
              </strong>
              <span>published</span>
            </div>
          </div>
          <div className="publishing-card__legend">
            <p>
              <span className="dot dot--green" />
              Published <strong>{published.length}</strong>
            </p>
            <p>
              <span className="dot dot--sand" />
              Drafts <strong>{drafts.length}</strong>
            </p>
          </div>
          <Link
            className="button button--secondary button--block"
            to="/articles?status=draft"
          >
            Review drafts <span>→</span>
          </Link>
        </aside>

        <section className="panel category-panel">
          <div className="panel__heading">
            <div>
              <h3>Content by category</h3>
              <p>How your stories are distributed.</p>
            </div>
            <Link to="/categories">Manage</Link>
          </div>
          <div className="category-bars">
            {categoryStats.map((item, index) => (
              <div className="category-bar" key={item.name}>
                <div>
                  <span>{item.name}</span>
                  <strong>{item.count}</strong>
                </div>
                <div>
                  <i
                    style={{
                      width: `${(item.count / maxCategory) * 100}%`,
                      "--delay": `${index * 80}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel activity-panel">
          <div className="panel__heading">
            <div>
              <h3>Recent activity</h3>
              <p>A quick look at team changes.</p>
            </div>
          </div>
          <div className="activity-list">
            {recent.slice(0, 4).map((article, index) => (
              <div className="activity-item" key={article.id}>
                <span
                  className={`avatar avatar--${index % 2 ? "sand" : "green"}`}
                >
                  {initials(article.author)}
                </span>
                <div>
                  <p>
                    <strong>{article.author}</strong>{" "}
                    {article.status === "published" ? "published" : "updated"}{" "}
                    <Link to={`/articles/${article.id}/edit`}>
                      {article.title}
                    </Link>
                  </p>
                  <span>
                    <Clock3 size={13} /> {timeAgo(article.updatedAt)}
                  </span>
                </div>
                <span className="activity-item__icon">
                  {article.status === "published" ? (
                    <Send size={14} />
                  ) : (
                    <DraftingCompass size={14} />
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
