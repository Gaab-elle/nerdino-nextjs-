import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Se há sessão, buscar do banco de dados
    if (session?.user?.id) {
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId: session.user.id }
      });

      return NextResponse.json({
        success: true,
        settings: userSettings?.settings || {}
      });
    } else {
      // Se não há sessão, retornar configurações vazias
      // O frontend usará localStorage como fallback
      return NextResponse.json({
        success: true,
        settings: {},
        message: "No session - use localStorage"
      });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: 'Settings data required' }, { status: 400 });
    }

    // Se há sessão, salvar no banco de dados
    if (session?.user?.id) {
      const userSettings = await prisma.userSettings.upsert({
        where: { userId: session.user.id },
        update: { 
          settings: settings,
          updatedAt: new Date()
        },
        create: {
          userId: session.user.id,
          settings: settings
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Settings saved successfully to database',
        settings: userSettings.settings
      });
    } else {
      // Se não há sessão, retornar sucesso para que o frontend use localStorage
      return NextResponse.json({
        success: true,
        message: 'Settings saved to localStorage (no session)',
        settings: settings
      });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
