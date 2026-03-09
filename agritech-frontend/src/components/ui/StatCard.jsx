/**
 * Reusable StatCard component for dashboards.
 * Isolates the stat display pattern used across Dashboard, Admin, Logistics.
 */
export default function StatCard({ title, value, suffix, icon, badge, badgeType = 'green' }) {
    return (
        <div className="card" style={{ textAlign: 'center' }}>
            {icon && <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>}
            <div className="card-title">{title}</div>
            <div className="card-value gold">
                {value}{suffix && <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>{suffix}</span>}
            </div>
            {badge && <span className={`badge badge-${badgeType}`} style={{ marginTop: '0.5rem' }}>{badge}</span>}
        </div>
    );
}
