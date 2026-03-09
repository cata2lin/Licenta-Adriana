/**
 * Trading Service — Catalog & Spot Market API integration
 * 
 * Connects to: /trading/commodities, /trading/listings
 */
import api from './api';

const tradingService = {
    // ─── Commodities ───
    getCommodities: () => api.get('/trading/commodities'),
    createCommodity: (data) => api.post('/trading/commodities', data),
    updateCommodity: (id, data) => api.patch(`/trading/commodities/${id}`, data),
    deleteCommodity: (id) => api.delete(`/trading/commodities/${id}`),

    // ─── Listings ───
    searchListings: (params = {}) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') query.set(k, v); });
        return api.get(`/trading/listings?${query.toString()}`);
    },
    getMyListings: () => api.get('/trading/listings/mine'),
    getListingById: (id) => api.get(`/trading/listings/${id}`),
    createListing: (data) => api.post('/trading/listings', data),
    updateListing: (id, data) => api.patch(`/trading/listings/${id}`, data),
    deleteListing: (id) => api.delete(`/trading/listings/${id}`),
};

export default tradingService;
