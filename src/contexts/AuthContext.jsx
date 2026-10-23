import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            setToken(null);
        };
        window.addEventListener('nutri:unauthorized', handleUnauthorized);

        const savedToken = localStorage.getItem('nutri_token');
        const savedUser = localStorage.getItem('nutri_user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('nutri_token');
                localStorage.removeItem('nutri_user');
            }
        }

        setLoading(false);

        return () => window.removeEventListener('nutri:unauthorized', handleUnauthorized);
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('nutri_token', authToken);
        localStorage.setItem('nutri_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('nutri_token');
        localStorage.removeItem('nutri_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            isAuthenticated: Boolean(token),
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
