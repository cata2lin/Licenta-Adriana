/**
 * Analytics Page — Commodity Market Intelligence
 * 
 * Provides comprehensive market analytics for all agricultural commodities:
 * - Price trends (12-month SVG line chart)
 * - Volume analysis (bar chart)
 * - Quality parameter distributions
 * - Regional supply breakdown
 * - MATIF benchmark comparison
 * - Seasonal trading patterns
 * - Volatility metrics
 * 
 * Auto-adapts when new commodities are added to the system.
 */
import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, StatCard } from '../components/ui';
import { formatRON } from '../utils/formatters';
import analyticsService from '../services/analyticsService';

// ─── SVG Chart Components ───

function LineChart({ data, width = 700, height = 260, showVolume = false }) {
    if (!data || data.length === 0) return null;
    const pad = { top: 20, right: 20, bottom: 40, left: 65 };
    const w = width - pad.left - pad.right;
    const h = height - pad.top - pad.bottom;

    const prices = data.map(d => d.price);
    const matif = data.map(d => d.matifRon);
    const allVals = [...prices, ...matif];
    const minY = Math.min(...allVals) * 0.95;
    const maxY = Math.max(...allVals) * 1.05;
    const rangeY = maxY - minY || 1;

    const x = (i) => pad.left + (i / (data.length - 1)) * w;
    const y = (val) => pad.top + h - ((val - minY) / rangeY) * h;

    const priceLine = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.price)}`).join(' ');
    const matifLine = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.matifRon)}`).join(' ');
    const areaPath = `${priceLine} L${x(data.length - 1)},${pad.top + h} L${x(0)},${pad.top + h} Z`;

    // Volume bars
    const maxVol = showVolume ? Math.max(...data.map(d => d.volume)) : 0;
    const volH = 50;

    return (
        <svg viewBox={`0 0 ${width} ${height + (showVolume ? volH + 20 : 0)}`} style={{ width: '100%', height: 'auto' }}>
            <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--gold-primary)" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                <g key={frac}>
                    <line x1={pad.left} y1={pad.top + h * (1 - frac)} x2={pad.left + w} y2={pad.top + h * (1 - frac)} stroke="var(--glass-border)" strokeDasharray="3,3" />
                    <text x={pad.left - 8} y={pad.top + h * (1 - frac) + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">{Math.round(minY + rangeY * frac)}</text>
                </g>
            ))}
            {/* Area + Lines */}
            <path d={areaPath} fill="url(#priceGrad)" />
            <path d={matifLine} fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
            <path d={priceLine} fill="none" stroke="var(--gold-primary)" strokeWidth="2.5" />
            {/* Dots */}
            {data.map((d, i) => (
                <g key={i}>
                    <circle cx={x(i)} cy={y(d.price)} r="3.5" fill="var(--gold-primary)" stroke="var(--bg-primary)" strokeWidth="1.5" />
                    <text x={x(i)} y={pad.top + h + 20} fill="var(--text-muted)" fontSize="9" textAnchor="middle">{d.month}</text>
                </g>
            ))}
            {/* Legend */}
            <g transform={`translate(${pad.left + 10}, ${pad.top + 8})`}>
                <line x1="0" y1="0" x2="16" y2="0" stroke="var(--gold-primary)" strokeWidth="2.5" />
                <text x="20" y="4" fill="var(--text-primary)" fontSize="10">Preț Platformă (RON/t)</text>
                <line x1="140" y1="0" x2="156" y2="0" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4,4" />
                <text x="160" y="4" fill="var(--text-muted)" fontSize="10">MATIF (RON/t)</text>
            </g>
            {/* Volume bars */}
            {showVolume && (
                <g transform={`translate(0, ${height})`}>
                    <text x={pad.left - 8} y={15} fill="var(--text-muted)" fontSize="9" textAnchor="end">Vol.</text>
                    {data.map((d, i) => {
                        const barW = w / data.length * 0.6;
                        const barH = (d.volume / maxVol) * volH;
                        return (
                            <g key={i}>
                                <rect x={x(i) - barW / 2} y={volH - barH + 5} width={barW} height={barH} fill="var(--green-primary)" opacity="0.5" rx="2" />
                                <text x={x(i)} y={volH + 18} fill="var(--text-muted)" fontSize="8" textAnchor="middle">{d.volume}t</text>
                            </g>
                        );
                    })}
                </g>
            )}
        </svg>
    );
}

