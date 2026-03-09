import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { financialService, transportService, disputesService } from '../services';

export default function Admin() {
    const { orders, listings, addToast } = useApp();
    const [kycQueue, setKycQueue] = useState([
        { id: 1, name: 'SC AGRO-VEST SRL', cui: 'RO98765432', type: 'Producător', date: '08.03.2024' },
        { id: 2, name: 'SC DELTA FARMS SRL', cui: 'RO11223344', type: 'Distribuitor', date: '07.03.2024' },
        { id: 3, name: 'SC BIO CEREALE SRL', cui: 'RO55667788', type: 'Producător', date: '06.03.2024' },
        { id: 4, name: 'SC MOLDOVA AGRI SRL', cui: 'RO99887766', type: 'Procesator', date: '05.03.2024' },
    ]);
    const [activityLog, setActivityLog] = useState([
        { text: 'SC AGRO ION SRL a publicat ofertă: Grâu 120t', time: 'acum 1h' },
        { text: 'SC OIL PRESS SRL a deschis dispută #DSP-2024-003', time: 'acum 3h' },
        { text: 'Plată eliberată: #AGR-2024-002 — 83,300 RON', time: 'acum 5h' },
        { text: 'SC MORAR SRL a finalizat KYC', time: 'ieri' },
        { text: 'Generare automată Cod UIT: RO24T-0005', time: 'ieri' },
    ]);
    const [dacReportStatus, setDacReportStatus] = useState('ready');
    const [apiStats, setApiStats] = useState(null);

    // Try to fetch backend stats on mount
    useEffect(() => {
        Promise.allSettled([
            financialService.getStats(),
            transportService.getStats(),
            disputesService.getStats(),
        ]).then(([finResult, transResult, dispResult]) => {
            const stats = {};
            if (finResult.status === 'fulfilled') Object.assign(stats, { financial: finResult.value });
            if (transResult.status === 'fulfilled') Object.assign(stats, { transport: transResult.value });
            if (dispResult.status === 'fulfilled') Object.assign(stats, { disputes: dispResult.value });
            if (Object.keys(stats).length > 0) setApiStats(stats);
        });
    }, []);

    const totalTransactions = apiStats?.financial?.totalRevenue || orders.reduce((sum, o) => sum + o.total, 0);
    const disputeCount = apiStats?.disputes?.open || orders.filter(o => o.escrowType === 'red').length;
    const platformFees = apiStats?.financial?.totalRevenue || orders.reduce((sum, o) => sum + (o.platformFee || 0), 0);

    const approveKyc = (id) => {
        const company = kycQueue.find(k => k.id === id);
        setKycQueue(prev => prev.filter(k => k.id !== id));
        addToast(`KYC aprobat pentru ${company?.name}`);
        setActivityLog(prev => [{ text: `Admin a aprobat KYC: ${company?.name}`, time: 'acum' }, ...prev]);
    };

    const rejectKyc = (id) => {
        const company = kycQueue.find(k => k.id === id);
        setKycQueue(prev => prev.filter(k => k.id !== id));
        addToast(`KYC respins pentru ${company?.name}`);
        setActivityLog(prev => [{ text: `Admin a respins KYC: ${company?.name}`, time: 'acum' }, ...prev]);
    };

    const generateDacReport = () => {
        setDacReportStatus('generating');
        addToast('Se generează raportul DAC7...');
        setTimeout(() => {
            setDacReportStatus('done');
            addToast('Raportul DAC7 (F7000) a fost generat cu succes!');
            setActivityLog(prev => [{ text: 'Raport DAC7 generat — pregătit pentru ANAF', time: 'acum' }, ...prev]);
        }, 2000);
    };

    return (
        <div className="page">
            <div className="page-title">Panou <span>Administrare</span> AgriConnect</div>
            <div className="stats-row">
                <div className="card"><div className="card-title">Utilizatori Activi</div><div className="card-value">342</div><span className="badge badge-green" style={{ marginTop: '0.5rem' }}>↑ +15%</span></div>
                <div className="card"><div className="card-title">Tranzacții Lunare</div><div className="card-value gold">{(totalTransactions / 1000000).toFixed(1)}M <span style={{ fontSize: '1rem' }}>RON</span></div></div>
                <div className="card"><div className="card-title">Dispute Deschise</div><div className="card-value" style={{ color: 'var(--red-primary)' }}>{disputeCount}</div></div>
                <div className="card"><div className="card-title">Comision Platformă</div><div className="card-value gold">{platformFees.toLocaleString()} <span style={{ fontSize: '1rem' }}>RON</span></div></div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-title">Volumul Tranzacțiilor (6 luni)</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: 180, padding: '1rem 0' }}>
                        {[1.2, 1.8, 1.5, 2.1, 1.9, (totalTransactions / 1000000).toFixed(1)].map((v, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)' }}>{v}M</span>
                                <div style={{ width: '100%', height: `${parseFloat(v) / 2.5 * 100}%`, background: `linear-gradient(180deg, var(--gold-primary), var(--green-primary))`, borderRadius: '4px 4px 0 0', minHeight: 20, transition: 'height 0.5s' }}></div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{'ASONDF'[5 - i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="card">
                    <div className="card-title">Distribuția pe Mărfuri</div>
                    <div style={{ padding: '1.5rem 0' }}>
                        {[['🌾 Grâu', '45%', 45], ['🌽 Porumb', '25%', 25], ['🌻 Fl. Soarelui', '18%', 18], ['🌿 Rapiță', '12%', 12]].map(([name, pct, w]) => (
                            <div key={name} style={{ marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.3rem' }}><span>{name}</span><span style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>{pct}</span></div>
                                <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4 }}><div style={{ height: '100%', width: `${w}%`, background: 'linear-gradient(90deg, var(--green-primary), var(--gold-primary))', borderRadius: 4, transition: 'width 0.5s' }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-title" style={{ marginBottom: '1rem' }}>Cereri KYC Pendinte ({kycQueue.length})</div>
                    {kycQueue.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>✓ Nicio cerere KYC pendintă</div>
                    ) : kycQueue.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{c.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CUI: {c.cui} — {c.type} — {c.date}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-green" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }} onClick={() => approveKyc(c.id)}>✓ Aprobă</button>
                                <button className="btn btn-red-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }} onClick={() => rejectKyc(c.id)}>✗ Respinge</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <div className="card-title" style={{ marginBottom: '1rem' }}>Raportare DAC7 (F7000)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Entități Raportate</span><span style={{ fontWeight: 600 }}>287</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Volum Facilitat</span><span style={{ fontWeight: 600 }}>{(totalTransactions / 1000000).toFixed(1)}M RON</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Comisioane</span><span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>{platformFees.toLocaleString()} RON</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Status</span>
                            <span className={`badge ${dacReportStatus === 'done' ? 'badge-green' : dacReportStatus === 'generating' ? 'badge-gold' : 'badge-gold'}`}>
                                {dacReportStatus === 'done' ? '✓ Generat' : dacReportStatus === 'generating' ? '⏳ Se generează...' : 'Pregătit — Nesubmis'}
                            </span>
                        </div>
                    </div>
                    <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }} onClick={generateDacReport} disabled={dacReportStatus === 'generating'}>
                        {dacReportStatus === 'generating' ? '⏳ Se generează...' : '📤 Generează Raport ANAF'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-title" style={{ marginBottom: '1rem' }}>Activitate Recentă</div>
                {activityLog.map((a, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{a.text}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{a.time}</span>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-title" style={{ marginBottom: '1rem' }}>Oferte Active pe Platformă ({listings.length})</div>
                <table><thead><tr><th>Produs</th><th>Vânzător</th><th>Cantitate</th><th>Preț/t</th><th>Locație</th></tr></thead>
                    <tbody>{listings.slice(0, 8).map(l => (
                        <tr key={l.id}><td>{l.name}</td><td>{l.seller}</td><td>{l.qty}t</td><td style={{ color: 'var(--gold-primary)' }}>{l.price.toLocaleString()} RON</td><td>{l.loc}</td></tr>
                    ))}</tbody></table>
            </div>
        </div>
    );
}
