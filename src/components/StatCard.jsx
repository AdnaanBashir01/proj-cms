import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function StatCard({ label, value, note, icon: Icon, tone = 'green', trend }) {
  const up = trend >= 0;
  return (
    <article className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`}><Icon size={20} /></div>
      <div className="stat-card__main">
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
      <div className="stat-card__footer">
        {typeof trend === 'number' && (
          <span className={up ? 'trend trend--up' : 'trend trend--down'}>
            {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(trend)}%
          </span>
        )}
        <span>{note}</span>
      </div>
    </article>
  );
}
