'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to check localStorage

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUser: User = {
      id: '1',
      username: 'gabriel_silva',
      name: 'Gabriel Silva',
      bio: 'Desenvolvedor apaixonado por tecnologia',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      location: 'São Paulo, Brasil',
      website: 'https://gabriel.dev',
      github_url: 'https://github.com/gabriel',
      portfolio_enabled: true,
      theme: 'light',
      title: 'Full Stack Developer & Tech Lead',
      company: 'TechCorp Solutions',
      email: email,
      available: true,
      skills: ['React', 'TypeScript', 'Node.js', 'Python'],
      experience: [],
      education: [],
      achievements: [],
      stats: {
        repositories: 25,
        stars: 150,
        followers: 45,
        following: 120,
        commits: 1250,
        pullRequests: 85,
        issues: 32,
        contributions: 450
      }
    };

    setUser(mockUser);
    // Save user to localStorage for persistence
    localStorage.setItem('user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    // Remove user from localStorage
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
