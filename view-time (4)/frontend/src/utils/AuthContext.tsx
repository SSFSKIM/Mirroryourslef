import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from 'utils/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isInitialized: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isInitialized } = useAuthStore();
  
  const value = {
    isAuthenticated: !!user,
    isInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
