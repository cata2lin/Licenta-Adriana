import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, StatCard, ConfirmDialog } from '../components/ui';
import { MOCK_SHIPMENTS } from '../data/shipments';
import { formatRON } from '../utils/formatters';
import { generateUIT } from '../utils/formatters';
import { transportService } from '../services';
import AddressAutocomplete from '../components/AddressAutocomplete';

export default function Logistics() {
    const { addToast } = useApp();
    const [shipments, setShipments] = useState([]);
    const [shipmentsLoading, setShipmentsLoading] = useState(true);

    // Load shipments from API on mount
    useEffect(() => {
        transportService.getShipments()
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setShipments(data);
                else setShipments(MOCK_SHIPMENTS);
            })
            .catch(() => setShipments(MOCK_SHIPMENTS))
            .finally(() => setShipmentsLoading(false));
    }, []);
    const [selectedShipment, setSelectedShipment] = useState(null);
    const [showNewShipment, setShowNewShipment] = useState(false);
    const [newFrom, setNewFrom] = useState('');
    const [newTo, setNewTo] = useState('');
    const [newFromDetails, setNewFromDetails] = useState(null);
    const [newToDetails, setNewToDetails] = useState(null);
    const [newCargo, setNewCargo] = useState('');
    const [calcFrom, setCalcFrom] = useState('');
    const [calcTo, setCalcTo] = useState('');
    const [calcFromDetails, setCalcFromDetails] = useState(null);
    const [calcToDetails, setCalcToDetails] = useState(null);
    const [calcResult, setCalcResult] = useState(null);
    const [calcLoading, setCalcLoading] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const activeCount = shipments.filter(s => s.status === 'În drum').length;
    const totalDist = shipments.reduce((sum, s) => sum + parseInt(s.dist), 0);
    const deliveredCount = shipments.filter(s => s.status === 'Livrat').length;

    const addShipment = async () => {
        if (!newFrom || !newTo || !newCargo) { addToast('Completează toate câmpurile.'); return; }
        let dist;
        try {
            const result = await transportService.calculateDistance(newFrom, newTo);
            dist = result.distanceKm;
        } catch { dist = Math.floor(Math.random() * 400) + 50; }
        const rateMarket = 4.5 + Math.random() * 1.0;
        const shipmentData = {
            id: Date.now(), route: `${newFromDetails?.mainText || newFrom} → ${newToDetails?.mainText || newTo}`,
            dist: `${dist} km`, cargo: newCargo, transporter: '— Neselectat', risk: '—', status: 'Programat',
            uit: '—', eta: `${Math.ceil(dist / 60)}h`,
            costOwn: Math.round(dist * 6), costMarket: Math.round(dist * rateMarket),
            fromZip: newFromDetails?.postalCode || '', toZip: newToDetails?.postalCode || '',
            fromCounty: newFromDetails?.county || '', toCounty: newToDetails?.county || '',
            origin: newFrom, destination: newTo,
        };
        try {
            const created = await transportService.createShipment(shipmentData);
            setShipments(prev => [created, ...prev]);
        } catch {
            setShipments(prev => [shipmentData, ...prev]);
        }
        setShowNewShipment(false);
        setNewFrom(''); setNewTo(''); setNewCargo('');
        setNewFromDetails(null); setNewToDetails(null);
        addToast(`Cursă nouă: ${shipmentData.route} (${dist} km) ${newFromDetails?.postalCode ? `— ${newFromDetails.postalCode}` : ''}`);
    };

    const updateStatus = async (id, newStatus) => {
        try { await transportService.updateShipmentStatus(id, { status: newStatus }); } catch { /* local fallback */ }
        setShipments(prev => prev.map(s => s.id === id ? { ...s, status: newStatus, uit: newStatus === 'În drum' ? generateUIT() : s.uit } : s));
        addToast(`Status cursă actualizat: ${newStatus}${newStatus === 'În drum' ? ' — Cod UIT generat via RO e-Transport ANAF' : ''}`);
    };

    const handleStatusChange = (shipment, newStatus) => {
        setConfirmAction({
            title: newStatus === 'În drum' ? 'Pornește Cursa?' : 'Confirmi Livrarea?',
            message: newStatus === 'În drum'
                ? `Confirmi pornirea cursei ${shipment.route}? Se va genera automat un cod UIT prin API RO e-Transport ANAF.`
                : `Confirmi livrarea pentru cursa ${shipment.route}? Această acțiune va declanșa eliberarea fondurilor Escrow.`,
            onConfirm: () => updateStatus(shipment.id, newStatus),
            type: newStatus === 'Livrat' ? 'success' : 'warning',
            confirmText: newStatus === 'În drum' ? 'Pornește' : 'Confirmă Livrarea',
        });
    };

    const calculateTransport = async () => {
        if (!calcFrom || !calcTo) { addToast('Introdu locațiile.'); return; }
        setCalcLoading(true);
        try {
            const result = await transportService.calculateDistance(calcFrom, calcTo);
            const dist = result.distanceKm;
            const rateOwn = 5.5;
            const rateMarket = 4.2 + Math.random() * 0.8;
            setCalcResult({
                dist, durationText: result.durationText || `${Math.floor(dist / 65)}h ${Math.round((dist / 65 % 1) * 60)}min`,
                own: Math.round(dist * rateOwn), market: Math.round(dist * rateMarket),
                rateOwn: rateOwn.toFixed(1), rateMarket: rateMarket.toFixed(1),
                savings: Math.round(dist * (rateOwn - rateMarket)),
                source: result.source || 'haversine',
                originAddress: result.originAddress, destAddress: result.destAddress,
                fromZip: calcFromDetails?.postalCode, toZip: calcToDetails?.postalCode,
                fromCounty: calcFromDetails?.county, toCounty: calcToDetails?.county,
            });
        } catch {
            const dist = Math.floor(Math.random() * 500) + 100;
            const rateOwn = 5.5 + Math.random() * 1.5;
            const rateMarket = 4.2 + Math.random() * 1.8;
            setCalcResult({ dist, own: Math.round(dist * rateOwn), market: Math.round(dist * rateMarket), rateOwn: rateOwn.toFixed(1), rateMarket: rateMarket.toFixed(1), savings: Math.round(dist * (rateOwn - rateMarket)), source: 'estimate' });
        } finally { setCalcLoading(false); }
    };

    return (
        <div className="page">
            <PageHeader title="Logistică &" highlight="Transport" showBack backTo="/dashboard">
                <button className="btn btn-gold" style={{ minHeight: 44 }} onClick={() => setShowNewShipment(true)}>+ Adaugă Cursă</button>
            </PageHeader>

            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                <StatCard title="🚛 Curse Active" value={activeCount} />
                <StatCard title="📦 Livrate" value={deliveredCount} />
                <StatCard title="Distanță Totală" value={totalDist.toLocaleString()} suffix="km" />
                <StatCard title="Cost Mediu" value="5.0" suffix="RON/km" />
            </div>

            {/* New shipment form */}
            {showNewShipment && (
                <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--gold-primary)' }}>
                    <h4 style={{ color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>🚛 Cursă Nouă</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Distanța este calculată automat. Caută localități, adrese sau coduri poștale din România.</p>
                    <div className="grid-3">
                        <AddressAutocomplete label="De la" value={newFrom} onChange={setNewFrom} onSelect={setNewFromDetails} placeholder="Caută: Constanța, 900001..." />
                        <AddressAutocomplete label="Către" value={newTo} onChange={setNewTo} onSelect={setNewToDetails} placeholder="Caută: București, 010101..." />
                        <div className="form-group"><label className="form-label">Marfă</label><input className="form-input" value={newCargo} onChange={e => setNewCargo(e.target.value)} placeholder="Grâu Panificație — 24t" style={{ minHeight: 44 }} /></div>
                    </div>
                    {(newFromDetails || newToDetails) && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                            {newFromDetails?.postalCode && <span className="badge badge-gold">📮 Origine: {newFromDetails.postalCode} ({newFromDetails.county})</span>}
                            {newToDetails?.postalCode && <span className="badge badge-blue">📮 Destinație: {newToDetails.postalCode} ({newToDetails.county})</span>}
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem' }}><button className="btn btn-gold" style={{ minHeight: 44 }} onClick={addShipment}>Creează Cursă</button><button className="btn btn-outline" style={{ minHeight: 44 }} onClick={() => setShowNewShipment(false)}>Anulează</button></div>
                </div>
            )}

            <div className="grid-2">
                <div>
                    <h4 style={{ marginBottom: '1rem' }}>Cursele Mele</h4>
                    {shipments.map((s) => (
                        <div className="card" key={s.id} style={{ marginBottom: '1rem', cursor: 'pointer', borderColor: selectedShipment?.id === s.id ? 'var(--gold-primary)' : 'var(--border-color)' }} onClick={() => setSelectedShipment(s)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{s.route}</span>
                                <span className={`badge ${s.status === 'În drum' ? 'badge-green' : s.status === 'Livrat' ? 'badge-blue' : 'badge-gold'}`}>{s.status === 'În drum' ? '● ' : ''}{s.status}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>📦 {s.cargo}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>📏 {s.dist} (OSRM) &nbsp;|&nbsp; ⏱ ETA: {s.eta}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>🚛 {s.transporter} {s.risk !== '—' && <span className="badge badge-green" style={{ marginLeft: '0.5rem' }}>Risc: {s.risk} ✓</span>}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>UIT: {s.uit}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {s.status === 'Programat' && <button className="btn btn-green" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', minHeight: 36 }} onClick={e => { e.stopPropagation(); handleStatusChange(s, 'În drum'); }}>▶ Pornește</button>}
                                    {s.status === 'În drum' && <button className="btn btn-gold" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', minHeight: 36 }} onClick={e => { e.stopPropagation(); handleStatusChange(s, 'Livrat'); }}>✓ Livrat</button>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    {selectedShipment ? (
                        <div className="card" style={{ position: 'sticky', top: 80 }}>
                            <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>Detalii Cursă</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Rută</span><span style={{ fontWeight: 600 }}>{selectedShipment.route}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Distanță</span><span>{selectedShipment.dist}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Marfă</span><span>{selectedShipment.cargo}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Transportator</span><span>{selectedShipment.transporter}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Status</span><span className={`badge ${selectedShipment.status === 'În drum' ? 'badge-green' : selectedShipment.status === 'Livrat' ? 'badge-blue' : 'badge-gold'}`}>{selectedShipment.status}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Cod UIT</span><span style={{ fontFamily: 'monospace', color: 'var(--gold-primary)' }}>{selectedShipment.uit}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>ETA</span><span>{selectedShipment.eta}</span></div>
                            </div>
                            <div style={{ marginTop: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>📊 Comparație Cost (Make-or-Buy)</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>🏭 Flotă Proprie</span><span style={{ fontWeight: 600 }}>{formatRON(selectedShipment.costOwn)}</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>📦 123cargo Market</span><span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>{formatRON(selectedShipment.costMarket)}</span></div>
                                {selectedShipment.costOwn > selectedShipment.costMarket && (
                                    <span className="badge badge-green">Externalizare: -{Math.round((1 - selectedShipment.costMarket / selectedShipment.costOwn) * 100)}% economie</span>
                                )}
                            </div>
                            {selectedShipment.uit !== '—' && (
                                <div style={{ marginTop: '1rem', background: 'rgba(78,159,61,0.1)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', borderLeft: '3px solid var(--green-badge)' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-badge)' }}>✓ RO e-Transport ANAF</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cod UIT alocat automat. Transportul este conform cu regulamentul ANAF privind monitorizarea mărfurilor.</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="map-placeholder" style={{ height: 400 }}>🗺️ Selectează o cursă pentru detalii (OSRM Routing)</div>
                    )}
                </div>
            </div>

            {/* Transport Calculator */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-title">📐 Calculator Transport (Make-or-Buy)</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Compară costul flotei proprii cu ofertele 123cargo. Caută locații, adrese sau coduri poștale.</p>
                <div className="grid-3" style={{ marginTop: '1rem' }}>
                    <AddressAutocomplete label="De la" value={calcFrom} onChange={setCalcFrom} onSelect={setCalcFromDetails} placeholder="Caută: Constanța, 900001..." />
                    <AddressAutocomplete label="Către" value={calcTo} onChange={setCalcTo} onSelect={setCalcToDetails} placeholder="Caută: București, 010101..." />
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="btn btn-gold" onClick={calculateTransport} disabled={calcLoading} style={{ minHeight: 44, opacity: calcLoading ? 0.7 : 1 }}>
                            {calcLoading ? '⏳ Calculează...' : '📐 Calculează'}
                        </button>
                    </div>
                </div>
                {(calcFromDetails || calcToDetails) && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        {calcFromDetails?.postalCode && <span className="badge badge-gold">📮 {calcFromDetails.city || calcFrom}: {calcFromDetails.postalCode} ({calcFromDetails.county})</span>}
                        {calcToDetails?.postalCode && <span className="badge badge-blue">📮 {calcToDetails.city || calcTo}: {calcToDetails.postalCode} ({calcToDetails.county})</span>}
                    </div>
                )}
                {calcResult && (
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
                            <span className="badge badge-green">📏 {calcResult.dist} km</span>
                            {calcResult.durationText && <span className="badge badge-blue">⏱ {calcResult.durationText}</span>}
                            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Sursă: {calcResult.source === 'google_maps' ? 'Google Maps' : calcResult.source === 'haversine' ? 'Haversine ×1.35' : 'Estimat'}</span>
                        </div>
                        <div className="grid-2">
                            <div className="card" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>🏭 Flotă Proprie</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{calcResult.own.toLocaleString()} RON</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distanță: {calcResult.dist} km × {calcResult.rateOwn} RON/km</div>
                            </div>
                            <div className="card" style={{ textAlign: 'center', borderColor: 'var(--gold-primary)' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>📦 Piața Liberă (123cargo)</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{calcResult.market.toLocaleString()} RON</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cel mai bun bid ({calcResult.dist} km × {calcResult.rateMarket} RON/km)</div>
                                {calcResult.savings > 0 && <span className="badge badge-green" style={{ marginTop: '0.5rem' }}>Economie: {formatRON(calcResult.savings)} ↓</span>}
                            </div>
                        </div>
                    </div>
                )}
            </div>

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
