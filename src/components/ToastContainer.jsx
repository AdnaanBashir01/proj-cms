import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useCms } from '../context/CmsContext';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useCms();
  return (
    <div className="toast-region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div className={`toast toast--${toast.type}`} key={toast.id}>
            <Icon size={19} aria-hidden="true" />
            <p>{toast.message}</p>
            <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification"><X size={16} /></button>
          </div>
        );
      })}
    </div>
  );
}
