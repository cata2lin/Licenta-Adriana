import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, logout, notifications, markNotificationRead } = useApp();
    const [showNotif, setShowNotif] = useState(false);
    const cl = (path) => pathname === path ? 'active' : '';
    const unread = notifications.filter(n => !n.read).length;

    // Hide navbar on login page
    if (pathname === '/login') return null;

    return (
        <nav className="navbar">
            <Link to="/" className="logo">Agri<span>Connect</span></Link>
            <div className="nav-links">
                <Link to="/market" className={cl('/market')}>Piața Spot</Link>
                {user && <Link to="/dashboard" className={cl('/dashboard')}>Dashboard</Link>}
                {user && <Link to="/orders" className={cl('/orders')}>Comenzi</Link>}
                {user && <Link to="/contracts" className={cl('/contracts')}>Contracte</Link>}
                {user && <Link to="/logistics" className={cl('/logistics')}>Logistică</Link>}
                {user && <Link to="/profile" className={cl('/profile')}>Profil</Link>}
                {user?.role === 'ADMIN' && <Link to="/admin" className={cl('/admin')}>Admin</Link>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {user && (
                    <div style={{ position: 'relative' }}>
                        <button onClick={() => setShowNotif(!showNotif)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.1rem', position: 'relative' }}>
                            🔔
                            {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--red-primary)', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
                        </button>
                        {showNotif && (
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: 340, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', zIndex: 200, maxHeight: 350, overflowY: 'auto' }}>
                                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--glass-border)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--gold-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Notificări</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{unread} necitite</span>
                                </div>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nicio notificare</div>
                                ) : notifications.map(n => (
                                    <div key={n.id} style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--glass-border)', background: n.read ? 'transparent' : 'var(--bg-card)', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => { markNotificationRead(n.id); setShowNotif(false); }}>
                                        <div style={{ color: n.read ? 'var(--text-muted)' : 'var(--text-primary)' }}>{!n.read && '● '}{n.text}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{n.time}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link to="/profile" className="nav-user"><div className="avatar">{user.companyName.slice(3, 5).toUpperCase()}</div>{user.companyName}</Link>
                        <button onClick={() => { logout(); navigate('/'); setShowNotif(false); }} style={{ background: 'transparent', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.75rem', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>Ieși</button>
                    </div>
                ) : (
                    <Link to="/login"><button className="btn btn-gold" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>Autentificare</button></Link>
                )}
            </div>
        </nav>
    );
}
