import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const githubProvider = authOptions.providers.find(
      (provider: any) => provider.id === 'github'
    );

    return NextResponse.json({
      githubConfigured: !!githubProvider,
      githubClientId: process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not set',
      githubClientSecret: process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Not set',
      providers: authOptions.providers.map((provider: any) => ({
        id: provider.id,
        name: provider.name,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check auth configuration' },
      { status: 500 }
    );
  }
}
