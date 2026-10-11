import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { authApi } from '../../api/auth.api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) => Promise<User>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('ch_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ch_access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && response.data.user) {
          setUser(response.data.user);
          localStorage.setItem('ch_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.error('Session initialization error:', err);
        // If getting me fails completely, localStorage tokens will be cleared by interceptor if expired
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const res = await authApi.login(credentials);
    const { user: loggedInUser, accessToken, refreshToken } = res.data;

    localStorage.setItem('ch_access_token', accessToken);
    localStorage.setItem('ch_refresh_token', refreshToken);
    localStorage.setItem('ch_user', JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }): Promise<User> => {
    const res = await authApi.register(data);
    const { user: registeredUser, accessToken, refreshToken } = res.data;

    localStorage.setItem('ch_access_token', accessToken);
    localStorage.setItem('ch_refresh_token', refreshToken);
    localStorage.setItem('ch_user', JSON.stringify(registeredUser));

    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('ch_refresh_token') || undefined;
      await authApi.logout(refreshToken);
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      localStorage.removeItem('ch_access_token');
      localStorage.removeItem('ch_refresh_token');
      localStorage.removeItem('ch_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
