import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const technology = searchParams.get("technology") || ""
    const sortBy = searchParams.get("sortBy") || "recent"
    const skip = (page - 1) * limit

    const where: any = {
      is_public: true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (technology) {
      where.technologies = {
        some: {
          technology: {
            name: { contains: technology, mode: "insensitive" as const }
          }
        }
      }
    }

    let orderBy: any = { created_at: "desc" }
    
    switch (sortBy) {
      case "name":
        orderBy = { title: "asc" }
        break
      case "stars":
        orderBy = { stars: "desc" }
        break
      case "progress":
        orderBy = { progress: "desc" }
        break
      case "recent":
      default:
        orderBy = { created_at: "desc" }
        break
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          image_url: true,
          demo_url: true,
          github_url: true,
          status: true,
          progress: true,
          stars: true,
          forks: true,
          views: true,
          created_at: true,
          updated_at: true,
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
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      prisma.project.count({ where })
    ])

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        content,
        image_url,
        demo_url,
        github_url,
        status: status || "active",
        progress: progress || 0,
        is_public: is_public !== false,
        user_id: session.user.id,
        technologies: technologies ? {
          create: technologies.map((techId: string) => ({
            technology_id: techId
          }))
        } : undefined
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

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Create project error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
