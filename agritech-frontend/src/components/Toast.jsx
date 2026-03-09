import { useApp } from '../context/AppContext';

export default function Toast() {
    const { toasts } = useApp();
    if (!toasts.length) return null;
    return (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {toasts.map(t => (
                <div key={t.id} style={{
                    background: 'var(--green-primary)', border: '1px solid var(--gold-primary)',
                    color: 'var(--text-primary)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)',
                    fontSize: '0.9rem', fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    animation: 'slideIn 0.3s ease-out', minWidth: 280, maxWidth: 400,
                }}>
                    <span style={{ color: 'var(--gold-primary)', marginRight: '0.5rem' }}>✓</span>{t.message}
                </div>
            ))}
            <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity:0; } to { transform: translateX(0); opacity:1; } }`}</style>
        </div>
    );
}
