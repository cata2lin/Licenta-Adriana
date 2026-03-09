import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Landing() {
    const { listings, orders } = useApp();
    const [animatedPrices, setAnimatedPrices] = useState({});

    // Calculate live stats from context
    const totalListings = listings.length;
    const totalVolume = orders.reduce((s, o) => s + o.total, 0);
    const totalUsers = 342; // simulated

    // Simulated live price feed with small random fluctuations
    const basePrices = [
        { name: '🌾 Grâu', base: 1250 },
        { name: '🌽 Porumb', base: 980 },
        { name: '🌻 Fl. Soarelui', base: 2100 },
        { name: '🌿 Rapiță', base: 2350 },
    ];

    useEffect(() => {
        const update = () => {
            const newPrices = {};
            basePrices.forEach(p => {
                const change = (Math.random() - 0.45) * 4; // slight upward bias
                newPrices[p.name] = { price: p.base + Math.round(Math.random() * 50 - 25), change: change.toFixed(1), up: change > 0 };
            });
            setAnimatedPrices(newPrices);
        };
        update();
        const interval = setInterval(update, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <section className="hero">
                <h1>Piața Agricolă <span>Digitală</span></h1>
                <p>Conectăm producătorii agricoli cu cumpărătorii comerciali. Fără intermediari. Cu escrow securizat PSD2.</p>
                <div className="hero-buttons">
                    <Link to="/login" className="btn btn-gold" style={{ minHeight: 48, fontSize: '1rem' }}>Începe Acum</Link>
                    <Link to="/market" className="btn btn-outline" style={{ minHeight: 48, fontSize: '1rem' }}>Explorează Piața</Link>
                </div>
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{totalUsers}+</div><div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Companii Active</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{totalListings}</div><div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Oferte Live</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{(totalVolume / 1_000_000).toFixed(1)}M</div><div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>RON Tranzacționat</div></div>
                </div>
            </section>

            <section className="features">
                <div className="feature">
                    <div className="feature-icon">🛡️</div>
                    <h3>Escrow Securizat PSD2</h3>
                    <p>Banii sunt blocați într-un cont protejat (Safeguarded Account) și eliberați doar după confirmarea recepției. Split Payment automat: Vânzător 95%, Transport 3%, Platformă 2%.</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">✅</div>
                    <h3>Verificare ANAF Instant</h3>
                    <p>Validarea automată a CUI-ului, statusului TVA, eligibilitatea Taxării Inverse (Art. 331 Cod Fiscal), și conformitatea CAEN la înregistrare.</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">🚛</div>
                    <h3>Logistică Integrată</h3>
                    <p>Motor de rutare OSRM cu calcul Tonă-Kilometru, integrare 123cargo API și generare automată cod UIT (RO e-Transport ANAF).</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">⚖️</div>
                    <h3>Dispute ADR (Legea 81/2022)</h3>
                    <p>Sistem de conciliere intern cu chat bilateral, refund parțial automat și escaladare către Mediere ADR pentru dispute calitative.</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">📊</div>
                    <h3>Catalog Standardizat</h3>
                    <p>Mărfuri codificate SR EN + Nomenclator Combinat (NC). Parametri biochimici JSONB cu filtrare sub-milisecundă (GIN Index).</p>
                </div>
                <div className="feature">
                    <div className="feature-icon">📋</div>
                    <h3>Raportare DAC7 (F7000)</h3>
                    <p>Colectare automată KYC și raportare anuală ANAF a contraprestațiilor rulate pe entitate juridică (Directiva UE 2021/514).</p>
                </div>
            </section>

            <section style={{ padding: '3rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Cum <span style={{ color: 'var(--gold-primary)' }}>Funcționează</span></h2>
                <div className="stats-row">
                    {[
                        ['1', '📝 Înregistrare KYC', 'Verificare automată ANAF/VIES + upload documente'],
                        ['2', '📦 Publică Oferta', 'Parametri biochimici SR EN + Cod NC automat'],
                        ['3', '💰 Negociază Prețul', 'Bidding bilateral cu Escrow PSD2'],
                        ['4', '🚛 Livrare & Plată', 'UIT e-Transport + Split Payment automat'],
                    ].map(([n, t, d]) => (
                        <div className="card" key={n}>
                            <div style={{ fontSize: '2rem', color: 'var(--gold-primary)', fontWeight: 700 }}>{n}</div>
                            <div style={{ fontWeight: 600, margin: '0.5rem 0 0.25rem' }}>{t}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{d}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Prețuri <span style={{ color: 'var(--gold-primary)' }}>Live</span> Piață</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Actualizare automată la fiecare 8 secunde</p>
                <div className="prices-row">
                    {basePrices.map(({ name }) => {
                        const data = animatedPrices[name] || { price: 0, change: '0', up: true };
                        return (
                            <div className="card price-card" key={name}>
                                <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{name}</div>
                                <div className="price">{data.price.toLocaleString()} RON/t</div>
                                <div className={`change ${data.up ? 'up' : 'down'}`}>{data.up ? '+' : ''}{data.change}%</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section style={{ padding: '3rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Tipuri de <span style={{ color: 'var(--gold-primary)' }}>Contracte</span></h2>
                <div className="grid-2">
                    <div className="card" style={{ borderColor: 'var(--green-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '2rem' }}>⚡</span>
                            <h3 style={{ color: 'var(--green-badge)' }}>Contract Spot</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>Tranzacții imediate cu livrare fizică în maxim 5 zile lucrătoare. Prețul estefix la momentul negocierii. Ideal pentru achiziții urgente sau vânzări rapide.</p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                            <li>✓ Escrow PSD2 instant</li>
                            <li>✓ Livrare 1-5 zile</li>
                            <li>✓ Split Payment automat</li>
                        </ul>
                        <Link to="/market"><button className="btn btn-green" style={{ marginTop: '1rem', minHeight: 44 }}>Vezi Piața Spot →</button></Link>
                    </div>
                    <div className="card" style={{ borderColor: 'var(--gold-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '2rem' }}>📅</span>
                            <h3 style={{ color: 'var(--gold-primary)' }}>Contract Forward</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>Contracte de livrare fizică viitoare la un preț fixat azi. Nu sunt instrumente financiare (Legea 357/2005 — nu sunt Futures). Ideal pentru asigurarea aprovizionării pe termen mediu.</p>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                            <li>✓ Preț fixat la semnare</li>
                            <li>✓ Livrare la termen (1-12 luni)</li>
                            <li>✓ Avans 10% blocate în Escrow</li>
                        </ul>
                        <Link to="/contracts"><button className="btn btn-gold" style={{ marginTop: '1rem', minHeight: 44 }}>Vezi Contracte Forward →</button></Link>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <p>© 2024 AgriConnect — Platformă B2B Marketplace Agricol — CAEN 4611</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Tranzacții Bilaterale • Nu Bursă de Mărfuri (Legea 357/2005) • Platforma nu garantează plăți din fonduri proprii</p>
            </footer>
        </>
    );
}
