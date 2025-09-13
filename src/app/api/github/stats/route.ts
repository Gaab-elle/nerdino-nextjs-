import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { GitHubService, getGitHubAccessToken } from '@/lib/github';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accessToken = await getGitHubAccessToken(session.user.id);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      );
    }

    const githubService = new GitHubService(accessToken);
    
    // Get user data
    const user = await githubService.getUser();
    const stats = await githubService.getUserStats(user.login);
    const recentActivity = await githubService.getRecentActivity(user.login, 30);

    return NextResponse.json({
      success: true,
      data: {
        user,
        stats,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('GitHub stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub stats' },
      { status: 500 }
    );
  }
}
