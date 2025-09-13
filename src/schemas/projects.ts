import { z } from "zod";

// Project Schema
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'archived']).optional(),
  progress: z.number().min(0).max(100).optional(),
  technologies: z.array(z.string()).optional(),
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  lastActivity: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  userId: z.string().optional(),
  isPublic: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

// GitHub Stats Schema
export const GitHubStatsSchema = z.object({
  stats: z.object({
    languages: z.record(z.string(), z.number()).optional(),
    totalRepos: z.number().optional(),
    totalStars: z.number().optional(),
    totalForks: z.number().optional(),
    totalCommits: z.number().optional(),
  }).optional(),
  repos: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    language: z.string().optional(),
    stargazers_count: z.number().optional(),
    forks_count: z.number().optional(),
    html_url: z.string().url().optional(),
    updated_at: z.string().optional(),
  })).optional(),
});

// Share Project Data Schema
export const ShareProjectDataSchema = z.object({
  includeTechnologies: z.boolean().optional(),
  includeStatus: z.boolean().optional(),
  includeProgress: z.boolean().optional(),
  includeLinks: z.boolean().optional(),
  customMessage: z.string().optional(),
});

// DTOs (Data Transfer Objects)
export type ProjectDTO = z.infer<typeof ProjectSchema>;
export type GitHubStatsDTO = z.infer<typeof GitHubStatsSchema>;
export type ShareProjectDataDTO = z.infer<typeof ShareProjectDataSchema>;

// Internal Models (normalized)
export type Project = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  progress: number;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isPublic: boolean;
  imageUrl?: string;
  tags: string[];
};

export type GitHubStats = {
  stats: {
    languages: Record<string, number>;
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    totalCommits: number;
  };
  repos: Array<{
    name: string;
    description: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    html_url: string;
    updated_at: string;
  }>;
};

export type ShareProjectData = {
  includeTechnologies: boolean;
  includeStatus: boolean;
  includeProgress: boolean;
  includeLinks: boolean;
  customMessage: string;
};

// Type Guards
export function isProject(obj: unknown): obj is ProjectDTO {
  return ProjectSchema.safeParse(obj).success;
}

export function isGitHubStats(obj: unknown): obj is GitHubStatsDTO {
  return GitHubStatsSchema.safeParse(obj).success;
}

export function isShareProjectData(obj: unknown): obj is ShareProjectDataDTO {
  return ShareProjectDataSchema.safeParse(obj).success;
}

// Validation helpers
export function validateProject(data: unknown): ProjectDTO {
  const result = ProjectSchema.safeParse(data);
  if (!result.success) {
    console.error('Project validation failed:', result.error);
    throw new Error('Invalid project data');
  }
  return result.data;
}

export function validateGitHubStats(data: unknown): GitHubStatsDTO {
  const result = GitHubStatsSchema.safeParse(data);
  if (!result.success) {
    console.error('GitHub stats validation failed:', result.error);
    throw new Error('Invalid GitHub stats data');
  }
  return result.data;
}

export function validateShareProjectData(data: unknown): ShareProjectDataDTO {
  const result = ShareProjectDataSchema.safeParse(data);
  if (!result.success) {
    console.error('Share project data validation failed:', result.error);
    throw new Error('Invalid share project data');
  }
  return result.data;
}
