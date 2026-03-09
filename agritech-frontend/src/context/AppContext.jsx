/**
 * AppContext — Global State Management (API-Integrated)
 * 
 * Hybrid approach:
 * - Tries to use the backend API first (via src/services/)
 * - Falls back to localStorage mock data if the API is unavailable
 * - This allows the app to work both standalone (demo) and connected to NestJS
 * 
 * Each domain action is isolated — modifying listing logic won't break orders.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MOCK_LISTINGS } from '../data/listings';
import { MOCK_ORDERS, MOCK_NOTIFICATIONS, PLATFORM_FEES } from '../data/orders';
import { generateOrderId } from '../utils/formatters';
import { authService } from '../services';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    // --- Auth State ---
    const [user, setUser] = useLocalStorage('agri_user', null);
    const [token, setTokenState] = useLocalStorage('agri_token', null);

    // --- Domain State (localStorage fallback when API unavailable) ---
    const [listings, setListings] = useLocalStorage('agri_listings', MOCK_LISTINGS);
    const [orders, setOrders] = useLocalStorage('agri_orders', MOCK_ORDERS);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [toasts, setToasts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // --- Toast System ---
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    // --- Auth Actions (API-first, fallback to mock) ---

    /**
     * Login via API. Falls back to mock auth if backend is down.
     * @returns {{ success: boolean, error?: string }}
     */
    const login = useCallback(async (email, password, role, companyName) => {
        setIsLoading(true);
        try {
            // Try real API first
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
            addToast('Autentificare reușită! Bine ai venit.', 'success');
            return { success: true };
        } catch (err) {
            // Fallback to mock login for demo/dev purposes
            if (err.isNetworkError) {
                console.warn('[AppContext] Backend unavailable, using mock login');
                setUser({ email, role: role || 'FARMER', companyName: companyName || 'SC AGRO ION SRL', fullName: email.split('@')[0] });
                addToast('Autentificare reușită (mod demo).', 'success');
                return { success: true, mock: true };
            }
            addToast(err.message || 'Eroare la autentificare.', 'error');
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    }, [setUser, setTokenState, addToast]);

    /**
     * Register via API. Falls back to mock if backend is down.
     */
    const register = useCallback(async (data) => {
        setIsLoading(true);
        try {
            await authService.register(data);
            addToast('Contul a fost creat cu succes! Te poți autentifica.', 'success');
            return { success: true };
        } catch (err) {
            if (err.isNetworkError) {
                console.warn('[AppContext] Backend unavailable, using mock register');
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
        addToast('Deconectat cu succes.');
    }, [setUser, setTokenState, addToast]);

    // --- Listing Actions (localStorage — will be replaced with API calls) ---
    const addListing = useCallback((listing) => {
        const newListing = {
            ...listing,
            id: Date.now(),
            seller: user?.companyName || 'SC AGRO ION SRL',
            rating: 4.8,
            loc: listing.location || 'România',
            dist: '—',
        };
        setListings(prev => [newListing, ...prev]);
        addToast(`Oferta "${listing.name}" a fost publicată cu succes!`);
    }, [user, setListings, addToast]);

    const removeListing = useCallback((id) => {
        setListings(prev => prev.filter(l => l.id !== id));
        addToast('Oferta a fost ștearsă.');
    }, [setListings, addToast]);

    // --- Order Actions ---
    const addNotification = useCallback((text) => {
        setNotifications(prev => [{ id: Date.now(), text, time: 'acum', read: false }, ...prev]);
    }, []);

    const addOrder = useCallback((order) => {
        const newOrder = {
            ...order,
            id: generateOrderId(),
            escrow: 'Fonduri Blocate',
            escrowType: 'gold',
            delivery: 'Programat',
            uit: '—',
            timeline: [{ text: 'Contract creat', time: new Date().toLocaleDateString('ro-RO'), done: true }],
            sellerAmount: Math.round(order.total * PLATFORM_FEES.SELLER_PERCENT),
            transportAmount: Math.round(order.total * PLATFORM_FEES.TRANSPORT_PERCENT),
            platformFee: Math.round(order.total * PLATFORM_FEES.PLATFORM_PERCENT),
        };
        setOrders(prev => [newOrder, ...prev]);
        addToast('Comandă creată! Fondurile vor fi blocate în Escrow.');
        addNotification(`Comandă nouă — ${order.product} — ${order.total.toLocaleString()} RON`);
    }, [setOrders, addToast, addNotification]);

    const updateOrderStatus = useCallback((id, newStatus, newEscrow) => {
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
    }, [setOrders, addToast]);

    // --- Notification Actions ---
    const markNotificationRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Custom hook to access the app context. Throws if used outside AppProvider. */
export function useApp() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within an AppProvider');
    return context;
}
