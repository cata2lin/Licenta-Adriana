/**
 * ProtectedRoute — Guards authenticated routes
 * 
 * Redirects to /login if no auth token exists.
 * Shows the wrapped component if authenticated.
 */
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children }) {
    const { user } = useApp();
    if (!user) return <Navigate to="/login" replace />;
    return children;
}
