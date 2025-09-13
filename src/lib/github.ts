import { Octokit } from '@octokit/rest';

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  location: string;
  blog: string;
  html_url: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  clone_url: string;
  homepage: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
  visibility: string;
  fork: boolean;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export class GitHubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({
      auth: accessToken,
    });
  }

  async getUser(): Promise<GitHubUser> {
    const { data } = await this.octokit.rest.users.getAuthenticated();
    return data as GitHubUser;
  }

  async getUserRepos(page: number = 1, perPage: number = 100): Promise<GitHubRepo[]> {
    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      page,
      per_page: perPage,
      sort: 'updated',
      direction: 'desc',
    });
    return data as GitHubRepo[];
  }

  async getRepoCommits(owner: string, repo: string, page: number = 1, perPage: number = 100): Promise<GitHubCommit[]> {
    const { data } = await this.octokit.rest.repos.listCommits({
      owner,
      repo,
      page,
      per_page: perPage,
    });
    return data as GitHubCommit[];
  }

  async getUserStats(username: string) {
    try {
      // Get user's repositories
      const repos = await this.octokit.rest.repos.listForUser({
        username,
        per_page: 100,
        sort: 'updated',
      });

      // Calculate total stars
      const totalStars = repos.data.reduce((sum: number, repo: { stargazers_count?: number }) => sum + (repo.stargazers_count || 0), 0);

      // Get languages used
      const languages = new Set<string>();
      for (const repo of repos.data.slice(0, 10)) { // Check top 10 repos
        try {
          const { data: repoLanguages } = await this.octokit.rest.repos.listLanguages({
            owner: username,
            repo: repo.name,
          });
          Object.keys(repoLanguages).forEach(lang => languages.add(lang));
        } catch (error) {
          console.warn(`Could not fetch languages for ${repo.name}:`, error);
        }
      }

      return {
        totalRepos: repos.data.length,
        totalStars,
        languages: Array.from(languages),
        publicRepos: repos.data.filter((repo: { private: boolean }) => !repo.private).length,
        privateRepos: repos.data.filter((repo: { private: boolean }) => repo.private).length,
      };
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      return {
        totalRepos: 0,
        totalStars: 0,
        languages: [],
        publicRepos: 0,
        privateRepos: 0,
      };
    }
  }

  async getRecentActivity(username: string, days: number = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100,
      });

      return events.filter((event: { created_at: string | null }) => event.created_at && new Date(event.created_at) >= since);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }
}

// Utility function to get GitHub access token from user's account
export async function getGitHubAccessToken(userId: string) {
  const { prisma } = await import('./prisma');
  
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'github',
    },
  });

  return account?.access_token || null;
}

// Utility function to check if GitHub token is valid
export async function isGitHubTokenValid(accessToken: string): Promise<boolean> {
  try {
    const octokit = new Octokit({ auth: accessToken });
    await octokit.rest.users.getAuthenticated();
    return true;
  } catch (error) {
    console.log('GitHub token validation failed:', error);
    return false;
  }
}

// Utility function to refresh GitHub token if needed
export async function refreshGitHubTokenIfNeeded(userId: string): Promise<string | null> {
  const { prisma } = await import('./prisma');
  
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: 'github',
    },
  });

  if (!account?.access_token) {
    return null;
  }

  // Check if token is still valid
  const isValid = await isGitHubTokenValid(account.access_token);
  if (isValid) {
    return account.access_token;
  }

  // Token is invalid, we need to re-authenticate
  console.log('GitHub token is invalid, user needs to re-authenticate');
  return null;
}

// Utility function to sync user data from GitHub
export async function syncUserFromGitHub(userId: string) {
  const { prisma } = await import('./prisma');
  
  // Check if token is valid and refresh if needed
  const accessToken = await refreshGitHubTokenIfNeeded(userId);
  if (!accessToken) {
    throw new Error('GitHub token is invalid or expired. Please re-authenticate.');
  }

  const githubService = new GitHubService(accessToken);
  
  try {
    // Get user data from GitHub
    const githubUser = await githubService.getUser();
    const userStats = await githubService.getUserStats(githubUser.login);

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: githubUser.name || githubUser.login,
        username: githubUser.login,
        avatar_url: githubUser.avatar_url,
        bio: githubUser.bio,
        location: githubUser.location,
        website: githubUser.blog,
        github_url: githubUser.html_url,
        updated_at: new Date(),
      },
    });

    // Sync repositories as projects
    const repos = await githubService.getUserRepos();
    
    for (const repo of repos.slice(0, 20)) { // Sync top 20 repos
      if (!repo.fork && repo.visibility === 'public') {
        await prisma.project.upsert({
          where: {
            github_url: repo.html_url,
          },
          update: {
            title: repo.name,
            description: repo.description || `Repository: ${repo.name}`,
            github_url: repo.html_url,
            demo_url: repo.homepage,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updated_at: new Date(),
          },
          create: {
            title: repo.name,
            description: repo.description || `Repository: ${repo.name}`,
            github_url: repo.html_url,
            demo_url: repo.homepage,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            user_id: userId,
            is_public: true,
          },
        });
      }
    }

    return {
      user: updatedUser,
      stats: userStats,
      syncedRepos: repos.length,
    };
  } catch (error) {
    console.error('Error syncing user from GitHub:', error);
    throw error;
  }
}
