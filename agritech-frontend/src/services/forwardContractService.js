/**
 * Forward Contract Service — Frontend API
 * 
 * Connects the Contracts.jsx page to the backend forward contracts API.
 */
import api from './api';

const forwardContractService = {
    /** Get all forward contracts for current company */
    getAll: () => api.get('/trading/forward-contracts'),

    /** Get single contract by ID */
    getById: (id) => api.get(`/trading/forward-contracts/${id}`),

    /** Create a new forward contract */
    create: (data) => api.post('/trading/forward-contracts', data),

    /** Update forward contract status */
    updateStatus: (id, status) => api.patch(`/trading/forward-contracts/${id}/status`, { status }),

    /** Generate invoice for a contract */
    generateInvoice: (id) => api.get(`/trading/forward-contracts/${id}/invoice`),

    /** Get forward contract stats */
    getStats: () => api.get('/trading/forward-contracts/stats/summary'),
};

export default forwardContractService;
