import { 
  GithubUserDTO, 
  GithubRepoDTO, 
  GithubActivityDTO,
  GithubUser, 
  GithubRepo, 
  GithubActivity,
  GithubStats,
  validateGithubUser,
  validateGithubRepo,
  validateGithubActivity
} from '@/schemas/github';

export class GitHubAdapter {
  /**
   * Normalize GitHub user data from API response to internal model
   */
  static normalizeUser(userData: unknown): GithubUser {
    const dto = validateGithubUser(userData);
    
    return {
      id: dto.id,
      login: dto.login,
      name: dto.name ?? dto.login,
      email: dto.email ?? '',
      avatarUrl: dto.avatar_url ?? '',
      profileUrl: dto.html_url,
      followers: dto.followers,
      following: dto.following,
      publicRepos: dto.public_repos,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
      bio: dto.bio ?? '',
      location: dto.location ?? '',
      company: dto.company ?? '',
      website: dto.blog ?? '',
      twitter: dto.twitter_username ?? '',
    };
  }

  /**
   * Normalize GitHub repository data from API response to internal model
   */
  static normalizeRepo(repoData: unknown): GithubRepo {
    const dto = validateGithubRepo(repoData);
    
    return {
      id: dto.id,
      name: dto.name,
      fullName: dto.full_name,
      url: dto.html_url,
      description: dto.description ?? '',
      language: dto.language ?? 'Unknown',
      stars: dto.stargazers_count,
      forks: dto.forks_count,
      createdAt: dto.created_at,
      updatedAt: dto.updated_at,
      ownerLogin: dto.owner.login,
      topics: dto.topics ?? [],
      size: dto.size ?? 0,
      defaultBranch: dto.default_branch ?? 'main',
    };
  }

  /**
   * Normalize GitHub activity data from API response to internal model
   */
  static normalizeActivity(activityData: unknown): GithubActivity {
    const dto = validateGithubActivity(activityData);
    
    return {
      id: dto.id,
      type: dto.type,
      repoName: dto.repo.name,
      repoUrl: dto.repo.url,
      date: dto.created_at,
      actorLogin: dto.actor?.login ?? 'Unknown',
      actorAvatar: dto.actor?.avatar_url ?? '',
    };
  }

  /**
   * Calculate comprehensive stats from normalized data
   */
  static calculateStats(
    user: GithubUser, 
    repos: GithubRepo[], 
    activities: GithubActivity[]
  ): GithubStats {
    const languageStats: Record<string, number> = {};
    let totalStars = 0;
    let totalForks = 0;

    // Calculate language usage and repository stats
    repos.forEach(repo => {
      if (repo.language && repo.language !== 'Unknown') {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }
      totalStars += repo.stars;
      totalForks += repo.forks;
    });

    // Find most used language
    const mostUsedLanguage = Object.entries(languageStats)
      .sort(([, a], [, b]) => b - a)[0]?.[0] ?? '';

    // Calculate average stars per repo
    const averageStarsPerRepo = repos.length > 0 ? totalStars / repos.length : 0;

    return {
      totalRepos: repos.length,
      totalStars,
      totalForks,
      languages: languageStats,
      mostUsedLanguage,
      averageStarsPerRepo: Math.round(averageStarsPerRepo * 100) / 100,
    };
  }

  /**
   * Generate professional title based on GitHub stats
   */
  static generateTitle(user: GithubUser, stats: GithubStats): string {
    const { totalStars, totalRepos, languages } = stats;
    const languageCount = Object.keys(languages).length;

    if (totalStars > 1000) {
      return 'Senior Developer & Open Source Contributor';
    } else if (totalRepos > 50) {
      return 'Full Stack Developer & Tech Lead';
    } else if (languageCount > 5) {
      return 'Polyglot Developer';
    } else if (totalRepos > 20) {
      return 'Software Developer';
    } else {
      return 'Developer';
    }
  }

  /**
   * Generate badges based on GitHub activity and stats
   */
  static generateBadges(user: GithubUser, stats: GithubStats, repos: GithubRepo[]): string[] {
    const badges: string[] = [];

    // Activity-based badges
    if (stats.totalStars > 100) {
      badges.push('Star Collector');
    }
    if (stats.totalRepos > 20) {
      badges.push('Productive Developer');
    }
    if (Object.keys(stats.languages).length > 5) {
      badges.push('Polyglot');
    }
    if (repos.some(repo => repo.stars > 50)) {
      badges.push('Popular Repos');
    }
    if (user.followers > 100) {
      badges.push('Community Leader');
    }
    if (stats.totalRepos > 50) {
      badges.push('Code Machine');
    }

    // Technology badges based on most used languages
    const topLanguages = Object.entries(stats.languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([lang]) => lang);

    badges.push(...topLanguages);

    // Default badges if none match
    if (badges.length === 0) {
      badges.push('Developer', 'GitHub User');
    }

    return badges.slice(0, 6); // Max 6 badges
  }

  /**
   * Safe array processing with validation
   */
  static normalizeRepos(reposData: unknown[]): GithubRepo[] {
    return reposData
      .map(repo => {
        try {
          return this.normalizeRepo(repo);
        } catch (error) {
          console.warn('Skipping invalid repo data:', error);
          return null;
        }
      })
      .filter((repo): repo is GithubRepo => repo !== null);
  }

  static normalizeActivities(activitiesData: unknown[]): GithubActivity[] {
    return activitiesData
      .map(activity => {
        try {
          return this.normalizeActivity(activity);
        } catch (error) {
          console.warn('Skipping invalid activity data:', error);
          return null;
        }
      })
      .filter((activity): activity is GithubActivity => activity !== null);
  }
}
