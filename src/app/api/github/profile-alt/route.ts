import { NextResponse } from 'next/server';
// import { getGitHubAccessToken } from '@/lib/github';
import { GitHubService } from '@/lib/github';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('GitHub profile API (alt) called');
    
    // Get the most recent user with GitHub account
    const githubAccount = await prisma.account.findFirst({
      where: {
        provider: 'github',
      },
      include: {
        user: true,
      },
      orderBy: {
        userId: 'desc',
      },
    });

    if (!githubAccount) {
      return NextResponse.json(
        { error: 'No GitHub account found' },
        { status: 404 }
      );
    }

    console.log('Found GitHub account for user:', githubAccount.user.email);

    // Check if user has GitHub connected
    const accessToken = (githubAccount as any).access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      );
    }

    const githubService = new GitHubService(accessToken);
    
    // Get user data first
    const githubUser = await githubService.getUser();
    
    // Then get other data using the user's login
    const [userStats, repos, recentActivity] = await Promise.all([
      githubService.getUserStats(githubUser.login),
      githubService.getUserRepos(1, 20), // Top 20 repos
      githubService.getRecentActivity(githubUser.login, 30) // Last 30 days
    ]);

    // Calculate additional stats
    const totalCommits = recentActivity.length;
    const experienceYears = Math.floor(
      (new Date().getTime() - new Date(githubUser.created_at).getTime()) / 
      (1000 * 60 * 60 * 24 * 365)
    );

    // Get user's current data from database
    const user = await prisma.user.findUnique({
      where: { id: githubAccount.userId },
      include: {
        projects: {
          where: { is_public: true },
          orderBy: { updated_at: 'desc' },
          take: 10
        }
      }
    });

    // Format data for NERDINO profile
    const profileData = {
      // Basic Info
      name: githubUser.name || githubUser.login,
      username: githubUser.login,
      title: generateTitle(githubUser, userStats),
      location: githubUser.location || 'Not specified',
      joinDate: `Member since ${new Date(githubUser.created_at).getFullYear()}`,
      avatar: githubUser.avatar_url,
      bio: githubUser.bio || `Passionate developer with ${userStats.totalRepos} repositories and ${userStats.totalStars} stars.`,
      
      // Stats
      stats: {
        projects: userStats.totalRepos,
        followers: githubUser.followers,
        experience: `${experienceYears}+ years`,
        commits: totalCommits,
        stars: userStats.totalStars,
        languages: userStats.languages.length
      },

      // Social Links
      social: {
        github: githubUser.html_url,
        website: githubUser.blog,
        email: githubUser.email || user?.email,
        linkedin: user?.linkedin_url,
        twitter: user?.twitter_url
      },

      // Badges based on GitHub activity
      badges: generateBadges(githubUser, userStats, repos),

      // Recent Activity
      recentActivity: recentActivity.slice(0, 5).map(event => ({
        type: event.type,
        repo: event.repo?.name,
        created_at: event.created_at,
        url: `https://github.com/${event.repo?.name}`
      })),

      // Top Repositories
      topRepos: repos.slice(0, 6).map(repo => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
        updated_at: repo.updated_at
      })),

      // Languages used
      languages: userStats.languages.slice(0, 10),

      // GitHub specific data
      githubData: {
        publicRepos: userStats.publicRepos,
        privateRepos: userStats.privateRepos,
        totalStars: userStats.totalStars,
        totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
        accountAge: experienceYears,
        lastActive: githubUser.updated_at
      }
    };

    return NextResponse.json({
      success: true,
      data: profileData,
      lastSync: new Date().toISOString()
    });

  } catch (error) {
    console.error('GitHub profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub profile data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to generate a professional title based on GitHub data
function generateTitle(githubUser: {
  login: string;
  name?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
}, userStats: {
  totalRepos: number;
  totalStars: number;
  languages: string[];
}): string {
  const repos = userStats.totalRepos;
  const stars = userStats.totalStars;
  const languages = userStats.languages.length;

  if (stars > 1000) {
    return 'Senior Developer & Open Source Contributor';
  } else if (repos > 50) {
    return 'Full Stack Developer & Tech Lead';
  } else if (languages > 5) {
    return 'Polyglot Developer';
  } else if (repos > 20) {
    return 'Software Developer';
  } else {
    return 'Developer';
  }
}

// Helper function to generate badges based on GitHub activity
function generateBadges(githubUser: {
  login: string;
  name?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
}, userStats: {
  totalRepos: number;
  totalStars: number;
  languages: string[];
}, repos: Array<{
  name: string;
  stargazers_count: number;
  language: string;
  created_at: string;
}>): string[] {
  const badges = [];

  // Activity-based badges
  if (userStats.totalStars > 100) {
    badges.push('Star Collector');
  }
  if (userStats.totalRepos > 20) {
    badges.push('Productive Developer');
  }
  if (userStats.languages.length > 5) {
    badges.push('Polyglot');
  }
  if (repos.some(repo => repo.stargazers_count > 50)) {
    badges.push('Popular Repos');
  }
  if (githubUser.followers > 100) {
    badges.push('Community Leader');
  }
  if (userStats.totalRepos > 50) {
    badges.push('Code Machine');
  }

  // Default badges if none match
  if (badges.length === 0) {
    badges.push('Developer', 'GitHub User');
  }

  return badges.slice(0, 4); // Max 4 badges
}
