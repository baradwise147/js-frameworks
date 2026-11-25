import {ReactNode} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export function ProtectedRoute({children}: {children: ReactNode}) {
    const {isAuthenticated, loading} = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="state" role="status">
                Перевіряємо авторизацію…
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace state={{from: location.pathname}} />;
    }

    return <>{children}</>;
}
