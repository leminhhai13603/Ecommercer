import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';  // Sửa đúng cú pháp

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decodedToken = jwtDecode(token);

                if (decodedToken.exp * 1000 > Date.now()) {
                    setIsAuthenticated(true);
                    setUser(decodedToken);
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error('Token không hợp lệ:', error);
                localStorage.removeItem('token');
            }
        }

        setLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
