import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, AuthResponse } from "../types";
import { API_URL } from "@env";
import axios from "axios";

const TOKEN_STORAGE_KEY = '@auth_jwt_token';
let globalAuthToken: string | null = null;

export const getAuthToken = (): string | null => globalAuthToken;

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    clearError: () => void;
    login: (username: string, password: string) => Promise<boolean>;
    register: (username: string, email: string, password: string, phone?: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(globalAuthToken);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    const saveAuthSession = async (newToken: string | null, newUser: User | null) => {
        globalAuthToken = newToken;
        setToken(newToken);
        setUser(newUser);

        try {
            if (newToken) {
                await AsyncStorage.setItem(TOKEN_STORAGE_KEY, newToken);
            } else {
                await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
            }
        } catch (error) {
            console.error('Error saving auth session:', error);
        }
    }

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

                if (!storedToken) {
                    globalAuthToken = null;
                    setToken(null);
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                globalAuthToken = storedToken;
                setToken(storedToken);

                // Validate token with backend /api/user/me
                const response = await axios.get(`${API_URL}/user/auth`, {
                    headers: {
                        Authorization: `Bearer ${storedToken}`
                    }
                });

                const resData: any = response.data;
                const fetchedUser = resData.data?.user || resData.data;

                if (response.status === 200 && fetchedUser && (fetchedUser.id || fetchedUser.username)) {
                    setUser(fetchedUser);
                } else {
                    await saveAuthSession(null, null);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                await saveAuthSession(null, null);
            } finally {
                setIsLoading(false);
            }
        }
        checkAuth();
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        setError(null);

        try {
            const response = await axios.post<AuthResponse>(
                `${API_URL}/user/login`,
                { username, password }
            )
            const resData: AuthResponse = response.data;

            if (response.status !== 200) {
                const errorMsg = resData.message || (resData as any).error || 'Invalid Credentials';
                setError(errorMsg);
                return false;
            }

            const receivedToken = resData.token;
            const receivedUser = resData.data?.user || null;

            if (!receivedToken || !receivedUser) {
                setError('Token or user data missing in server response');
                return false;
            }

            await saveAuthSession(receivedToken, receivedUser);
            return true;
        } catch (error: any) {
            console.log('Login error:', error);
            setError(error.response?.data?.message || error.message || 'Network request failed. Is your backend server running?');
            return false;
        }
    }

    const register = async (username: string, email: string, password: string, phone?: string): Promise<boolean> => {
        setError(null);

        try {
            const response = await axios.post<AuthResponse>(
                `${API_URL}/user/register`,
                { username, email, password, phone }
            )
            const resData: AuthResponse = response.data;

            if (response.status !== 201) {
                const errorMsg = resData.message || (resData as any).error || 'Registration failed';
                setError(errorMsg);
                return false;
            }

            const receivedToken = resData.token;
            const receivedUser = resData.data?.user || null;

            if (!receivedToken || !receivedUser) {
                setError('Token or user data missing in server response');
                return false;
            }

            await saveAuthSession(receivedToken, receivedUser);
            return true;
        } catch (error: any) {
            console.error('Registration error:', error);
            setError(error.response?.data?.message || error.message || 'Network request failed. Is your backend server running?');
            return false;
        }
    }

    const logout = async () => {
        await saveAuthSession(null, null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                error,
                clearError,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context
}