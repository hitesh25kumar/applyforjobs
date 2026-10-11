import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from 'firebase/auth';
import { auth, signOut as firebaseSignOut } from '../firebase/auth';
import apiClient from '../api/client';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user);

            if (user) {
                // Get Firebase ID token and set it for API calls
                const token = await user.getIdToken();
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Register/sync user with backend
                try {
                    await apiClient.post('/auth/register', {
                        firebaseUid: user.uid,
                        email: user.email,
                        firstName: user.displayName?.split(' ')[0] || '',
                        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                        photoURL: user.photoURL || '',
                    });
                } catch (error) {
                    console.error('Failed to sync user with backend:', error);
                }
            } else {
                // Remove auth token if user logged out
                delete apiClient.defaults.headers.common['Authorization'];
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        await firebaseSignOut();
        setCurrentUser(null);
        delete apiClient.defaults.headers.common['Authorization'];
    };

    const value = {
        currentUser,
        loading,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
