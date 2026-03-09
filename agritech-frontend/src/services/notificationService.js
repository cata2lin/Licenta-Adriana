/**
 * Notification Service — Frontend API for notifications
 */
import api from './api';

const notificationService = {
    /** Get paginated notifications */
    getAll: (page = 1, limit = 20) => api.get(`/notifications?page=${page}&limit=${limit}`),

    /** Get unread count for badge */
    getUnreadCount: () => api.get('/notifications/unread'),

    /** Mark single notification as read */
    markRead: (id) => api.patch(`/notifications/${id}/read`),

    /** Mark all notifications as read */
    markAllRead: () => api.patch('/notifications/read-all'),
};

export default notificationService;
