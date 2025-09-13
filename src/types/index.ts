export interface User {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  location?: string;
  website?: string;
  github_url: string;
  portfolio_enabled: boolean;
  theme: 'light' | 'dark';
  title?: string;
  company?: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
  available: boolean;
  skills: string[];
  experience: Experience[];
  education: Education[];
  achievements: Achievement[];
  stats: UserStats;
}

export interface UserStats {
  repositories: number;
  stars: number;
  followers: number;
  following: number;
  commits: number;
  pullRequests: number;
  issues: number;
  contributions: number;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  field: string;
  school: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  github_url?: string;
  demo_url?: string;
  image_url?: string;
  technologies: string[];
  featured: boolean;
  stars: number;
  forks: number;
  language: string;
  type: 'github' | 'created';
  status: 'planning' | 'active' | 'paused' | 'completed';
  tasks: Task[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
  visibility: 'public' | 'private';
  collaborators: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  created_at: string;
  due_date?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  completed: boolean;
  progress: number;
}

export interface Activity {
  id: string;
  type: 'commit' | 'pr' | 'issue' | 'star' | 'fork' | 'release';
  title: string;
  description?: string;
  repo: string;
  date: string;
  url?: string;
}

// Re-export job types
export * from './jobs';

// Re-export Next.js types
export * from './nextjs';
