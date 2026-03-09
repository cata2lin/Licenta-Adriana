/**
 * Profile Service — Frontend API for user/company profile
 */
import api from './api';

const profileService = {
    /** Get own profile (user + company) */
    getProfile: () => api.get('/profile'),

    /** Update company details */
    updateCompany: (data) => api.patch('/profile/company', data),

    /** Update user preferences */
    updatePreferences: (data) => api.patch('/profile/prefs', data),
};

export default profileService;
