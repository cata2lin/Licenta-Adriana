import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, StatCard, ConfirmDialog } from '../components/ui';
import { formatRON } from '../utils/formatters';

export default function Dashboard() {
    const { user, listings, orders, removeListing, notifications } = useApp();
    const [confirmDelete, setConfirmDelete] = useState(null);

    const myListings = listings.filter(l => l.seller === (user?.companyName || 'SC AGRO ION SRL'));
    const activeOrders = orders.filter(o => o.delivery !== 'Livrat');
    const completedOrders = orders.filter(o => o.escrowType === 'green');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.sellerAmount, 0);

    return (
        <div className="page">
            <PageHeader title="Dashboard" highlight="Fermier" />

            {!user && (
                <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--gold-primary)' }}>
                    <span style={{ color: 'var(--gold-primary)' }}>⚠ </span>
                    Autentifică-te pentru a vedea datele tale reale.{' '}
                    <Link to="/login" style={{ fontWeight: 600 }}>Intră în cont →</Link>
                </div>
            )}

            <div className="stats-row">
                <StatCard title="Oferte Active" value={myListings.length} />
                <StatCard title="Contracte Active" value={activeOrders.length} />
                <StatCard title="Venituri Realizate" value={totalRevenue.toLocaleString()} suffix="RON" />
                <StatCard title="Rating" value="4.8" suffix="/5 ⭐" />
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-title" style={{ marginBottom: '1rem' }}>Ofertele Mele Active</div>
                    {myListings.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>Nu ai oferte active. <Link to="/create-listing">Publică prima ofertă →</Link></p>
                    ) : (
                        <table>
                            <thead><tr><th>Produs</th><th>Cantitate</th><th>Preț/t</th><th>Acțiuni</th></tr></thead>
                            <tbody>
                                {myListings.map(l => (
                                    <tr key={l.id}>
                                        <td>{l.name}</td>
                                        <td>{l.qty}t</td>
                                        <td style={{ color: 'var(--gold-primary)' }}>{formatRON(l.price)}</td>
                                        <td>
                                            <button
                                                className="btn btn-red-outline"
                                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', minHeight: 36 }}
                                                onClick={() => setConfirmDelete(l)}
                                            >Șterge</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    <Link to="/create-listing" style={{ display: 'inline-block', marginTop: '1rem' }}>
                        <button className="btn btn-gold" style={{ minHeight: 44 }}>+ Adaugă Ofertă Nouă</button>
                    </Link>
                </div>

                <div className="card">
                    <div className="card-title" style={{ marginBottom: '1rem' }}>Activitate Recentă</div>
                    <div className="timeline">
                        {notifications.slice(0, 5).map(n => (
                            <div className={`timeline-item ${!n.read ? 'active' : ''}`} key={n.id}>
                                <div className="timeline-text">{n.text}</div>
                                <div className="timeline-time">{n.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-title">Ultimele Comenzi</div>
                {orders.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Nicio comandă încă.</p>
                ) : (
                    <table style={{ marginTop: '0.75rem' }}>
                        <thead><tr><th>ID</th><th>Produs</th><th>Total</th><th>Escrow</th><th>Livrare</th></tr></thead>
                        <tbody>
                            {orders.slice(0, 5).map(o => (
                                <tr key={o.id}>
                                    <td style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>#{o.id}</td>
                                    <td>{o.product}</td>
                                    <td>{formatRON(o.total)}</td>
                                    <td><span className={`badge badge-${o.escrowType}`}>{o.escrow}</span></td>
                                    <td>{o.delivery}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <Link to="/orders" style={{ display: 'inline-block', marginTop: '1rem' }}>
                    <button className="btn btn-outline" style={{ minHeight: 44 }}>Vezi Toate Comenzile →</button>
                </Link>
            </div>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => { removeListing(confirmDelete.id); setConfirmDelete(null); }}
                title="Șterge Oferta?"
                message={`Ești sigur că vrei să ștergi oferta "${confirmDelete?.name}"? Această acțiune nu poate fi anulată.`}
                confirmText="Da, Șterge"
                type="danger"
            />
        </div>
    );
}
