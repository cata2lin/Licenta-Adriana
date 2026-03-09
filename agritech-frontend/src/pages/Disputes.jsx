import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader, ConfirmDialog } from '../components/ui';
import { formatRON } from '../utils/formatters';
import { disputesService } from '../services';

export default function Disputes() {
    const { addToast, updateOrderStatus } = useApp();
    const [messages, setMessages] = useState([
        { sender: 'SC OIL PRESS SRL', role: 'buyer', text: 'Am recepționat lotul, dar analiza laboratorului nostru arată proteina la 12.8% vs 14.0% contractat. Solicităm reducere de preț proporțională cu deviația.', time: '09.03.2024, 10:30' },
        { sender: 'SC AGRO ION SRL', role: 'seller', text: 'Buletinul nostru de la încărcare arăta 13.9%. E posibil ca transportul să fi impactat calitatea. Propunem o reducere de 5% din valoare.', time: '09.03.2024, 11:15' },
        { sender: 'SC OIL PRESS SRL', role: 'buyer', text: 'Deviația de 1.2% este semnificativă pentru procesul nostru. Solicităm 8% reducere (33,600 RON) sau returnarea lotului.', time: '09.03.2024, 14:00' },
    ]);
    const [newMsg, setNewMsg] = useState('');
    const [refundPercent, setRefundPercent] = useState(8);
    const [confirmAction, setConfirmAction] = useState(null);
    const totalAmount = 420000;

    const sendMessage = () => {
        if (!newMsg.trim()) return;
        setMessages(prev => [...prev, { sender: 'SC AGRO ION SRL', role: 'seller', text: newMsg, time: new Date().toLocaleString('ro-RO') }]);
        setNewMsg('');
        // Simulate counterpart response after 2 seconds
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'SC OIL PRESS SRL', role: 'buyer', text: 'Am primit mesajul. Analizăm propunerea și revenim cu un răspuns.', time: new Date().toLocaleString('ro-RO') }]);
        }, 2000);
    };

    const handleAccept = () => {
        setConfirmAction({
            title: 'Acceptă Soluția?',
            message: `Confirmi reducerea de ${refundPercent}% (${formatRON(totalAmount * refundPercent / 100)})? Fondurile vor fi distribuite automat: ${formatRON(totalAmount - totalAmount * refundPercent / 100)} către vânzător, ${formatRON(totalAmount * refundPercent / 100)} refund cumpărător.`,
            onConfirm: () => {
                updateOrderStatus('AGR-2024-003', 'Livrat', 'Eliberat');
                addToast(`Disputa soluționată! Refund de ${formatRON(totalAmount * refundPercent / 100)} procesat automat.`);
            },
            type: 'success',
            confirmText: 'Da, Acceptă',
        });
    };

    const handleEscalate = () => {
        setConfirmAction({
            title: 'Escaladează la ADR?',
            message: 'Disputa va fi transmisă către un Mediator ADR extern (conform Legea 81/2022). Fondurile Escrow rămân blocate până la rezolvare. Veți fi contactat în max. 48h.',
            onConfirm: () => addToast('Disputa a fost escaladată către Mediere ADR. Veți fi contactat în 48h.'),
            type: 'warning',
            confirmText: 'Escaladează',
        });
    };

    return (
        <div className="page">
            <PageHeader title="⚠️ Centru de" highlight="Soluționare Dispute" showBack backTo="/orders" />

            <div className="card" style={{ borderColor: 'var(--red-primary)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h3>Disputa #DSP-2024-003</h3>
                        <span className="badge badge-red pulse">● ÎN ANALIZĂ</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sumă în Escrow</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--red-primary)' }}>{totalAmount.toLocaleString()} RON</div>
                        <span className="badge badge-red">FONDURI REȚINUTE</span>
                    </div>
                </div>
                <div className="grid-2">
                    <div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Contract: <strong style={{ color: 'var(--gold-primary)' }}>#AGR-2024-003</strong></div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Părți: <strong>SC AGRO ION SRL</strong> (Vânzător) vs <strong>SC OIL PRESS SRL</strong> (Cumpărător)</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Motiv: <strong style={{ color: 'var(--red-primary)' }}>Deviație Calitativă — Proteina sub prag</strong></div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Cadru Legal</div>
                        <div style={{ fontSize: '0.85rem' }}>
                            <span className="badge badge-gold" style={{ marginRight: '0.5rem' }}>Legea 81/2022</span>
                            <span className="badge badge-gold">Conciliere Obligatorie</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>📊 Comparație Parametri Calitate</h3>
                <table className="compare-table">
                    <thead><tr><th>Parametru</th><th>Contractat</th><th>Recepționat</th><th>Deviație</th><th>Conform</th></tr></thead>
                    <tbody>
                        <tr><td>Proteină</td><td>14.0%</td><td>12.8%</td><td className="deviation bad">-1.2%</td><td><span className="badge badge-red">❌ Non-Conform</span></td></tr>
                        <tr><td>Umiditate</td><td>13.0%</td><td>13.2%</td><td className="deviation warn">+0.2%</td><td><span className="badge badge-gold">⚠ Tolerabil</span></td></tr>
                        <tr><td>Masă Hectolitrică</td><td>78.0 kg/hl</td><td>77.5 kg/hl</td><td className="deviation ok">-0.5</td><td><span className="badge badge-green">✓ OK</span></td></tr>
                        <tr><td>Corpuri Străine</td><td>≤2.0%</td><td>1.8%</td><td className="deviation ok">OK</td><td><span className="badge badge-green">✓ OK</span></td></tr>
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>💬 Chat Conciliere (Legea 81/2022)</h3>
                <div className="chat-box">
                    {messages.map((m, i) => (
                        <div className="chat-msg" key={i}>
                            <div className="sender" style={{ color: m.role === 'buyer' ? '#60a5fa' : 'var(--gold-primary)' }}>{m.sender} ({m.role === 'buyer' ? 'Cumpărător' : 'Vânzător'})</div>
                            <div className="text">{m.text}</div>
                            <div className="time">{m.time}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input className="form-input" placeholder="Scrie un mesaj..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} style={{ flex: 1, minHeight: 44 }} />
                    <button className="btn btn-gold" onClick={sendMessage} style={{ minHeight: 44 }}>Trimite</button>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="card" style={{ background: 'rgba(212,175,53,0.05)', borderColor: 'var(--gold-primary)' }}>
                    <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>💰 Refund Parțial (API PSP)</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Ajustarea sumei Escrow — se va declanșa un apel „Refund Parțial" către PSP pentru regularizarea sub-conturilor.</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <input type="range" min={1} max={25} value={refundPercent} onChange={e => setRefundPercent(parseInt(e.target.value))} style={{ flex: 1, height: 8, accentColor: 'var(--gold-primary)' }} />
                        <span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>{refundPercent}%</span>
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Refund Cumpărător</span><span style={{ fontWeight: 600, color: 'var(--red-primary)' }}>{formatRON(Math.round(totalAmount * refundPercent / 100))}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span style={{ color: 'var(--text-muted)' }}>Eliberat Vânzător</span><span style={{ fontWeight: 600, color: 'var(--green-badge)' }}>{formatRON(totalAmount - Math.round(totalAmount * refundPercent / 100))}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Comision Platformă</span><span style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>{formatRON(Math.round(totalAmount * 0.02))}</span></div>
                    </div>
                </div>
                <div className="card">
                    <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1rem' }}>⚖️ Acțiuni Disponibile</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button className="btn btn-gold" style={{ minHeight: 48, justifyContent: 'center', fontSize: '0.95rem' }} onClick={() => {
                            setMessages(prev => [...prev, { sender: 'SC AGRO ION SRL', role: 'seller', text: `Propun reducere de ${refundPercent}% (${formatRON(Math.round(totalAmount * refundPercent / 100))}). Aceasta reflectă deviația calitativă constatată.`, time: new Date().toLocaleString('ro-RO') }]);
                            addToast('Propunerea de reducere a fost trimisă.');
                        }}>📩 Propune Reducere ({refundPercent}%)</button>
                        <button className="btn btn-green" style={{ minHeight: 48, justifyContent: 'center', fontSize: '0.95rem' }} onClick={handleAccept}>✓ Acceptă Soluția & Eliberează Fonduri</button>
                        <button className="btn btn-red-outline" style={{ minHeight: 48, justifyContent: 'center', fontSize: '0.95rem' }} onClick={handleEscalate}>⚠ Escaladează către ADR</button>
                    </div>
                </div>
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
