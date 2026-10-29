import { useEffect, useId, useRef, type ReactNode } from 'react';

export function DetailDialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('button')?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  return <dialog ref={ref} className="detail-dialog" aria-labelledby={titleId} onCancel={event => {
    event.preventDefault(); onClose();
  }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); onClose(); }
    // Explicitly wrap Tab because some browsers otherwise move it to browser chrome.
    if (event.key === 'Tab') {
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (first && last && ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last))) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    }
  }}>
    <div className="dialog-content">
      <div className="dialog-heading"><h2 id={titleId}>{title}</h2><button type="button" className="secondary" onClick={onClose}>Close</button></div>
      {children}
    </div>
  </dialog>;
}