function BarChart({ data, labelKey, valueKey, maxVal, color = 'var(--gold-primary)', unit = '' }) {
    if (!data || data.length === 0) return null;
    const max = maxVal || Math.max(...data.map(d => d[valueKey]));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {data.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ width: 80, textAlign: 'right', color: 'var(--text-muted)', flexShrink: 0 }}>{d[labelKey]}</span>
                    <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 4, height: 22, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${(d[valueKey] / max) * 100}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease', opacity: 0.7 }} />
                        <span style={{ position: 'absolute', right: 8, top: 3, fontSize: '0.7rem', color: 'var(--text-primary)' }}>{d[valueKey]}{unit}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function QualityChart({ param }) {
    const max = Math.max(...param.distribution.map(d => d.frequency));
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{param.name}</span>
                <span className="badge badge-gold">Optim: {param.optimal}{param.unit}</span>
            </div>
            <div style={{ display: 'flex', gap: 2, alignItems: 'end', height: 60 }}>
                {param.distribution.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                            width: '100%', height: (d.frequency / max) * 50,
                            background: d.isOptimal ? 'var(--gold-primary)' : 'var(--green-primary)',
                            opacity: d.isOptimal ? 0.9 : 0.4, borderRadius: '3px 3px 0 0', transition: 'height 0.4s ease',
                        }} />
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.center}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SeasonalChart({ data }) {
    if (!data) return null;
    return (
        <div style={{ display: 'flex', gap: 2, alignItems: 'end' }}>
            {data.map((d, i) => {
                const h = 40 + (d.factor - 0.88) * 300;
                const color = d.recommendation === 'CUMPĂRĂ' ? 'var(--green-primary)' : d.recommendation === 'VINDE' ? 'var(--gold-primary)' : 'var(--text-muted)';
                return (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.6rem', color, fontWeight: 600, marginBottom: 2 }}>
                            {d.recommendation === 'CUMPĂRĂ' ? '↓' : d.recommendation === 'VINDE' ? '↑' : '·'}
                        </div>
                        <div style={{ height: h, background: color, opacity: 0.5, borderRadius: '3px 3px 0 0', margin: '0 auto', width: '80%' }} />
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 3 }}>{d.month}</div>
                        <div style={{ fontSize: '0.6rem', color }}>{formatRON(d.avgPrice).replace(' RON', '')}</div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Main Analytics Page ───

export default function Analytics() {
    const { addToast } = useApp();
    const [commodities, setCommodities] = useState([]);
    const [selected, setSelected] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    // Load commodity overview on mount
    useEffect(() => {
        analyticsService.getCommodities()
            .then(data => {
                setCommodities(data || []);
                if (data && data.length > 0) setSelected(data[0].name);
            })
            .catch(() => addToast('Nu s-au putut încărca datele analitice.', 'error'))
            .finally(() => setLoading(false));
    }, []);

    // Load detailed analytics when commodity selected
    useEffect(() => {
        if (!selected) return;
        setDetailLoading(true);
        analyticsService.getCommodityAnalytics(selected)
            .then(data => setAnalytics(data))
            .catch(() => addToast('Eroare la încărcarea analizei.', 'error'))
            .finally(() => setDetailLoading(false));
    }, [selected]);

    const snap = analytics?.snapshot;

    if (loading) return (
        <div className="page" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <div style={{ color: 'var(--text-muted)' }}>Se încarcă datele analitice...</div>
        </div>
    );

    return (
        <div className="page">
            <PageHeader title="Analiză" highlight="Piață" />

            {/* ─── Commodity Selector Tabs ─── */}
            <div className="tabs" style={{ marginBottom: '1.5rem' }}>
                {commodities.map(c => (
                    <div key={c.name} className={`tab ${selected === c.name ? 'active' : ''}`} onClick={() => setSelected(c.name)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{c.name}</span>
                        <span style={{ fontSize: '0.7rem', color: c.priceChangePercent >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                            {c.priceChangePercent >= 0 ? '▲' : '▼'} {Math.abs(c.priceChangePercent)}%
                        </span>
                    </div>
                ))}
            </div>

            {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Se încarcă analiza pentru {selected}...</div>
            ) : analytics && snap && (
                <>
                    {/* ─── Description Bar ─── */}
                    <div className="card" style={{ borderLeft: '3px solid var(--gold-primary)', marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                                <span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '1.1rem' }}>{analytics.commodity}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '1rem' }}>{analytics.description}</span>
                            </div>
                            <span className="badge badge-green">🌾 Recoltă: {analytics.harvestMonths}</span>
                        </div>
                    </div>

                    {/* ─── Key Metrics Row ─── */}
                    <div className="stats-row" style={{ marginBottom: '1.5rem' }}>
                        <StatCard title="Preț Curent" value={formatRON(snap.currentPrice).replace(' RON', '')} suffix="RON/t" />
                        <StatCard title="Variație Lunară" value={`${snap.priceChangePercent >= 0 ? '+' : ''}${snap.priceChangePercent}%`} suffix={snap.priceChange >= 0 ? '▲' : '▼'} />
                        <StatCard title="Variație 12 Luni" value={`${snap.yearChangePercent >= 0 ? '+' : ''}${snap.yearChangePercent}%`} suffix={snap.yearChange >= 0 ? '▲' : '▼'} />
                        <StatCard title="Volatilitate" value={`${snap.volatility}%`} suffix="σ" />
                    </div>
                    <div className="stats-row" style={{ marginBottom: '1.5rem' }}>
                        <StatCard title="Preț Mediu 12L" value={formatRON(snap.avgPrice).replace(' RON', '')} suffix="RON/t" />
                        <StatCard title="Min / Max" value={`${snap.minPrice} - ${snap.maxPrice}`} suffix="RON/t" />
                        <StatCard title="Volum Total 12L" value={snap.totalVolume.toLocaleString()} suffix="tone" />
                        <StatCard title="Oferte Active" value={snap.activeListings} />
                    </div>

                    {/* ─── MATIF Benchmark ─── */}
                    <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>MATIF Paris (Euronext):</span>
                            <span style={{ fontWeight: 700, marginLeft: '0.5rem' }}>{snap.matifEur} EUR/t</span>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>≈ {formatRON(snap.matifRon)}/t</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {snap.premiumDiscount >= 0 ? 'Primă platformă:' : 'Discount platformă:'}
                            </span>
                            <span style={{ fontWeight: 700, marginLeft: '0.5rem', color: snap.premiumDiscount >= 0 ? '#22c55e' : '#ef4444' }}>
                                {snap.premiumDiscount >= 0 ? '+' : ''}{snap.premiumDiscount} RON ({snap.premiumDiscountPercent >= 0 ? '+' : ''}{snap.premiumDiscountPercent}%)
                            </span>
                        </div>
                    </div>

                    {/* ─── Price Chart + Volume ─── */}
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div className="card-title" style={{ marginBottom: '1rem' }}>📈 Evoluție Preț & Volum — 12 Luni</div>
                        <LineChart data={analytics.priceHistory} showVolume={true} />
                    </div>

                    {/* ─── Grid: Seasonal + Regional ─── */}
                    <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: '1rem' }}>📅 Tipar Sezonier (Preț Mediu/Lună)</div>
                            <SeasonalChart data={analytics.seasonalPattern} />
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.75rem', fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--green-primary)' }}>↓ CUMPĂRĂ (sub medie)</span>
                                <span style={{ color: 'var(--text-muted)' }}>· NEUTRU</span>
                                <span style={{ color: 'var(--gold-primary)' }}>↑ VINDE (peste medie)</span>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-title" style={{ marginBottom: '1rem' }}>🗺️ Distribuție Regională</div>
                            <BarChart data={analytics.regionalSupply?.slice(0, 8)} labelKey="county" valueKey="percent" color="var(--green-primary)" unit="%" />
                        </div>
                    </div>

                    {/* ─── Quality Distributions ─── */}
                    {analytics.qualityDistribution && analytics.qualityDistribution.length > 0 && (
                        <div className="card" style={{ marginBottom: '1.5rem' }}>
                            <div className="card-title" style={{ marginBottom: '1rem' }}>🔬 Distribuție Parametri de Calitate</div>
                            <div className="grid-2" style={{ gap: '1.5rem' }}>
                                {analytics.qualityDistribution.map(param => (
                                    <QualityChart key={param.name} param={param} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ─── Price Range Gauge ─── */}
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div className="card-title" style={{ marginBottom: '1rem' }}>🎯 Poziție Preț în Interval Istoric</div>
                        <div style={{ position: 'relative', height: 40, background: 'var(--bg-secondary)', borderRadius: 8, overflow: 'hidden' }}>
                            <div style={{
                                position: 'absolute', left: 0, top: 0, bottom: 0,
                                width: `${((snap.currentPrice - analytics.priceRange.min) / (analytics.priceRange.max - analytics.priceRange.min)) * 100}%`,
                                background: 'linear-gradient(90deg, var(--green-primary), var(--gold-primary))',
                                opacity: 0.5, borderRadius: 8,
                            }} />
                            <div style={{
                                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                                left: `${((snap.currentPrice - analytics.priceRange.min) / (analytics.priceRange.max - analytics.priceRange.min)) * 100}%`,
                                width: 3, height: 30, background: 'var(--gold-primary)', borderRadius: 2,
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>Min: {formatRON(analytics.priceRange.min)}/t</span>
                            <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>Actual: {formatRON(snap.currentPrice)}/t</span>
                            <span>Max: {formatRON(analytics.priceRange.max)}/t</span>
                        </div>
                    </div>

                    {/* ─── Data Table ─── */}
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: '1rem' }}>📋 Date Istorice Detaliate</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lună</th>
                                    <th>Preț (RON/t)</th>
                                    <th>Min-Max</th>
                                    <th>MATIF (EUR)</th>
                                    <th>MATIF (RON)</th>
                                    <th>Volum (t)</th>
                                    <th>Nr. Oferte</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.priceHistory?.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.monthFull}</td>
                                        <td style={{ color: 'var(--gold-primary)', fontWeight: 600 }}>{formatRON(row.price)}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{row.low} - {row.high}</td>
                                        <td>{row.matifEur} €</td>
                                        <td>{formatRON(row.matifRon)}</td>
                                        <td>{row.volume.toLocaleString()}</td>
                                        <td>{row.listings}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
