/**
 * Confirmation dialog component for destructive actions.
 * Important for farmer-friendly UX: prevents accidental deletions or status changes.
 * Large buttons (min 44px) and clear, simple Romanian language.
 */
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirmare', message, confirmText = 'Confirmă', cancelText = 'Anulează', type = 'warning' }) {
    const colors = {
        warning: 'var(--gold-primary)',
        danger: 'var(--red-primary)',
        success: 'var(--green-badge)',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} width={420}>
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                    {type === 'danger' ? '⚠️' : type === 'success' ? '✅' : '❓'}
                </div>
                <h3 style={{ color: colors[type], marginBottom: '1rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>{message}</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button
                        className={`btn ${type === 'danger' ? 'btn-red-outline' : 'btn-gold'}`}
                        onClick={() => { onConfirm(); onClose(); }}
                        style={{ minWidth: 120, minHeight: 44, justifyContent: 'center', fontSize: '0.95rem' }}
                    >{confirmText}</button>
                    <button
                        className="btn btn-outline"
                        onClick={onClose}
                        style={{ minWidth: 120, minHeight: 44, justifyContent: 'center', fontSize: '0.95rem' }}
                    >{cancelText}</button>
                </div>
            </div>
        </Modal>
    );
}
