/**
 * Constantes centralizadas do aplicativo
 */

export const APP_CONFIG = {
  name: 'Nerdino',
  description: 'Plataforma para desenvolvedores se conectarem e crescerem',
  version: '1.0.0',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
} as const;

export const ROUTES = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CREATE_ACCOUNT: '/auth/create-account',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  PROFILE: '/dashboard/profile',
  PROJECTS: '/dashboard/projects',
  OPPORTUNITIES: '/dashboard/opportunities',
  COMMUNITY: '/dashboard/community',
  MESSAGES: '/dashboard/messages',
  SETTINGS: '/dashboard/settings',
  
  // Public
  HOME: '/',
  GAME: '/game',
} as const;

export const API_ROUTES = {
  // Auth
  AUTH: '/api/auth',
  
  // Users
  USERS: '/api/users',
  
  // Projects
  PROJECTS: '/api/projects',
  
  // Opportunities
  OPPORTUNITIES: '/api/opportunities',
  
  // Community
  POSTS: '/api/posts',
  COMMENTS: '/api/comments',
  
  // Messages
  MESSAGES: '/api/messages',
  CONVERSATIONS: '/api/conversations',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
  
  // GitHub
  GITHUB: '/api/github',
  
  // Upload
  UPLOAD: '/api/upload',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
} as const;

export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

export const THEME = {
  COLORS: {
    PRIMARY: '#3b82f6',
    SECONDARY: '#64748b',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#06b6d4',
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
} as const;

export const GITHUB = {
  API_BASE_URL: 'https://api.github.com',
  DEFAULT_PER_PAGE: 30,
  MAX_PER_PAGE: 100,
} as const;

export const NOTIFICATIONS = {
  TYPES: {
    MESSAGE: 'message',
    OPPORTUNITY: 'opportunity',
    PROJECT: 'project',
    SYSTEM: 'system',
  },
  PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
} as const;
