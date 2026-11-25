import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {authApi, getStoredToken, setStoredToken} from '../api/propertiesApi';
import {AuthUser} from '../types/property';

export interface AuthContextValue {
    user: AuthUser | null;
    token: string;
    loading: boolean;
    isAuthenticated: boolean;
    login: (userName: string, password: string) => Promise<void>;
    register: (userName: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
    const [token, setToken] = useState<string>(() => getStoredToken());
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(() => Boolean(getStoredToken()));

    useEffect(() => {
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        authApi
            .me()
            .then(current => {
                if (!cancelled) setUser(current);
            })
            .catch(() => {
                if (!cancelled) {
                    setStoredToken('');
                    setToken('');
                    setUser(null);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [token]);

    const login = useCallback(async (userName: string, password: string) => {
        const res = await authApi.login(userName, password);
        setStoredToken(res.token);
        setToken(res.token);
        setUser(res.user);
    }, []);

    const register = useCallback(async (userName: string, password: string) => {
        const res = await authApi.register(userName, password);
        setStoredToken(res.token);
        setToken(res.token);
        setUser(res.user);
    }, []);

    const logout = useCallback(() => {
        setStoredToken('');
        setToken('');
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            token,
            loading,
            isAuthenticated: Boolean(token && user),
            login,
            register,
            logout
        }),
        [user, token, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
