import { NextResponse } from 'next/server';
import { GitHubService } from '@/lib/github';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { GitHubAdapter } from '@/adapters/githubAdapter';

export async function GET() {
  try {
    // Get current user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user has GitHub connected
    const userWithGithub = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        accounts: {
          where: { provider: 'github' }
        }
      }
    });
    const accessToken = userWithGithub?.accounts?.[0]?.access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      );
    }

    const githubService = new GitHubService(accessToken);
    
    // Get comprehensive GitHub data
    const githubUserRaw = await githubService.getUser();
    const [userStatsRaw, reposRaw, recentActivityRaw] = await Promise.all([
      githubService.getUserStats(githubUserRaw.login),
      githubService.getUserRepos(1, 20), // Top 20 repos
      githubService.getRecentActivity(githubUserRaw.login, 30) // Last 30 days
    ]);

    // Normalize data using adapter
    const githubUser = GitHubAdapter.normalizeUser(githubUserRaw);
    const repos = Array.isArray(reposRaw) ? GitHubAdapter.normalizeRepos(reposRaw) : [];
    const activities = Array.isArray(recentActivityRaw) ? GitHubAdapter.normalizeActivities(recentActivityRaw) : [];
    const normalizedStats = GitHubAdapter.calculateStats(githubUser, repos, activities);

    // Calculate additional stats
    const totalCommits = activities.length;
    const experienceYears = Math.floor(
      (new Date().getTime() - new Date(githubUser.createdAt).getTime()) / 
      (1000 * 60 * 60 * 24 * 365)
    );

    // Get user's current data from database
    const userData = await prisma.user.findUnique({
      where: { id: userId },
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
      title: GitHubAdapter.generateTitle(githubUser, normalizedStats),
      location: githubUser.name || 'Not specified',
      joinDate: `Member since ${new Date(githubUser.createdAt).getFullYear()}`,
      avatar: githubUser.avatarUrl,
      bio: githubUser.bio || `Passionate developer with ${normalizedStats.totalRepos} repositories and ${normalizedStats.totalStars} stars.`,
      
      // Stats
      stats: {
        projects: normalizedStats.totalRepos,
        followers: githubUser.followers,
        experience: `${experienceYears}+ years`,
        commits: totalCommits,
        stars: normalizedStats.totalStars,
        languages: Object.keys(normalizedStats.languages).length
      },

      // Social Links
      social: {
        github: githubUser.profileUrl,
        website: githubUser.profileUrl,
        email: githubUser.email || userData?.email,
        linkedin: userData?.linkedin_url,
        twitter: userData?.twitter_url
      },

      // Badges based on GitHub activity
      badges: GitHubAdapter.generateBadges(githubUser, normalizedStats, repos),

      // Recent Activity
      recentActivity: activities.slice(0, 5).map(event => ({
        type: event.type,
        repo: event.repoName,
        created_at: event.date,
        url: event.repoUrl
      })),

      // Top Repositories
      topRepos: repos.slice(0, 6).map(repo => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stars,
        forks: repo.forks,
        language: repo.language,
        url: repo.url,
        updated_at: repo.updatedAt
      })),

      // Languages used
      languages: Object.keys(normalizedStats.languages).slice(0, 10),

      // GitHub specific data
      githubData: {
        publicRepos: normalizedStats.totalRepos,
        privateRepos: 0,
        totalStars: normalizedStats.totalStars,
        totalForks: normalizedStats.totalForks,
        accountAge: experienceYears,
        lastActive: githubUser.updatedAt
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

