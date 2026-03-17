/**
 * Forward Contracts & Invoicing Page
 * Implements: Contract Forward (livrare fizică viitoare), Invoice generation,
 * and Tax Engine display (TVA / Taxare Inversă Art. 331).
 */
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, Modal, ConfirmDialog } from '../components/ui';
import { MOCK_FORWARD_CONTRACTS } from '../data/shipments';
import { COMMODITY_MAP } from '../data/listings';
import { formatRON } from '../utils/formatters';
import { forwardContractService } from '../services';

export default function Contracts() {
    const { addToast, addOrder, user } = useApp();
    const [contracts, setContracts] = useState([]);
    const [contractsLoading, setContractsLoading] = useState(true);
    const [showNewContract, setShowNewContract] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [invoiceModal, setInvoiceModal] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);

    // New contract form state
    const [newCommodity, setNewCommodity] = useState('Grâu Panificație');
    const [newQty, setNewQty] = useState(100);
    const [newPrice, setNewPrice] = useState(1200);
    const [newDate, setNewDate] = useState('');
    const [newBuyer, setNewBuyer] = useState('');

    // Load contracts from API on mount
    useEffect(() => {
        forwardContractService.getAll()
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setContracts(data);
                else setContracts(MOCK_FORWARD_CONTRACTS);
            })
            .catch(() => setContracts(MOCK_FORWARD_CONTRACTS))
            .finally(() => setContractsLoading(false));
    }, []);

    const activeContracts = contracts.filter(c => c.status === 'Activ' || c.status === 'ACTIVE');
    const totalForwardValue = activeContracts.reduce((s, c) => s + (c.qty || c.quantity || 0) * (c.price || c.pricePerTon || 0), 0);

    const createContract = async () => {
        if (!newBuyer || !newDate || !newQty || !newPrice) { addToast('Completează toate câmpurile.'); return; }
        const total = newQty * newPrice;
        const deposit = Math.round(total * 0.10);

        try {
            // Try API
            const apiContract = await forwardContractService.create({
                commodityName: newCommodity, buyerName: newBuyer,
                quantity: newQty, pricePerTon: newPrice, deliveryDate: newDate,
            });
            setContracts(prev => [{ ...apiContract, qty: newQty, price: newPrice, buyer: newBuyer, commodity: newCommodity, status: 'Activ', deposit }, ...prev]);
            addToast(`Contract Forward creat pe server! Avans ${formatRON(deposit)} blocat în Escrow.`);
        } catch {
            // Fallback: local
            const newC = { id: `FWD-${Date.now().toString().slice(-7)}`, commodity: newCommodity, qty: newQty, price: newPrice, deliveryDate: newDate, buyer: newBuyer, status: 'Activ', deposit };
            setContracts(prev => [newC, ...prev]);
            addToast(`Contract Forward creat local! Avans de ${formatRON(deposit)} blocat în Escrow.`);
        }
        addOrder({ product: `${newCommodity} Forward (${newQty}t)`, partner: newBuyer, total: deposit });
        setShowNewContract(false);
        setNewBuyer(''); setNewDate('');
    };

    const generateInvoice = async (contract) => {
        const total = (contract.qty || contract.quantity || 0) * (contract.price || contract.pricePerTon || 0);
        try {
            // Try API invoice generation
            const apiInvoice = await forwardContractService.generateInvoice(contract.id);
            setInvoiceModal({ ...contract, ...apiInvoice, total: apiInvoice.subtotal || total, reverseCharge: apiInvoice.reverseChargeVat ?? true, vat: apiInvoice.vatAmount || 0, totalWithVAT: apiInvoice.total || total });
        } catch {
            // Fallback: local generation
            const bothPayVAT = true;
            setInvoiceModal({
                ...contract, total, reverseCharge: bothPayVAT,
                vat: bothPayVAT ? 0 : Math.round(total * 0.19),
                totalWithVAT: bothPayVAT ? total : total + Math.round(total * 0.19),
                invoiceNumber: `FC-${Date.now().toString().slice(-6)}`,
                invoiceDate: new Date().toLocaleDateString('ro-RO'),
            });
        }
    };

    return (
        <div className="page">
            <PageHeader title="Contracte" highlight="Forward & Facturare" showBack backTo="/dashboard">
                <button className="btn btn-gold" style={{ minHeight: 44 }} onClick={() => setShowNewContract(true)}>+ Contract Nou Forward</button>
            </PageHeader>

            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="card"><div className="card-title">Contracte Active</div><div className="card-value gold">{activeContracts.length}</div></div>
                <div className="card"><div className="card-title">Volum Forward</div><div className="card-value">{(totalForwardValue / 1_000_000).toFixed(2)}M <span style={{ fontSize: '1rem' }}>RON</span></div></div>
                <div className="card"><div className="card-title">Avansuri Escrow</div><div className="card-value gold">{formatRON(activeContracts.reduce((s, c) => s + c.deposit, 0))}</div></div>
                <div className="card"><div className="card-title">Proxima Livrare</div><div className="card-value" style={{ fontSize: '1.2rem' }}>{activeContracts[0]?.deliveryDate || '—'}</div></div>
            </div>

            {/* New Contract Form */}
            {showNewContract && (
                <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--gold-primary)' }}>
                    <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>📅 Contract Forward Nou</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Contractele Forward sunt tranzacții bilaterale de livrare fizică (nu instrumente financiare). Avansul de 10% este blocat automat în Escrow PSD2.</p>
                    <div className="grid-2">
                        <div className="form-group"><label className="form-label">Marfă</label><select className="form-select" value={newCommodity} onChange={e => setNewCommodity(e.target.value)} style={{ minHeight: 44 }}>{Object.keys(COMMODITY_MAP).map(c => <option key={c}>{c}</option>)}</select></div>
                        <div className="form-group"><label className="form-label">Partener (Cumpărător)</label><input className="form-input" value={newBuyer} onChange={e => setNewBuyer(e.target.value)} placeholder="SC MORAR SRL" style={{ minHeight: 44 }} /></div>
                        <div className="form-group"><label className="form-label">Cantitate (tone)</label><input className="form-input" type="number" value={newQty} onChange={e => setNewQty(parseInt(e.target.value) || 0)} style={{ minHeight: 44 }} /></div>
                        <div className="form-group"><label className="form-label">Preț Fixat (RON/t)</label><input className="form-input" type="number" value={newPrice} onChange={e => setNewPrice(parseInt(e.target.value) || 0)} style={{ minHeight: 44 }} /></div>
                        <div className="form-group"><label className="form-label">Data Livrării</label><input className="form-input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ minHeight: 44 }} /></div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avans Escrow (10%)</div>
                                <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '1.1rem' }}>{formatRON(Math.round(newQty * newPrice * 0.10))}</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button className="btn btn-gold" style={{ minHeight: 44 }} onClick={createContract}>Creează Contract</button>
                        <button className="btn btn-outline" style={{ minHeight: 44 }} onClick={() => setShowNewContract(false)}>Anulează</button>
                    </div>
                </div>
            )}

            {/* Contracts Table */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>ID</th><th>Marfă</th><th>Cantitate</th><th>Preț Fixat</th><th>Valoare</th><th>Livrare</th><th>Cumpărător</th><th>Status</th><th>Acțiuni</th></tr></thead>
                        <tbody>
                            {contracts.map(c => (
                                <tr key={c.id} style={{ cursor: 'pointer', background: selectedContract?.id === c.id ? 'var(--bg-card)' : 'transparent' }} onClick={() => setSelectedContract(c)}>
                                    <td style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>{c.id}</td>
                                    <td>{c.commodity}</td>
                                    <td>{c.qty}t</td>
                                    <td>{c.price.toLocaleString()} RON/t</td>
                                    <td style={{ fontWeight: 600 }}>{formatRON(c.qty * c.price)}</td>
                                    <td>{c.deliveryDate}</td>
                                    <td>{c.buyer}</td>
                                    <td><span className={`badge ${c.status === 'Activ' ? 'badge-green' : 'badge-gold'}`}>{c.status}</span></td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={e => { e.stopPropagation(); generateInvoice(c); }}>📄 Factură</button>
                                        {c.status === 'Activ' && (
                                            <button className="btn btn-green" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }} onClick={e => {
                                                e.stopPropagation();
                                                setConfirmAction({ title: 'Confirmă Livrarea?', message: `Confirmi livrarea pentru contractul ${c.id}? Fondurile Escrow vor fi eliberate.`, onConfirm: () => { setContracts(prev => prev.map(x => x.id === c.id ? { ...x, status: 'Livrat' } : x)); addToast(`Contract ${c.id} — Livrare confirmată!`); }, type: 'success', confirmText: 'Confirmă' });
                                            }}>✓ Livrat</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Contract Detail */}
            {selectedContract && (
                <div className="card" style={{ marginTop: '1.5rem' }}>
                    <div className="card-title">Detalii Contract — {selectedContract.id}</div>
                    <div className="grid-2" style={{ marginTop: '1rem' }}>
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Marfă</span><span style={{ fontWeight: 600 }}>{selectedContract.commodity}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Cantitate</span><span>{selectedContract.qty} tone</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Preț Fixat</span><span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>{selectedContract.price.toLocaleString()} RON/t</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Data Livrării</span><span>{selectedContract.deliveryDate}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Cumpărător</span><span>{selectedContract.buyer}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Status</span><span className={`badge ${selectedContract.status === 'Activ' ? 'badge-green' : 'badge-gold'}`}>{selectedContract.status}</span></div>
                            </div>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>Escrow & Plăți</h4>
                            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Valoare Totală</span><span style={{ fontWeight: 600 }}>{formatRON(selectedContract.qty * selectedContract.price)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Avans Escrow (10%)</span><span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>{formatRON(selectedContract.deposit)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Rest la Livrare</span><span style={{ fontWeight: 600 }}>{formatRON(selectedContract.qty * selectedContract.price - selectedContract.deposit)}</span></div>
                                <hr style={{ borderColor: 'var(--glass-border)', margin: '0.75rem 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Regim TVA</span><span className="badge badge-green">Taxare Inversă — Art. 331</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Invoice Modal */}
            <Modal isOpen={!!invoiceModal} onClose={() => setInvoiceModal(null)} title="📄 Factură Proformă" width={600}>
                {invoiceModal && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--gold-primary)' }}>FACTURĂ PROFORMĂ</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nr: {invoiceModal.invoiceNumber}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Data: {invoiceModal.invoiceDate}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 600 }}>AgriConnect SRL</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CUI: RO44556677 • CAEN 4611</div>
                            </div>
                        </div>

                        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Furnizor</div>
                                <div style={{ fontWeight: 600 }}>{user?.companyName || 'SC AGRO ION SRL'}</div>
                            </div>
                            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Client</div>
                                <div style={{ fontWeight: 600 }}>{invoiceModal.buyer}</div>
                            </div>
                        </div>

                        <table style={{ marginBottom: '1rem' }}>
                            <thead><tr><th>Descriere</th><th>Cantitate</th><th>Preț unit.</th><th>Total</th></tr></thead>
                            <tbody>
                                <tr>
                                    <td>{invoiceModal.commodity} — Contract {invoiceModal.id}</td>
                                    <td>{invoiceModal.qty} t</td>
                                    <td>{invoiceModal.price.toLocaleString()} RON</td>
                                    <td style={{ fontWeight: 600 }}>{formatRON(invoiceModal.total)}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>{formatRON(invoiceModal.total)}</span></div>
                            {invoiceModal.reverseCharge ? (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>TVA (19%)</span><span className="badge badge-green">TAXARE INVERSĂ — Art. 331 CF</span></div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ambii parteneri sunt plătitori de TVA (Art. 331 Cod Fiscal). TVA se colectează de cumpărător.</div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>TVA (19%)</span><span>{formatRON(invoiceModal.vat)}</span></div>
                            )}
                            <hr style={{ borderColor: 'var(--glass-border)', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600 }}>TOTAL DE PLATĂ</span><span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '1.2rem' }}>{formatRON(invoiceModal.totalWithVAT)}</span></div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-gold" style={{ flex: 1, justifyContent: 'center', minHeight: 44 }} onClick={() => { addToast('Factura a fost descărcată (PDF simulat).'); setInvoiceModal(null); }}>📥 Descarcă PDF</button>
                            <button className="btn btn-outline" style={{ minHeight: 44 }} onClick={() => setInvoiceModal(null)}>Închide</button>
                        </div>
                    </div>
                )}
            </Modal>

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
