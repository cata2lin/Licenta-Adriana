import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Login() {
    const [tab, setTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('Fermier');
    const [cui, setCui] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [cuiStatus, setCuiStatus] = useState(null);
    const [error, setError] = useState('');
    const { login, register, isLoading } = useApp();
    const navigate = useNavigate();

    const roleMap = { 'Fermier': 'FARMER', 'Cumpărător Comercial': 'CORPORATE_BUYER', 'Transportator': 'TRANSPORTER' };

    const simulateAnafCheck = () => {
        if (cui.length >= 5) {
            setCuiStatus('loading');
            setTimeout(() => setCuiStatus('valid'), 1200);
        } else {
            setCuiStatus('invalid');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) return;
        const result = await login(email, password, 'FARMER', 'SC AGRO ION SRL');
        if (result.success) navigate('/dashboard');
        else setError(result.error || 'Eroare la autentificare.');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password || !fullName || !companyName) return;
        if (password.length < 8) { setError('Parola trebuie să aibă minim 8 caractere.'); return; }

        const result = await register({
            email,
            password,
            fullName,
            role: roleMap[role] || 'FARMER',
            phoneNumber: phone || undefined,
            cui: cui || undefined,
            companyName,
            legalAddress: address || undefined,
        });

        if (result.success) {
            setTab('login');
            setError('');
        } else {
            setError(result.error || 'Eroare la înregistrare.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-left"><div><h2>Agri<span style={{ color: '#2d8a4e' }}>Connect</span></h2><p>Piața ta agricolă digitală</p></div></div>
            <div className="auth-right">
                <div className="auth-card">
                    <div className="tabs" style={{ marginBottom: '1.5rem' }}>
                        <div className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }} style={{ minHeight: 44 }}>Autentificare</div>
                        <div className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }} style={{ minHeight: 44 }}>Înregistrare</div>
                    </div>

                    {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--red-primary)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', color: 'var(--red-primary)', fontSize: '0.85rem' }}>⚠ {error}</div>}

                    {tab === 'login' ? (
                        <form onSubmit={handleLogin}>
                            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="email@firma.ro" value={email} onChange={e => setEmail(e.target.value)} required style={{ minHeight: 44 }} /></div>
                            <div className="form-group"><label className="form-label">Parolă</label><input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ minHeight: 44 }} /></div>
                            <button type="submit" className="btn btn-gold" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', minHeight: 48 }}>
                                {isLoading ? '⏳ Se conectează...' : 'Intră în cont'}
                            </button>
                            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}><a href="#">Ai uitat parola?</a></p>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister}>
                            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@firma.ro" required style={{ minHeight: 44 }} /></div>
                            <div className="form-group"><label className="form-label">Parolă (min. 8 caractere)</label><input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 caractere" required style={{ minHeight: 44 }} /></div>
                            <div className="form-group"><label className="form-label">Nume Complet</label><input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Gheorghe Ionescu" required style={{ minHeight: 44 }} /></div>
                            <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0722 123 456" style={{ minHeight: 44 }} /></div>
                            <div className="form-group"><label className="form-label">Tip Cont</label><select className="form-select" value={role} onChange={e => setRole(e.target.value)} style={{ minHeight: 44 }}><option>Fermier</option><option>Cumpărător Comercial</option><option>Transportator</option></select></div>
                            <div className="form-group">
                                <label className="form-label">CUI {cuiStatus === 'valid' && <span className="badge badge-green" style={{ marginLeft: '0.5rem' }}>✓ Verificat ANAF</span>}{cuiStatus === 'loading' && <span className="badge badge-gold" style={{ marginLeft: '0.5rem' }}>⏳ Se verifică...</span>}{cuiStatus === 'invalid' && <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>✗ CUI invalid</span>}</label>
                                <input className="form-input" value={cui} onChange={e => { setCui(e.target.value); setCuiStatus(null); }} onBlur={simulateAnafCheck} placeholder="RO12345678" style={{ minHeight: 44 }} />
                            </div>
                            <div className="form-group"><label className="form-label">Nume Firmă</label><input className="form-input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="SC AGRO ION SRL" required style={{ minHeight: 44 }} /></div>
                            <div className="form-group"><label className="form-label">Adresă Sediu</label><input className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Str. Recoltei Nr. 5, Constanța" style={{ minHeight: 44 }} /></div>
                            <button type="submit" className="btn btn-gold" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', minHeight: 48 }}>
                                {isLoading ? '⏳ Se procesează...' : 'Creează Cont'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
