import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, ConfirmDialog } from '../components/ui';
import { formatRON } from '../utils/formatters';
import { financialService } from '../services';

const TAB_FILTERS = {
    'Toate': () => true,
    'Active': o => o.escrowType === 'gold',
    'În Tranzit': o => o.delivery === 'În drum',
    'Finalizate': o => o.escrowType === 'green',
    'Dispute': o => o.escrowType === 'red',
};

export default function Orders() {
    const { orders, updateOrderStatus } = useApp();
    const [activeTab, setActiveTab] = useState('Toate');
    const [selectedOrder, setSelectedOrder] = useState(orders[0]?.id || null);
    const [confirmAction, setConfirmAction] = useState(null);

    const filtered = orders.filter(TAB_FILTERS[activeTab] || (() => true));
    const selected = orders.find(o => o.id === selectedOrder);

    const handleConfirmReception = () => {
        setConfirmAction({
            title: 'Confirmă Recepția?',
            message: `Confirmi că ai recepționat marfa pentru comanda #${selected?.id}? Fondurile Escrow vor fi eliberate către vânzător.`,
            onConfirm: () => updateOrderStatus(selected.id, 'Livrat', 'Eliberat'),
            type: 'success',
            confirmText: 'Da, Confirmă',
        });
    };

    return (
        <div className="page">
            <PageHeader title="Comenzile" highlight="Mele" showBack backTo="/dashboard" />

            <div className="tabs">
                {Object.keys(TAB_FILTERS).map(t => (
                    <div key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}>
                        {t} {t !== 'Toate' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>({orders.filter(TAB_FILTERS[t]).length})</span>}
                    </div>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Nicio comandă în această categorie.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>ID</th><th>Marfa</th><th>Partener</th><th>Total</th><th>Escrow</th><th>Livrare</th><th>UIT</th><th></th></tr></thead>
                            <tbody>
                                {filtered.map(o => (
                                    <tr key={o.id} style={{ cursor: 'pointer', background: selectedOrder === o.id ? 'var(--bg-card)' : 'transparent' }} onClick={() => setSelectedOrder(o.id)}>
                                        <td style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>#{o.id}</td>
                                        <td>{o.product}</td>
                                        <td>{o.partner}</td>
                                        <td style={{ fontWeight: 600 }}>{formatRON(o.total)}</td>
                                        <td><span className={`badge badge-${o.escrowType}`}>{o.escrow}</span></td>
                                        <td>{o.delivery}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.uit}</td>
                                        <td>{o.escrowType === 'red' && <Link to="/disputes"><button className="btn btn-red-outline" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>Dispută</button></Link>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selected && (
                <div className="card" style={{ marginTop: '2rem' }}>
                    <div className="card-title">Detalii Contract — #{selected.id}</div>
                    <div className="grid-2" style={{ marginTop: '1rem' }}>
                        <div>
                            <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>Timeline Comandă</h4>
                            <div className="timeline">
                                {(selected.timeline?.length ? selected.timeline : [
                                    { text: 'Contract creat', time: '—', done: true },
                                    { text: 'Escrow — Fonduri depuse', time: '—', done: selected.escrow === 'Fonduri Blocate' || selected.escrowType !== 'gold' },
                                    { text: 'Livrare & Recepție', time: '—', done: selected.delivery === 'Livrat' },
                                    { text: 'Split Payment eliberat', time: '—', done: selected.escrowType === 'green' },
                                ]).map((t, i) => (
                                    <div className={`timeline-item ${t.done ? 'active' : ''}`} key={i}>
                                        <div className="timeline-text">{t.text}</div>
                                        <div className="timeline-time">{t.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>Escrow Breakdown (Split Payment)</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Suma Vânzător (95%)</span><span style={{ fontWeight: 600 }}>{formatRON(selected.sellerAmount)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Cost Transport (3%)</span><span style={{ fontWeight: 600 }}>{formatRON(selected.transportAmount)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Comision Platformă (2%)</span><span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>{formatRON(selected.platformFee)}</span></div>
                                <hr style={{ borderColor: 'var(--glass-border)' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600 }}>Total Escrow</span><span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>{formatRON(selected.total)}</span></div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                                {selected.escrowType !== 'green' && (
                                    <button className="btn btn-green" style={{ minHeight: 44 }} onClick={handleConfirmReception}>✓ Confirmă Recepția</button>
                                )}
                                {selected.escrowType !== 'red' && selected.escrowType !== 'green' && (
                                    <Link to="/disputes"><button className="btn btn-red-outline" style={{ minHeight: 44 }}>⚠ Deschide Dispută</button></Link>
                                )}
                                {selected.escrowType === 'green' && (
                                    <span className="badge badge-green" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>✓ Plată eliberată cu succes</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => { confirmAction?.onConfirm(); setConfirmAction(null); }}
                title={confirmAction?.title}
                message={confirmAction?.message}
                confirmText={confirmAction?.confirmText}
                type={confirmAction?.type || 'warning'}
            />
        </div>
    );
}
