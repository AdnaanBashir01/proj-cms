export default function StatusBadge({ status }) {
  const normalized = status === 'published' ? 'published' : 'draft';
  return (
    <span className={`status-badge status-badge--${normalized}`}>
      <span aria-hidden="true" />
      {normalized[0].toUpperCase() + normalized.slice(1)}
    </span>
  );
}
