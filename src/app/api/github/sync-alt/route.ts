import { NextResponse } from 'next/server';
import { syncUserFromGitHub, refreshGitHubTokenIfNeeded } from '@/lib/github';
import { prisma } from '@/lib/prisma';

export async function POST() {
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
      console.log('No GitHub account found in database');
      return NextResponse.json(
        { 
          error: 'GitHub não conectado',
          message: 'Você precisa conectar sua conta GitHub primeiro. Vá para as configurações e conecte sua conta GitHub.',
          code: 'GITHUB_NOT_CONNECTED'
        },
        { status: 400 }
      );
    }

    console.log('Found GitHub account for user:', githubAccount.user.email);

    // Check if user has GitHub connected and token is valid
    const accessToken = await refreshGitHubTokenIfNeeded(githubAccount.userId);
    if (!accessToken) {
      console.log('No valid access token found for user:', githubAccount.userId);
      return NextResponse.json(
        { 
          error: 'Token de acesso GitHub expirado',
          message: 'Seu token de acesso do GitHub expirou. Reconecte sua conta GitHub.',
          code: 'GITHUB_TOKEN_EXPIRED'
        },
        { status: 400 }
      );
    }

    // Sync user data from GitHub
    const result = await syncUserFromGitHub(githubAccount.userId);

    return NextResponse.json({
      success: true,
      message: 'Dados do GitHub sincronizados com sucesso',
      data: result,
      user: {
        id: githubAccount.userId,
        email: githubAccount.user.email,
        name: githubAccount.user.name,
      },
    });
  } catch (error) {
    console.error('GitHub sync error:', error);
    
    // Handle specific GitHub API errors
    if (error instanceof Error) {
      if (error.message.includes('Bad credentials')) {
        return NextResponse.json(
          { 
            error: 'Credenciais GitHub inválidas',
            message: 'Suas credenciais do GitHub são inválidas. Reconecte sua conta.',
            code: 'GITHUB_BAD_CREDENTIALS'
          },
          { status: 401 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { 
            error: 'Limite de requisições GitHub excedido',
            message: 'Muitas requisições para a API do GitHub. Tente novamente em alguns minutos.',
            code: 'GITHUB_RATE_LIMIT'
          },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Erro ao sincronizar dados do GitHub',
        message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        code: 'GITHUB_SYNC_ERROR'
      },
      { status: 500 }
    );
  }
}
