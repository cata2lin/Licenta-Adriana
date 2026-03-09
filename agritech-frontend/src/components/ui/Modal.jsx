/**
 * Reusable Modal component.
 * Renders a centered overlay with a card. Click outside or press Escape to close.
 * Isolating modal UI logic prevents duplication across Market, Disputes, etc.
 */
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, width = 500 }) {
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', handleEsc); document.body.style.overflow = ''; };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, animation: 'fadeIn 0.2s ease-out' }}>
            <div className="card modal-content" onClick={e => e.stopPropagation()} style={{ width, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto', animation: 'slideUp 0.25s ease-out' }}>
                {title && <h3 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>{title}</h3>}
                {children}
            </div>
            <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(20px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>
        </div>
    );
}
