/**
 * API Client — Base HTTP layer for all backend communication.
 * 
 * Features:
 * - Automatic JWT token injection from localStorage
 * - Centralized error handling
 * - Request/response interceptors
 * - Configurable base URL via VITE_API_URL
 * 
 * All domain services (auth, trading, financial, etc.) use this client.
 * Changing the API URL or auth mechanism only requires editing this file.
 */

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

/**
 * Get the stored JWT token.
 */
function getToken() {
    const tokenStr = localStorage.getItem('agri_token');
    if (!tokenStr) return null;
    try { return JSON.parse(tokenStr); } catch { return tokenStr; }
}

/**
 * Set the JWT token in localStorage.
 */
export function setToken(token) {
    localStorage.setItem('agri_token', JSON.stringify(token));
}

/**
 * Clear the JWT token.
 */
export function clearToken() {
    localStorage.removeItem('agri_token');
}

/**
 * Core fetch wrapper with JWT injection and error handling.
 * @param {string} endpoint - API path (e.g., '/iam/login')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<any>} Parsed JSON response
 */
async function request(endpoint, options = {}) {
    const token = getToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...options,
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Handle 204 No Content
        if (response.status === 204) return null;

        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || `HTTP ${response.status}`);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (error) {
        // Network errors or JSON parse errors
        if (!error.status) {
            error.message = 'Nu se poate conecta la server. Verifică conexiunea.';
            error.isNetworkError = true;
        }
        throw error;
    }
}

// ─── HTTP Method Shortcuts ───

export const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
    patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default api;
