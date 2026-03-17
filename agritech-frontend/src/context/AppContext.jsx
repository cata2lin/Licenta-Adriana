/**
 * AppContext — Global State Management (API-Integrated)
 * 
 * Production approach:
 * - Uses backend API first (via src/services/)
 * - Falls back to localStorage mock data if the API is unavailable
 * - Auth state persisted in localStorage for session persistence
 * 
 * Each domain action is isolated — modifying listing logic won't break orders.
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_LISTINGS } from '../data/listings';
import { MOCK_ORDERS, MOCK_NOTIFICATIONS, PLATFORM_FEES } from '../data/orders';
import { generateOrderId } from '../utils/formatters';
import { authService, tradingService, financialService, notificationService } from '../services';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    // --- Auth State ---
    const [user, setUser] = useLocalStorage('agri_user', null);
    const [token, setTokenState] = useLocalStorage('agri_token', null);

    // --- Domain State ---
    const [listings, setListings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    // --- Toast System ---
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    // --- Fetch Data from API on Login ---
    const fetchAllData = useCallback(async () => {
        if (!user || dataLoaded) return;
        try {
            const [listingsData, ordersData, notifData] = await Promise.allSettled([
                tradingService.getListings(),
                financialService.getOrders(),
                notificationService.getAll(),
            ]);
            setListings(listingsData.status === 'fulfilled' && Array.isArray(listingsData.value) ? listingsData.value : MOCK_LISTINGS);
            setOrders(ordersData.status === 'fulfilled' && Array.isArray(ordersData.value) ? ordersData.value : MOCK_ORDERS);
            setNotifications(notifData.status === 'fulfilled' && Array.isArray(notifData.value) ? notifData.value : MOCK_NOTIFICATIONS);
            setDataLoaded(true);
        } catch {
            // Fallback to mock data
            setListings(MOCK_LISTINGS);
            setOrders(MOCK_ORDERS);
            setNotifications(MOCK_NOTIFICATIONS);
            setDataLoaded(true);
        }
    }, [user, dataLoaded]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    // --- Auth Actions (API-first, fallback to mock) ---
    const login = useCallback(async (email, password, role, companyName) => {
        setIsLoading(true);
        try {
            const result = await authService.login({ email, password });
            const payload = authService.decodeToken(result.access_token);
            setTokenState(result.access_token);
            setUser({
                id: payload.sub,
                email: payload.email,
                role: payload.role,
                companyId: payload.companyId,
                companyName: companyName || 'Compania Mea',
                fullName: email.split('@')[0],
            });
            setDataLoaded(false); // Trigger data fetch
            addToast('Autentificare reușită! Bine ai venit.', 'success');
            return { success: true };
        } catch (err) {
            if (err.isNetworkError) {
                console.warn('[AppContext] Backend unavailable, using mock login');
                setUser({ email, role: role || 'FARMER', companyName: companyName || 'SC AGRO ION SRL', fullName: email.split('@')[0] });
                setDataLoaded(false);
                addToast('Autentificare reușită (mod demo).', 'success');
                return { success: true, mock: true };
            }
            addToast(err.message || 'Eroare la autentificare.', 'error');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [setUser, setTokenState, addToast]);

    const register = useCallback(async (data) => {
        setIsLoading(true);
        try {
            await authService.register(data);
            addToast('Contul a fost creat cu succes! Te poți autentifica.', 'success');
            return { success: true };
        } catch (err) {
            if (err.isNetworkError) {
                addToast('Cont creat (mod demo). Te poți autentifica.', 'success');
                return { success: true, mock: true };
            }
            addToast(err.message || 'Eroare la înregistrare.', 'error');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
        setTokenState(null);
        setDataLoaded(false);
        setListings([]);
        setOrders([]);
        setNotifications([]);
        addToast('Deconectat cu succes.');
    }, [setUser, setTokenState, addToast]);

    // --- Listing Actions (API-first, localStorage fallback) ---
    const addListing = useCallback(async (listing) => {
        try {
            const created = await tradingService.createListing({
                commodityId: listing.commodityId,
                type: listing.type || 'SELL',
                quantity: listing.qty || listing.quantity,
                pricePerUnit: listing.price || listing.pricePerUnit,
                location: listing.location || 'România',
                description: listing.description || '',
                harvestYear: listing.harvestYear || new Date().getFullYear(),
            });
            setListings(prev => [created, ...prev]);
            addToast(`Oferta "${listing.name}" a fost publicată cu succes!`, 'success');
            return created;
        } catch {
            // Fallback to local
            const newListing = {
                ...listing,
                id: Date.now(),
                seller: user?.companyName || 'SC AGRO ION SRL',
                rating: 4.8,
                loc: listing.location || 'România',
                dist: '—',
            };
            setListings(prev => [newListing, ...prev]);
            addToast(`Oferta "${listing.name}" publicată (mod local).`, 'success');
            return newListing;
        }
    }, [user, addToast]);

    const removeListing = useCallback(async (id) => {
        try {
            await tradingService.deactivateListing(id);
        } catch { /* ignore — remove locally anyway */ }
        setListings(prev => prev.filter(l => l.id !== id));
        addToast('Oferta a fost ștearsă.');
    }, [addToast]);

    // --- Order Actions (API-first) ---
    const addNotification = useCallback((text) => {
        setNotifications(prev => [{ id: Date.now(), text, time: 'acum', read: false }, ...prev]);
    }, []);

    const addOrder = useCallback(async (order) => {
        try {
            const created = await financialService.createOrder({
                listingId: order.listingId,
                quantity: order.quantity || order.qty,
                pricePerUnit: order.pricePerUnit || order.price,
                buyerNotes: order.notes || '',
            });
            setOrders(prev => [created, ...prev]);
            addToast('Comandă creată! Fondurile vor fi blocate în Escrow.', 'success');
            addNotification(`Comandă nouă — ${order.product} — ${(order.total || 0).toLocaleString()} RON`);
            return created;
        } catch {
            // Fallback to local mock
            const newOrder = {
                ...order,
                id: generateOrderId(),
                escrow: 'Fonduri Blocate',
                escrowType: 'gold',
                delivery: 'Programat',
                uit: '—',
                timeline: [{ text: 'Contract creat', time: new Date().toLocaleDateString('ro-RO'), done: true }],
                sellerAmount: Math.round((order.total || 0) * PLATFORM_FEES.SELLER_PERCENT),
                transportAmount: Math.round((order.total || 0) * PLATFORM_FEES.TRANSPORT_PERCENT),
                platformFee: Math.round((order.total || 0) * PLATFORM_FEES.PLATFORM_PERCENT),
            };
            setOrders(prev => [newOrder, ...prev]);
            addToast('Comandă creată (mod local)! Fondurile vor fi blocate în Escrow.');
            addNotification(`Comandă nouă — ${order.product} — ${(order.total || 0).toLocaleString()} RON`);
            return newOrder;
        }
    }, [addToast, addNotification]);

    const updateOrderStatus = useCallback(async (id, newStatus, newEscrow) => {
        try {
            await financialService.updateOrderStatus(id, { status: newStatus });
        } catch { /* fallback to local update */ }
        setOrders(prev => prev.map(o => {
            if (o.id !== id) return o;
            return {
                ...o,
                delivery: newStatus || o.delivery,
                escrow: newEscrow || o.escrow,
                escrowType: newEscrow === 'Eliberat' ? 'green' : newEscrow === 'Reținut - Dispută' ? 'red' : o.escrowType,
            };
        }));
        addToast(`Status comandă #${id} actualizat.`);
    }, [addToast]);

    // --- Notification Actions ---
    const markNotificationRead = useCallback(async (id) => {
        try { await notificationService.markRead(id); } catch { /* local-only */ }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    // --- Refresh data ---
    const refreshData = useCallback(() => {
        setDataLoaded(false);
    }, []);

    // --- Context Value ---
    const value = {
        // Auth
        user, login, logout, register, token, isLoading,
        // Listings
        listings, addListing, removeListing,
        // Orders
        orders, addOrder, updateOrderStatus,
        // Notifications
        notifications, addNotification, markNotificationRead,
        // Toasts
        toasts, addToast,
        // Utility
        refreshData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Custom hook to access the app context. Throws if used outside AppProvider. */
export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within an AppProvider');
    return context;
}
