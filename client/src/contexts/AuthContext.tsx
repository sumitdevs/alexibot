import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginApi, registerApi } from '@/api/auth.api';
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated user data - in production, this would come from an API
const MOCK_USERS: { email: string; password: string; name: string }[] = [];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');

    if (storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await loginApi({email, password});
      console.log(result.data);
      setUser(result.data.user);
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      window.postMessage({
        type: "SET_TOKEN",
        token: result.data.token,
        email: result.data.user.email
      });
      return {success: true};
    } catch (errors) {
      return { success: false, error: errors.response.data.message };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await registerApi({name, email, password});
      setUser(result.data.user);
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user))
      window.postMessage({
        type: "SET_TOKEN",
        token: result.data.token
      });
      return result.success;
    } catch (errors) {
      return { success: false, error: errors.response.data.message };
    }
    
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
