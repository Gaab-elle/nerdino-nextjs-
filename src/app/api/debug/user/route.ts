import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
      },
    });

    // Get GitHub account specifically
    const githubAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
      },
    });

    return NextResponse.json({
      session: {
        user: session.user,
        userId: session.user.id,
      },
      databaseUser: user,
      githubAccount: githubAccount,
      hasGitHubAccount: !!githubAccount,
      hasAccessToken: !!githubAccount?.access_token,
    });
  } catch (error) {
    console.error('Debug user error:', error);
    return NextResponse.json(
      { error: 'Failed to debug user' },
      { status: 500 }
    );
  }
}
