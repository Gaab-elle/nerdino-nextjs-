// Types for Jobs/Opportunities System

export interface JobData {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  salary?: { min: number; max: number };
  experience: string;
  contractType: string;
  technologies: string[];
  description: string;
  postedAt: string;
  isNew: boolean;
  isUrgent: boolean;
  matchScore?: number;
  matchBreakdown?: {
    skills: number;
    experience: number;
    location: number;
  };
  userApplied: boolean;
  userFavorited: boolean;
  url: string;
  date: string;
}

export interface CompatibleJob {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote: boolean;
  salary?: { min: number; max: number };
  experience: string;
  contractType: string;
  technologies: string[];
  description: string;
  postedAt: string;
  isNew: boolean;
  isUrgent: boolean;
  matchScore: number;
  matchBreakdown: {
    skills: number;
    experience: number;
    location: number;
  };
  userApplied: boolean;
  userFavorited: boolean;
  url: string;
  source?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  technologies: string[];
  experience: string;
  salary?: {
    min: number;
    max: number;
  };
  remote: boolean;
  url: string;
  date: string;
  matchScore?: number;
  matchBreakdown?: {
    skills: number;
    experience: number;
    location: number;
  };
}

export interface UserProfile {
  skills: string[];
  experience: string;
  location: string;
  available: boolean;
}

export interface OpportunitiesResponse {
  success: boolean;
  data: JobData[];
  pagination: {
    page: number;
    hasMore: boolean;
    total: number;
    pageSize: number;
    totalPages: number;
  };
  source: string;
  error?: string;
}

export interface UseOpportunitiesOptions {
  userSkills?: string[];
  source?: 'infojobs' | 'themuse' | 'adzuna' | 'mock';
  autoFetch?: boolean;
}

// Job Filters
export interface JobFilters {
  search?: string;
  location?: string;
  experience?: string;
  technologies?: string[];
  salaryMin?: number;
  salaryMax?: number;
  contractType?: string;
  stack?: string;
  sortBy?: string;
}

// Job Market Analysis
export interface MarketData {
  trendingTechnologies: string[];
  averageSalaries: {
    [technology: string]: {
      min: number;
      max: number;
      average: number;
    };
  };
  jobDemand: {
    [technology: string]: number;
  };
  locationTrends: {
    [location: string]: number;
  };
  experienceLevels: {
    [level: string]: number;
  };
}

// Job Application
export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'accepted';
  notes?: string;
  resumeUrl?: string;
  coverLetter?: string;
}

// Job Statistics
export interface JobStats {
  totalJobs: number;
  appliedJobs: number;
  favoriteJobs: number;
  compatibleJobs: number;
  averageMatchScore: number;
  topTechnologies: Array<{
    technology: string;
    count: number;
  }>;
  locationDistribution: Array<{
    location: string;
    count: number;
  }>;
  salaryDistribution: {
    min: number;
    max: number;
    average: number;
  };
}

// Job Sources
export interface JobSource {
  id: string;
  name: string;
  url: string;
  apiEndpoint?: string;
  enabled: boolean;
  lastSync?: string;
  jobCount: number;
  reliability: number;
}

// Job Alerts
export interface JobAlert {
  id: string;
  userId: string;
  name: string;
  criteria: {
    technologies?: string[];
    location?: string;
    experience?: string;
    salaryMin?: number;
    salaryMax?: number;
    contractType?: string;
    remote?: boolean;
  };
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
  notificationCount: number;
}
