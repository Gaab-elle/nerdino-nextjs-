import { NextRequest, NextResponse } from 'next/server';
import { syncUserFromGitHub, getGitHubAccessToken } from '@/lib/github';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('GitHub sync API (alt) called');
    
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
    const accessToken = await getGitHubAccessToken(githubAccount.userId);
    if (!accessToken) {
      return NextResponse.json(
        { error: 'GitHub not connected' },
        { status: 400 }
      );
    }

    // Sync user data from GitHub
    const result = await syncUserFromGitHub(githubAccount.userId);

    return NextResponse.json({
      success: true,
      message: 'GitHub data synced successfully',
      data: result,
      user: {
        id: githubAccount.userId,
        email: githubAccount.user.email,
        name: githubAccount.user.name,
      },
    });
  } catch (error) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync GitHub data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
