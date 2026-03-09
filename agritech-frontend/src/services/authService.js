/**
 * Auth Service — IAM API integration
 * 
 * Connects to: POST /iam/register, POST /iam/login
 * Manages JWT token lifecycle.
 */
import api, { setToken, clearToken } from './api';

const authService = {
    /**
     * Register a new user with ANAF CUI validation.
     * @param {{ email, password, fullName, role, phoneNumber?, cui?, companyName?, legalAddress? }} data
     */
    async register(data) {
        const result = await api.post('/iam/register', data);
        return result;
    },

    /**
     * Login and store JWT token.
     * @param {{ email, password }} credentials
     * @returns {{ access_token: string }}
     */
    async login(credentials) {
        const result = await api.post('/iam/login', credentials);
        if (result.access_token) {
            setToken(result.access_token);
        }
        return result;
    },

    /** Clear session */
    logout() {
        clearToken();
    },

    /** Decode JWT payload (without verification — that's server-side) */
    decodeToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch {
            return null;
        }
    },
};

export default authService;
