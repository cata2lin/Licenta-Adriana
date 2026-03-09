import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader, Modal } from '../components/ui';
import { COMMODITY_TYPES } from '../data/listings';
import { formatRON } from '../utils/formatters';
import { tradingService } from '../services';


export default function Market() {
    const { listings: contextListings, addOrder, user, addToast } = useApp();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [detailItem, setDetailItem] = useState(null);
    const [negotiateItem, setNegotiateItem] = useState(null);
    const [offerPrice, setOfferPrice] = useState('');
    const [apiListings, setApiListings] = useState(null);
    const [commodities, setCommodities] = useState([]);

    // Try loading from API on mount
    useEffect(() => {
        tradingService.getCommodities()
            .then(data => setCommodities(data || []))
            .catch(() => { }); // Fallback: COMMODITY_TYPES from data/listings
        tradingService.searchListings({ page: 1, limit: 50 })
            .then(data => setApiListings(data?.listings || null))
            .catch(() => { }); // Fallback: context listings
    }, []);

    // Use API listings if available, otherwise context
    const listings = apiListings || contextListings;
    const commodityCategories = commodities.length > 0
        ? [...new Set(commodities.map(c => c.category))]
        : COMMODITY_TYPES;


    const filtered = listings.filter(l => {
        if (search) {
            const q = search.toLowerCase();
            if (!l.name.toLowerCase().includes(q) && !l.seller.toLowerCase().includes(q) && !l.loc?.toLowerCase().includes(q)) return false;
        }
        if (typeFilter && l.type !== typeFilter) return false;
        return true;
    }).sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'qty') return b.qty - a.qty;
        return 0;
    });

    const openNegotiate = (listing) => {
        if (!user) { addToast('Trebuie să te autentifici pentru a negocia.'); return; }
        setDetailItem(null);
        setNegotiateItem(listing);
        setOfferPrice(listing.price.toString());
    };

    const submitOffer = () => {
        if (!negotiateItem) return;
        addOrder({ product: `${negotiateItem.name} (${negotiateItem.qty}t)`, partner: negotiateItem.seller, total: parseInt(offerPrice) * negotiateItem.qty });
        setNegotiateItem(null);
    };

    return (
        <div className="page">
            <PageHeader title="Piața" highlight="Spot">
                {user && <Link to="/create-listing"><button className="btn btn-gold" style={{ fontSize: '0.85rem', minHeight: 44 }}>+ Adaugă Ofertă</button></Link>}
            </PageHeader>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <input className="form-input" style={{ maxWidth: 260, minHeight: 44 }} placeholder="🔍 Caută marfă, firmă sau locație..." value={search} onChange={e => setSearch(e.target.value)} />
                <select className="form-select" style={{ maxWidth: 180, minHeight: 44 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option value="">Toate Mărfurile</option>
                    {commodityCategories.map(t => <option key={t}>{t}</option>)}
                </select>
                <select className="form-select" style={{ maxWidth: 150, minHeight: 44 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="">Sortare</option>
                    <option value="price_asc">Preț ↑</option>
                    <option value="price_desc">Preț ↓</option>
                    <option value="qty">Cantitate ↓</option>
                </select>
                <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem', alignSelf: 'center' }}>{filtered.length} oferte</div>
            </div>

            {filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Nicio ofertă găsită.</p>
                    <p style={{ color: 'var(--text-muted)' }}>Modifică filtrele sau <Link to="/create-listing">adaugă o ofertă nouă</Link>.</p>
                </div>
            ) : (
                <div className="grid-3">
                    {filtered.map(l => (
                        <div className="listing-card" key={l.id}>
                            <div className="listing-header">
                                <div className="listing-name">{l.name}</div>
                                <div className="listing-price">{l.price.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RON/t</span></div>
                            </div>
                            <div className="listing-meta">
                                {l.protein > 0 && <span className="badge badge-blue">Proteină: {l.protein}%</span>}
                                <span className="badge badge-gold">Umiditate: {l.moisture}%</span>
                                {l.hectoliter > 0 && <span className="badge badge-green">MH: {l.hectoliter} kg/hl</span>}
                            </div>
                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{l.qty} tone disponibile</div>
                            <div className="listing-seller">🏢 {l.seller} — ⭐ {l.rating} &nbsp;|&nbsp; 📍 {l.loc} ({l.dist})</div>
                            <div className="listing-actions">
                                <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', minHeight: 44 }} onClick={() => setDetailItem(l)}>📋 Detalii</button>
                                <button className="btn btn-gold" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem', minHeight: 44 }} onClick={() => openNegotiate(l)}>💰 Negociază</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title={detailItem?.name} width={600}>
                {detailItem && (
                    <>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '-0.5rem', marginBottom: '1.5rem' }}>🏢 {detailItem.seller} — ⭐ {detailItem.rating}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {[['Cantitate', `${detailItem.qty} tone`], ['Locație', `📍 ${detailItem.loc} (${detailItem.dist})`], ['Cod NC', detailItem.ncCode || '—'], ['Standard', detailItem.standard || '—']].map(([label, val]) => (
                                <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '0.75rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
                                    <div style={{ fontWeight: 600 }}>{val}</div>
                                </div>
                            ))}
                        </div>
                        <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>Parametri Biochimici</h4>
                        <table style={{ marginBottom: '1.5rem' }}>
                            <thead><tr><th>Parametru</th><th>Valoare</th><th>Conform</th></tr></thead>
                            <tbody>
                                {detailItem.protein > 0 && <tr><td>Proteină</td><td>{detailItem.protein}%</td><td><span className="badge badge-green">✓</span></td></tr>}
                                <tr><td>Umiditate</td><td>{detailItem.moisture}%</td><td><span className={`badge ${detailItem.moisture <= 14 ? 'badge-green' : 'badge-gold'}`}>{detailItem.moisture <= 14 ? '✓' : '⚠'}</span></td></tr>
                                {detailItem.hectoliter > 0 && <tr><td>Masă Hectolitrică</td><td>{detailItem.hectoliter} kg/hl</td><td><span className="badge badge-green">✓</span></td></tr>}
                                {detailItem.foreignBodies > 0 && <tr><td>Corpuri Străine</td><td>{detailItem.foreignBodies}%</td><td><span className={`badge ${detailItem.foreignBodies <= 2 ? 'badge-green' : 'badge-red'}`}>{detailItem.foreignBodies <= 2 ? '✓' : '❌'}</span></td></tr>}
                                {detailItem.fallIndex > 0 && <tr><td>Indice de Cădere</td><td>{detailItem.fallIndex}s</td><td><span className="badge badge-green">✓</span></td></tr>}
                            </tbody>
                        </table>
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Valoare Totală</span><span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '1.1rem' }}>{formatRON(detailItem.qty * detailItem.price)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Comision Platf. (2%)</span><span style={{ color: 'var(--text-muted)' }}>{formatRON(Math.round(detailItem.qty * detailItem.price * 0.02))}</span></div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-gold" style={{ flex: 1, justifyContent: 'center', minHeight: 44 }} onClick={() => openNegotiate(detailItem)}>💰 Negociază Prețul</button>
                            <button className="btn btn-outline" style={{ minHeight: 44 }} onClick={() => setDetailItem(null)}>Închide</button>
                        </div>
                    </>
                )}
            </Modal>

            {/* Negotiate Modal */}
            <Modal isOpen={!!negotiateItem} onClose={() => setNegotiateItem(null)} title={`💰 Negociază — ${negotiateItem?.name}`} width={500}>
                {negotiateItem && (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Vânzător</span><span>{negotiateItem.seller}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Cantitate</span><span>{negotiateItem.qty} tone</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Preț listat</span><span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>{negotiateItem.price.toLocaleString()} RON/t</span></div>
                        </div>
                        <div className="form-group"><label className="form-label">Oferta ta (RON/tonă)</label><input className="form-input" type="number" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} style={{ minHeight: 44, fontSize: '1.1rem' }} /></div>
                        {parseInt(offerPrice) < negotiateItem.price && parseInt(offerPrice) > 0 && <div style={{ fontSize: '0.85rem', color: 'var(--green-badge)', marginBottom: '0.5rem' }}>📉 Reducere de {((1 - parseInt(offerPrice) / negotiateItem.price) * 100).toFixed(1)}% față de prețul listat</div>}
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Total Estimat</span><span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '1.2rem' }}>{formatRON(parseInt(offerPrice || 0) * negotiateItem.qty)}</span></div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>🛡️ Fondurile vor fi blocate în Escrow PSD2 până la confirmarea recepției</div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-gold" style={{ flex: 1, justifyContent: 'center', minHeight: 44 }} onClick={submitOffer}>Trimite Oferta</button>
                            <button className="btn btn-outline" style={{ minHeight: 44 }} onClick={() => setNegotiateItem(null)}>Anulează</button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}
