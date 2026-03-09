/**
 * Transport Service — Shipping & Routing API integration
 * 
 * Connects to: /transport/shipments, /transport/route, /transport/bidding
 */
import api from './api';

const transportService = {
    // ─── Shipments ───
    createShipment: (data) => api.post('/transport/shipments', data),
    getShipments: (page = 1, limit = 20) => api.get(`/transport/shipments?page=${page}&limit=${limit}`),
    getShipmentById: (id) => api.get(`/transport/shipments/${id}`),
    updateShipmentStatus: (id, data) => api.patch(`/transport/shipments/${id}/status`, data),
    assignTransporter: (id, data) => api.post(`/transport/shipments/${id}/assign`, data),

    // ─── Routing ───
    calculateRoute: (data) => api.post('/transport/route/calculate', data),

    // ─── Bidding ───
    simulateBidding: (shipmentId) => api.post(`/transport/bidding/${shipmentId}`),

    // ─── Stats ───
    getStats: () => api.get('/transport/stats'),
};

export default transportService;
