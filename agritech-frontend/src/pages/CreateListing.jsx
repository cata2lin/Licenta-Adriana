import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui';
import { COMMODITY_MAP } from '../data/listings';
import { formatRON } from '../utils/formatters';
import { tradingService } from '../services';


export default function CreateListing() {
    const { addListing, user, addToast } = useApp();
    const navigate = useNavigate();
    const [commodity, setCommodity] = useState('Grâu Panificație');
    const [protein, setProtein] = useState(14.2);
    const [moisture, setMoisture] = useState(12.8);
    const [hectoliter, setHectoliter] = useState(78.5);
    const [foreignBodies, setForeignBodies] = useState(1.2);
    const [fallIndex, setFallIndex] = useState(280);
    const [qty, setQty] = useState(120);
    const [price, setPrice] = useState(1250);
    const [location, setLocation] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [apiCommodities, setApiCommodities] = useState([]);

    // Load commodities from API
    useEffect(() => {
        tradingService.getCommodities()
            .then(data => setApiCommodities(data || []))
            .catch(() => { }); // Fallback to COMMODITY_MAP
    }, []);

    // Build commodity options from API or fallback
    const commodityOptions = apiCommodities.length > 0
        ? apiCommodities.reduce((acc, c) => ({ ...acc, [c.name]: { ncCode: c.ncCode, standard: c.standardRef, type: c.category } }), {})
        : COMMODITY_MAP;

    const meta = commodityOptions[commodity] || { ncCode: '—', standard: '—', type: '—' };

    const handlePublish = (e) => {
        e.preventDefault();
        if (!user) { addToast('Trebuie să te autentifici mai întâi.'); navigate('/login'); return; }
        if (!qty || !price) { addToast('Completează cantitatea și prețul.'); return; }
        addListing({ name: `${commodity} Clasa A`, type: meta.type, protein, moisture, hectoliter, foreignBodies, fallIndex, qty, price, location, ncCode: meta.ncCode, standard: meta.standard });
        navigate('/market');
    };

    const sliders = [
        ['Proteină (%)', protein, setProtein, 0, 30],
        ['Umiditate (%)', moisture, setMoisture, 0, 25],
        ['Masă Hectolitrică (kg/hl)', hectoliter, setHectoliter, 50, 90],
        ['Corpuri Străine (%)', foreignBodies, setForeignBodies, 0, 10],
        ['Indice de Cădere (s)', fallIndex, setFallIndex, 0, 400],
    ];

    return (
        <div className="page" style={{ maxWidth: 800 }}>
            <PageHeader title="Adaugă" highlight="Ofertă Nouă" showBack backTo="/market" />

            <form onSubmit={handlePublish}>
                <div className="card">
                    <h3 style={{ color: 'var(--gold-primary)', marginBottom: '1.5rem' }}>Detalii Marfă</h3>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Tip Marfă</label>
                            <select className="form-select" value={commodity} onChange={e => setCommodity(e.target.value)} style={{ minHeight: 44 }}>
                                {Object.keys(commodityOptions).map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cod NC <span className="badge badge-gold" style={{ marginLeft: '0.5rem' }}>Auto</span></label>
                            <input className="form-input" value={meta.ncCode} readOnly style={{ color: 'var(--gold-primary)', minHeight: 44 }} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Standard Calitate</label>
                        <input className="form-input" value={meta.standard} readOnly style={{ color: 'var(--text-muted)', minHeight: 44 }} />
                    </div>

                    <h3 style={{ color: 'var(--gold-primary)', margin: '2rem 0 1.5rem' }}>Parametri Biochimici</h3>
                    {sliders.map(([label, val, setter, min, max]) => (
                        <div className="form-group" key={label}>
                            <label className="form-label">{label}</label>
                            <div className="slider-group">
                                <input type="range" min={min} max={max} value={val} step="0.1" onChange={e => setter(parseFloat(e.target.value))} style={{ height: 8 }} />
                                <span className="slider-value">{val}</span>
                            </div>
                        </div>
                    ))}

                    <h3 style={{ color: 'var(--gold-primary)', margin: '2rem 0 1.5rem' }}>Ofertă Comercială</h3>
                    <div className="grid-2">
                        <div className="form-group"><label className="form-label">Cantitate (tone)</label><input className="form-input" type="number" value={qty} onChange={e => setQty(parseInt(e.target.value) || 0)} required style={{ minHeight: 44 }} /></div>
                        <div className="form-group"><label className="form-label">Preț/Tonă (RON)</label><input className="form-input" type="number" value={price} onChange={e => setPrice(parseInt(e.target.value) || 0)} required style={{ minHeight: 44 }} /></div>
                        <div className="form-group"><label className="form-label">Disponibil de la</label><input className="form-input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ minHeight: 44 }} /></div>
                        <div className="form-group"><label className="form-label">Disponibil până la</label><input className="form-input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ minHeight: 44 }} /></div>
                    </div>
                    <div className="form-group"><label className="form-label">Locație Depozit / Siloz</label><input className="form-input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Constanța, Str. Portului Nr. 12" style={{ minHeight: 44 }} /></div>

                    {qty > 0 && price > 0 && (
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', margin: '1.5rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Valoare Totală Ofertă</span>
                                <span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '1.2rem' }}>{formatRON(qty * price)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Comision Platformă (2%)</span>
                                <span style={{ color: 'var(--text-muted)' }}>{formatRON(Math.round(qty * price * 0.02))}</span>
                            </div>
                        </div>
                    )}

                    <h3 style={{ color: 'var(--gold-primary)', margin: '1.5rem 0 1rem' }}>Documente</h3>
                    <div className="grid-2">
                        <div className="upload-area">📄 Buletin de Analiză Laborator (PDF)<br /><small>Trage fișierul aici sau click</small></div>
                        <div className="upload-area">📋 Atestat Producător<br /><small>Trage fișierul aici sau click</small></div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-gold" style={{ minHeight: 48, fontSize: '1rem' }}>Publică Oferta</button>
                        <button type="button" className="btn btn-outline" style={{ minHeight: 48 }} onClick={() => addToast('Ciorna a fost salvată local.')}>Salvează Ciornă</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
