/**
 * Analytics Service — Commodity market analytics API
 */
import api from './api';

const analyticsService = {
    /** Get all commodities with brief stats */
    getCommodities: () => api.get('/analytics/commodities'),

    /** Get full analytics for a single commodity */
    getCommodityAnalytics: (name) => api.get(`/analytics/commodity?name=${encodeURIComponent(name)}`),
};

export default analyticsService;
