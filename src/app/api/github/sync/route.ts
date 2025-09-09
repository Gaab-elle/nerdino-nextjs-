import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncUserFromGitHub, getGitHubAccessToken } from '@/lib/github';

export async function POST(request: NextRequest) {
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    return NextResponse.json({
      success: true,
      message: 'GitHub is connected',
      hasAccessToken: true,
    });
  } catch (error) {
    console.error('GitHub status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check GitHub status' },
      { status: 500 }
    );
  }
}
