import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GitHubService, getGitHubAccessToken } from '@/lib/github';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    const githubService = new GitHubService(accessToken);
    const repos = await githubService.getUserRepos(page, perPage);

    return NextResponse.json({
      success: true,
      data: repos,
      pagination: {
        page,
        per_page: perPage,
        total: repos.length,
      },
    });
  } catch (error) {
    console.error('GitHub repos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub repositories' },
      { status: 500 }
    );
  }
}
