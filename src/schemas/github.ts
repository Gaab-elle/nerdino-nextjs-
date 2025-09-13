import { z } from "zod";

// GitHub API Response Schemas
export const GithubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  html_url: z.string().url(),
  followers: z.number(),
  following: z.number(),
  public_repos: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  blog: z.string().nullable().optional(),
  twitter_username: z.string().nullable().optional(),
});

export const GithubRepoSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean(),
  html_url: z.string().url(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
  owner: z.object({
    login: z.string(),
    id: z.number(),
  }),
  topics: z.array(z.string()).optional(),
  size: z.number().optional(),
  default_branch: z.string().optional(),
});

export const GithubActivitySchema = z.object({
  id: z.string(),
  type: z.string(),
  repo: z.object({
    name: z.string(),
    url: z.string(),
  }),
  created_at: z.string(),
  actor: z.object({
    login: z.string(),
    avatar_url: z.string().nullable(),
  }).optional(),
});

export const GithubStatsSchema = z.object({
  totalRepos: z.number(),
  totalStars: z.number(),
  totalForks: z.number(),
  languages: z.record(z.string(), z.number()),
  mostUsedLanguage: z.string().optional(),
  averageStarsPerRepo: z.number().optional(),
});

// DTOs (Data Transfer Objects) - raw API responses
export type GithubUserDTO = z.infer<typeof GithubUserSchema>;
export type GithubRepoDTO = z.infer<typeof GithubRepoSchema>;
export type GithubActivityDTO = z.infer<typeof GithubActivitySchema>;
export type GithubStatsDTO = z.infer<typeof GithubStatsSchema>;

// Internal Models - normalized data
export type GithubUser = {
  id: number;
  login: string;
  name: string;
  email: string;
  avatarUrl: string;
  profileUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  updatedAt: string;
  bio: string;
  location: string;
  company: string;
  website: string;
  twitter: string;
};

export type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  createdAt: string;
  updatedAt: string;
  ownerLogin: string;
  topics: string[];
  size: number;
  defaultBranch: string;
};

export type GithubActivity = {
  id: string;
  type: string;
  repoName: string;
  repoUrl: string;
  date: string;
  actorLogin: string;
  actorAvatar: string;
};

export type GithubStats = {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  languages: Record<string, number>;
  mostUsedLanguage: string;
  averageStarsPerRepo: number;
};

// Type Guards
export function isGithubUser(obj: unknown): obj is GithubUserDTO {
  return GithubUserSchema.safeParse(obj).success;
}

export function isGithubRepo(obj: unknown): obj is GithubRepoDTO {
  return GithubRepoSchema.safeParse(obj).success;
}

export function isGithubActivity(obj: unknown): obj is GithubActivityDTO {
  return GithubActivitySchema.safeParse(obj).success;
}

export function isGithubStats(obj: unknown): obj is GithubStatsDTO {
  return GithubStatsSchema.safeParse(obj).success;
}

// Validation helpers
export function validateGithubUser(data: unknown): GithubUserDTO {
  const result = GithubUserSchema.safeParse(data);
  if (!result.success) {
    console.error('GitHub user validation failed:', result.error);
    throw new Error('Invalid GitHub user data');
  }
  return result.data;
}

export function validateGithubRepo(data: unknown): GithubRepoDTO {
  const result = GithubRepoSchema.safeParse(data);
  if (!result.success) {
    console.error('GitHub repo validation failed:', result.error);
    throw new Error('Invalid GitHub repo data');
  }
  return result.data;
}

export function validateGithubActivity(data: unknown): GithubActivityDTO {
  const result = GithubActivitySchema.safeParse(data);
  if (!result.success) {
    console.error('GitHub activity validation failed:', result.error);
    throw new Error('Invalid GitHub activity data');
  }
  return result.data;
}
