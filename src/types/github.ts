import { z } from "zod";

// GitHub API Schemas
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
});

export const GithubActivitySchema = z.object({
  type: z.string(),
  repo: z.object({
    name: z.string(),
    url: z.string(),
  }),
  created_at: z.string(),
});

// Internal Models
export type GithubUserDTO = z.infer<typeof GithubUserSchema>;
export type GithubRepoDTO = z.infer<typeof GithubRepoSchema>;
export type GithubActivityDTO = z.infer<typeof GithubActivitySchema>;

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
};

export type GithubActivity = {
  type: string;
  repoName: string;
  repoUrl: string;
  date: string;
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
