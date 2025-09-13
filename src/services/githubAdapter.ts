import { 
  GithubUserDTO, 
  GithubRepoDTO, 
  GithubActivityDTO,
  GithubUser, 
  GithubRepo, 
  GithubActivity,
  isGithubUser,
  isGithubRepo,
  isGithubActivity
} from '@/types/github';

export class GitHubAdapter {
  static normalizeUser(dto: unknown): GithubUser {
    if (!isGithubUser(dto)) {
      throw new Error('Invalid GitHub user data');
    }

    return {
      id: dto.id,
      login: dto.login,
      name: dto.name || 'Usuário GitHub',
      email: dto.email || '',
      avatarUrl: dto.avatar_url || '',
      profileUrl: dto.html_url,
      followers: dto.followers,
      following: dto.following,
      publicRepos: dto.public_repos,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
    };
  }

  static normalizeRepo(dto: unknown): GithubRepo {
    if (!isGithubRepo(dto)) {
      throw new Error('Invalid GitHub repo data');
    }

    return {
      id: dto.id,
      name: dto.name,
      fullName: dto.full_name,
      url: dto.html_url,
      description: dto.description || '',
      language: dto.language || 'Unknown',
      stars: dto.stargazers_count,
      forks: dto.forks_count,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
      ownerLogin: dto.owner.login,
    };
  }

  static normalizeActivity(dto: unknown): GithubActivity {
    if (!isGithubActivity(dto)) {
      throw new Error('Invalid GitHub activity data');
    }

    return {
      type: dto.type,
      repoName: dto.repo.name,
      repoUrl: dto.repo.url,
      date: dto.created_at,
    };
  }

  static normalizeUserStats(user: GithubUser, repos: GithubRepo[], activities: GithubActivity[]) {
    const languages = repos.reduce((acc, repo) => {
      if (repo.language && repo.language !== 'Unknown') {
        acc[repo.language] = (acc[repo.language] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalStars = repos.reduce((sum, repo) => sum + repo.stars, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks, 0);

    return {
      user,
      stats: {
        totalRepos: repos.length,
        totalStars,
        totalForks,
        totalCommits: activities.length,
        languages,
      },
      recentActivity: activities.map(activity => ({
        repo: activity.repoName,
        type: activity.type,
        date: activity.date,
      })),
    };
  }
}
