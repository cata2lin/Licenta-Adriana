import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/ui';
import { profileService } from '../services';
import AddressAutocomplete from '../components/AddressAutocomplete';

export default function Profile() {
    const { user, addToast } = useApp();
    const [activeTab, setActiveTab] = useState('info');
    const [companyName, setCompanyName] = useState(user?.companyName || 'SC AGRO ION SRL');
    const [address, setAddress] = useState('Str. Recoltei Nr. 5, Constanța');
    const [phone, setPhone] = useState('+40 741 234 567');
    const [email, setEmail] = useState(user?.email || 'contact@agroion.ro');
    const [activityType, setActivityType] = useState('Producător Cereale');
    const [description, setDescription] = useState('Exploatație agricolă cu 500ha teren arabil în zona Constanța. Specializați în grâu panificație și floarea soarelui HO.');
    const [iban, setIban] = useState('RO49AAAA1B31007593840000');
    const [bank, setBank] = useState('Libra Internet Bank');
    const [docs, setDocs] = useState([
        { name: 'Certificat Constatator', status: 'uploaded', file: null },
        { name: 'Atestat Producător', status: 'uploaded', file: null },
        { name: 'Buletin Reprezentant Legal', status: 'pending', file: null },
        { name: 'Certificat Înregistrare Fiscală', status: 'uploaded', file: null },
    ]);
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifSMS, setNotifSMS] = useState(false);
    const [notifPrices, setNotifPrices] = useState(true);
    const [notifOrders, setNotifOrders] = useState(true);
    const [language, setLanguage] = useState('ro');

    // Load profile from API on mount
    useEffect(() => {
        profileService.getProfile()
            .then(data => {
                if (data?.company?.companyName) setCompanyName(data.company.companyName);
                if (data?.company?.legalAddress) setAddress(data.company.legalAddress);
                if (data?.phoneNumber) setPhone(data.phoneNumber);
                if (data?.email) setEmail(data.email);
            })
            .catch(() => { }); // Fallback to mock defaults
    }, []);

    const handleDocUpload = (index) => {
        const newDocs = [...docs];
        newDocs[index].status = 'uploaded';
        setDocs(newDocs);
        addToast(`Documentul "${docs[index].name}" a fost încărcat.`);
    };

    const saveInfo = async () => {
        try {
            await profileService.updateCompany({ companyName, legalAddress: address });
            addToast('Informațiile companiei au fost salvate pe server.');
        } catch { addToast('Informațiile companiei au fost actualizate local.'); }
    };
    const saveBanking = () => addToast('Datele bancare au fost actualizate.');
    const saveSettings = async () => {
        try {
            await profileService.updatePreferences({ notifEmail, notifSMS, notifPrices, notifOrders, language });
            addToast('Setările au fost salvate pe server.');
        } catch { addToast('Setările au fost salvate local.'); }
    };

    const tabs = [
        { id: 'info', label: 'Informații Generale' },
        { id: 'banking', label: 'Date Bancare' },
        { id: 'docs', label: 'Documente' },
        { id: 'settings', label: 'Setări' },
    ];

    return (
        <div className="page">
            <div className="page-title">Profilul <span>Companiei</span></div>
            <div className="grid-2">
                {/* LEFT COLUMN: Company Card */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{companyName.slice(3, 5).toUpperCase()}</div>
                    <h3>{companyName}</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>CUI: RO12345678</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>CAEN: 4611 — Intermediar Produse Agricole</div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span className="badge badge-green">KYC VERIFICAT ✓</span>
                        <span className="badge badge-green">ANAF Plătitor TVA — Activ</span>
                    </div>
                    <div style={{ color: 'var(--gold-primary)', fontSize: '1.2rem', fontWeight: 600 }}>⭐ 4.8/5 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(128 recenzii)</span></div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Membru din: Ianuarie 2024</div>

                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Statistici Cont</div>
                        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <div><div style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>12</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tranzacții</div></div>
                            <div><div style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>5</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Parteneri</div></div>
                            <div><div style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>2.4M</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>RON Vol.</div></div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Tabs */}
                <div>
                    <div className="tabs">
                        {tabs.map(t => (
                            <div key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>{t.label}</div>
                        ))}
                    </div>

                    {/* TAB: Informații Generale */}
                    {activeTab === 'info' && (
                        <div className="card">
                            <div className="form-group"><label className="form-label">Nume Companie</label><input className="form-input" value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
                            <AddressAutocomplete label="Adresă Sediu" value={address} onChange={setAddress} onSelect={(details) => setAddress(details.address || details.formattedAddress || address)} placeholder="Caută adresa sediului..." />
                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} /></div>
                                <div className="form-group"><label className="form-label">Email Contact</label><input className="form-input" value={email} onChange={e => setEmail(e.target.value)} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Tip Activitate</label><select className="form-select" value={activityType} onChange={e => setActivityType(e.target.value)}><option>Producător Cereale</option><option>Procesator</option><option>Distribuitor</option><option>Fermă Mixtă</option></select></div>
                            <div className="form-group"><label className="form-label">Descriere Companie</label><textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} /></div>
                            <button className="btn btn-gold" onClick={saveInfo}>Salvează Modificările</button>
                        </div>
                    )}

                    {/* TAB: Date Bancare */}
                    {activeTab === 'banking' && (
                        <div className="card">
                            <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1.5rem' }}>Cont Bancar Principal</h4>
                            <div className="grid-2">
                                <div className="form-group"><label className="form-label">IBAN</label><input className="form-input" value={iban} onChange={e => setIban(e.target.value)} /></div>
                                <div className="form-group"><label className="form-label">Bancă</label><input className="form-input" value={bank} onChange={e => setBank(e.target.value)} /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Titular Cont</label><input className="form-input" value={companyName} readOnly style={{ color: 'var(--text-muted)' }} /></div>

                            <h4 style={{ color: 'var(--gold-primary)', margin: '2rem 0 1rem' }}>PSP e-Wallet (Mangopay)</h4>
                            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: '1.25rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 600 }}>Status Wallet</span>
                                    <span className="badge badge-green">● Activ — Verificat KYC</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><span style={{ color: 'var(--text-muted)' }}>vIBAN (Virtual)</span><span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>RO12BREL000AG00001234</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><span style={{ color: 'var(--text-muted)' }}>Sold Disponibil</span><span style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '1.1rem' }}>142,500 RON</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><span style={{ color: 'var(--text-muted)' }}>Fonduri în Escrow</span><span style={{ fontWeight: 600, color: 'var(--red-primary)' }}>291,000 RON</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Fondruri Eliberate (Luna)</span><span style={{ fontWeight: 600 }}>415,435 RON</span></div>
                            </div>

                            <h4 style={{ color: 'var(--gold-primary)', margin: '1.5rem 0 1rem' }}>Istoric Plăți Recente</h4>
                            <table><thead><tr><th>Data</th><th>Descriere</th><th>Sumă</th><th>Tip</th></tr></thead>
                                <tbody>
                                    <tr><td>08.03.2024</td><td>Split Payment — #AGR-2024-002</td><td style={{ color: 'var(--green-badge)' }}>+79,135 RON</td><td><span className="badge badge-green">Credit</span></td></tr>
                                    <tr><td>06.03.2024</td><td>Comision Platformă — #AGR-2024-002</td><td style={{ color: 'var(--red-primary)' }}>-1,665 RON</td><td><span className="badge badge-red">Debit</span></td></tr>
                                    <tr><td>05.03.2024</td><td>Split Payment — #AGR-2024-005</td><td style={{ color: 'var(--green-badge)' }}>+336,300 RON</td><td><span className="badge badge-green">Credit</span></td></tr>
                                    <tr><td>01.03.2024</td><td>Escrow Block — #AGR-2024-001</td><td style={{ color: 'var(--gold-primary)' }}>↔ 150,000 RON</td><td><span className="badge badge-gold">Escrow</span></td></tr>
                                </tbody></table>
                            <button className="btn btn-gold" style={{ marginTop: '1.5rem' }} onClick={saveBanking}>Salvează Datele Bancare</button>
                        </div>
                    )}

                    {/* TAB: Documente */}
                    {activeTab === 'docs' && (
                        <div className="card">
                            <h4 style={{ color: 'var(--gold-primary)', marginBottom: '0.5rem' }}>Documente Companie</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Documentele sunt necesare pentru verificarea KYC/KYB conform regulamentului DAC7.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {docs.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{d.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format acceptat: PDF, JPG, PNG (max 10MB)</div>
                                        </div>
                                        {d.status === 'uploaded' ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span className="badge badge-green">✓ Încărcat</span>
                                                <button className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={() => { const newDocs = [...docs]; newDocs[i].status = 'pending'; setDocs(newDocs); }}>Reîncarcă</button>
                                            </div>
                                        ) : (
                                            <button className="btn btn-gold" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }} onClick={() => handleDocUpload(i)}>📤 Încarcă</button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '2rem', background: 'rgba(212,175,53,0.05)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--gold-primary)' }}>Status Verificare KYC</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toate documentele obligatorii trebuie încărcate</div>
                                    </div>
                                    <div>
                                        {docs.every(d => d.status === 'uploaded') ? (
                                            <span className="badge badge-green" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}>✓ KYC Complet</span>
                                        ) : (
                                            <span className="badge badge-gold" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}>⚠ {docs.filter(d => d.status === 'pending').length} documente lipsă</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: Setări */}
                    {activeTab === 'settings' && (
                        <div className="card">
                            <h4 style={{ color: 'var(--gold-primary)', marginBottom: '1.5rem' }}>Notificări</h4>
                            {[['Notificări Email', notifEmail, setNotifEmail, 'Primește email-uri pentru oferte și comenzi noi'],
                            ['Notificări SMS', notifSMS, setNotifSMS, 'Primește SMS pentru statusuri urgente de livrare'],
                            ['Alerte Prețuri', notifPrices, setNotifPrices, 'Notificări când prețurile se modifică semnificativ'],
                            ['Alerte Comenzi', notifOrders, setNotifOrders, 'Notificări la schimbarea statusului comenzilor'],
                            ].map(([label, val, setter, desc]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div><div style={{ fontWeight: 500 }}>{label}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div></div>
                                    <label style={{ position: 'relative', display: 'inline-block', width: 50, height: 26, cursor: 'pointer' }}>
                                        <input type="checkbox" checked={val} onChange={() => setter(!val)} style={{ opacity: 0, width: 0, height: 0 }} />
                                        <span style={{ position: 'absolute', inset: 0, background: val ? 'var(--green-light)' : 'var(--bg-secondary)', borderRadius: 26, transition: '0.3s', border: '1px solid var(--glass-border)' }}></span>
                                        <span style={{ position: 'absolute', top: 3, left: val ? 26 : 3, width: 20, height: 20, background: '#fff', borderRadius: '50%', transition: '0.3s' }}></span>
                                    </label>
                                </div>
                            ))}

                            <h4 style={{ color: 'var(--gold-primary)', margin: '2rem 0 1rem' }}>Preferințe</h4>
                            <div className="form-group"><label className="form-label">Limba Interfață</label><select className="form-select" value={language} onChange={e => setLanguage(e.target.value)}><option value="ro">🇷🇴 Română</option><option value="en">🇬🇧 English</option></select></div>
                            <div className="form-group"><label className="form-label">Moneda Implicită</label><select className="form-select"><option>RON (Leu Românesc)</option><option>EUR (Euro)</option></select></div>

                            <h4 style={{ color: 'var(--red-primary)', margin: '2rem 0 1rem' }}>Zona Periculoasă</h4>
                            <div style={{ background: 'var(--red-badge)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid rgba(239,68,68,0.3)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div><div style={{ fontWeight: 600 }}>Dezactivează Contul</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contul va fi suspendat. Toate ofertele vor fi dezactivate.</div></div>
                                    <button className="btn btn-red-outline" style={{ fontSize: '0.8rem' }} onClick={() => addToast('Funcționalitate indisponibilă în modul demo.')}>Dezactivează</button>
                                </div>
                            </div>

                            <button className="btn btn-gold" style={{ marginTop: '1.5rem' }} onClick={saveSettings}>Salvează Setările</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
