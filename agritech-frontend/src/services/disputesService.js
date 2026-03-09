/**
 * Disputes Service — Quality Disputes & ADR API integration
 * 
 * Connects to: /disputes, /disputes/:id/messages, /disputes/:id/propose, etc.
 */
import api from './api';

const disputesService = {
    // ─── Disputes ───
    openDispute: (data) => api.post('/disputes', data),
    getDisputes: (page = 1, limit = 20) => api.get(`/disputes?page=${page}&limit=${limit}`),
    getDisputeById: (id) => api.get(`/disputes/${id}`),

    // ─── Chat ───
    sendMessage: (disputeId, content) => api.post(`/disputes/${disputeId}/messages`, { content }),
    getMessages: (disputeId) => api.get(`/disputes/${disputeId}/messages`),

    // ─── Resolution ───
    proposeResolution: (disputeId, refundPercent, message) =>
        api.post(`/disputes/${disputeId}/propose`, { refundPercent, message }),
    acceptResolution: (disputeId) => api.post(`/disputes/${disputeId}/accept`),
    escalateToADR: (disputeId) => api.post(`/disputes/${disputeId}/escalate`),

    // ─── Stats ───
    getStats: () => api.get('/disputes/stats'),
};

export default disputesService;
