/**
 * Review Service — Frontend API for company reviews
 * 
 * Connects to:
 * - POST   /profile/reviews           → Create review
 * - GET    /profile/reviews/:companyId → Get company reviews
 * - DELETE /profile/reviews/:id       → Delete own review
 */
import api from './api';

const reviewService = {
    /** Create a new review for a company */
    createReview: (data) => api.post('/profile/reviews', data),

    /** Get all reviews for a company (includes stats + distribution) */
    getCompanyReviews: (companyId) => api.get(`/profile/reviews/${companyId}`),

    /** Delete own review */
    deleteReview: (reviewId) => api.delete(`/profile/reviews/${reviewId}`),
};

export default reviewService;
