import { RefreshCw, WifiOff } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <div><WifiOff size={22} /></div>
      <h3>We couldn’t load your content</h3>
      <p>{message}</p>
      <button className="button button--secondary" type="button" onClick={onRetry}><RefreshCw size={16} /> Try again</button>
    </div>
  );
}
