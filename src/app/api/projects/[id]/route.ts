import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const projectId = params.id

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
            bio: true,
            location: true,
            github_url: true,
            linkedin_url: true,
            twitter_url: true,
          }
        },
        technologies: {
          select: {
            technology: {
              select: {
                name: true,
                category: true,
                icon_url: true,
                color: true,
              }
            }
          }
        },
        likes: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
              }
            }
          }
        },
        comments: {
          where: { is_public: true },
          select: {
            id: true,
            content: true,
            created_at: true,
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar_url: true,
              }
            },
            _count: {
              select: {
                likes: true,
                replies: true,
              }
            }
          },
          orderBy: { created_at: "desc" }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Check if project is public or if requesting user is the owner
    if (!project.is_public && session?.user?.id !== project.user_id) {
      return NextResponse.json(
        { error: "Project is private" },
        { status: 403 }
      )
    }

    // Increment view count
    await prisma.project.update({
      where: { id: projectId },
      data: { views: { increment: 1 } }
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Get project error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const projectId = params.id

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user owns the project
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { user_id: true }
    })

    if (!existingProject || existingProject.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      content,
      image_url,
      demo_url,
      github_url,
      status,
      progress,
      is_public,
      technologies
    } = body

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        content,
        image_url,
        demo_url,
        github_url,
        status,
        progress,
        is_public,
        updated_at: new Date(),
        ...(technologies && {
          technologies: {
            deleteMany: {},
            create: technologies.map((techId: string) => ({
              technology_id: techId
            }))
          }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar_url: true,
          }
        },
        technologies: {
          select: {
            technology: {
              select: {
                name: true,
                category: true,
                icon_url: true,
                color: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Update project error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const projectId = params.id

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user owns the project
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { user_id: true }
    })

    if (!existingProject || existingProject.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    await prisma.project.delete({
      where: { id: projectId }
    })

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Delete project error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
