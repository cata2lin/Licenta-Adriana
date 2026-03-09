/**
 * Financial Service — Orders & Escrow API integration
 * 
 * Connects to: /financial/orders, /financial/escrow, /financial/stats
 */
import api from './api';

const financialService = {
    // ─── Orders ───
    createOrder: (data) => api.post('/financial/orders', data),
    getOrders: (page = 1, limit = 20) => api.get(`/financial/orders?page=${page}&limit=${limit}`),
    getOrderById: (id) => api.get(`/financial/orders/${id}`),
    updateOrderStatus: (id, data) => api.patch(`/financial/orders/${id}/status`, data),

    // ─── Escrow ───
    fundEscrow: (orderId) => api.post(`/financial/escrow/${orderId}/fund`),
    releaseEscrow: (orderId) => api.post(`/financial/escrow/${orderId}/release`),
    processRefund: (orderId, data) => api.post(`/financial/escrow/${orderId}/refund`, data),

    // ─── Stats ───
    getStats: () => api.get('/financial/stats'),
};

export default financialService;
