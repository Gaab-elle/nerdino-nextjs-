import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tags/[id] - Buscar tag específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        posts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
                image: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            likes: {
              select: {
                id: true,
                user_id: true,
              },
            },
            comments: {
              select: {
                id: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: { created_at: 'desc' },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[id] - Atualizar tag
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, color, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name: name.trim().toLowerCase(),
        color,
        description: description?.trim(),
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - Deletar tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a tag existe
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Deletar tag (cascade vai deletar PostTag)
    await prisma.tag.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}
