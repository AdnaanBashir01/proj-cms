export default function LoadingState({ rows = 5, cards = false }) {
  if (cards) {
    return <div className="stats-grid" aria-label="Loading dashboard">{Array.from({ length: 4 }, (_, i) => <div className="skeleton skeleton--card" key={i} />)}</div>;
  }
  return (
    <div className="skeleton-table" aria-label="Loading articles">
      {Array.from({ length: rows }, (_, i) => <div className="skeleton skeleton--row" key={i} />)}
    </div>
  );
}
