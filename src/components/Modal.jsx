import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function Modal({ open, title, children, confirmLabel = 'Confirm', onConfirm, onClose, busy = false, tone = 'danger', icon: Icon = AlertTriangle }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    // Preserve a descendant's React autoFocus; otherwise place focus on the safe cancel action.
    if (!document.activeElement?.closest?.('.modal')) cancelRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus();
    };
  }, [open, onClose, busy]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal__close icon-button" type="button" onClick={onClose} aria-label="Close dialog" disabled={busy}>
          <X size={19} />
        </button>
        <div className={`modal__icon modal__icon--${tone}`}><Icon size={22} /></div>
        <h2 id="modal-title">{title}</h2>
        <div className="modal__body">{children}</div>
        <div className="modal__actions">
          <button ref={cancelRef} className="button button--secondary" type="button" onClick={onClose} disabled={busy}>Cancel</button>
          <button className={`button button--${tone === 'brand' ? 'primary' : tone}`} type="button" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
