/**
 * PageHeader component with optional back button.
 * Designed for farmer-friendly UX: large, clear title with easy navigation.
 * The back button uses the browser's history for intuitive navigation.
 */
import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, highlight, showBack = false, backTo, children }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (backTo) navigate(backTo);
        else navigate(-1);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {showBack && (
                <button
                    onClick={handleBack}
                    className="btn btn-outline"
                    style={{ fontSize: '1rem', padding: '0.5rem 0.75rem', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Înapoi"
                    aria-label="Înapoi la pagina anterioară"
                >
                    ← Înapoi
                </button>
            )}
            <div className="page-title" style={{ marginBottom: 0, flex: 1 }}>
                {title} {highlight && <span>{highlight}</span>}
            </div>
            {children}
        </div>
    );
}
