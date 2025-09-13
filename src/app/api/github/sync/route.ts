import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncUserFromGitHub, getGitHubAccessToken } from '@/lib/github';

export async function POST() {
  try {
    console.log('GitHub sync API called');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Check if user has GitHub connected
    const accessToken = await getGitHubAccessToken(session.user.id);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      );
    }

    // Sync user data from GitHub
    const result = await syncUserFromGitHub(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'GitHub data synced successfully',
      data: result,
    });
  } catch (error) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync GitHub data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Checking GitHub connection for user:', session.user.id);
    console.log('Session user data:', session.user);

    // Check if user has GitHub connected via access token
    const accessToken = await getGitHubAccessToken(session.user.id);
    console.log('Access token found:', !!accessToken);
    
    if (accessToken) {
      return NextResponse.json({
        success: true,
        message: 'GitHub is connected (with access token)',
        hasAccessToken: true,
      });
    }

    // Check if user was created via GitHub login (has GitHub account but no access token)
    const { prisma } = await import('@/lib/prisma');
    const githubAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
    });
    
    console.log('GitHub account found in database:', !!githubAccount);
    
    if (githubAccount) {
      // User has GitHub account but no access token - still consider connected
      return NextResponse.json({
        success: true,
        message: 'GitHub is connected (via login)',
        hasAccessToken: false,
        connectedViaLogin: true,
      });
    }

    // Check if user has GitHub-related data in their profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { github_url: true, avatar_url: true }
    });

    console.log('User GitHub data:', user);

    // If user has GitHub URL or GitHub-style avatar, consider them connected
    if (user?.github_url || (user?.avatar_url && user.avatar_url.includes('github'))) {
      return NextResponse.json({
        success: true,
        message: 'GitHub is connected (profile data)',
        hasAccessToken: false,
        connectedViaProfile: true,
      });
    }
    
    return NextResponse.json(
      { error: 'GitHub not connected' },
      { status: 400 }
    );
  } catch (error) {
    console.error('GitHub status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check GitHub status' },
      { status: 500 }
    );
  }
}
