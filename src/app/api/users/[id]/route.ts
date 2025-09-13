import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/config/auth"
import { prisma } from "@/lib/prisma"
import { Params } from "@/types/nextjs"

export async function GET(
  request: NextRequest,
  { params }: Params<{ id: string }>
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    const userId = id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        avatar_url: true,
        bio: true,
        location: true,
        website: true,
        github_url: true,
        linkedin_url: true,
        twitter_url: true,
        phone: true,
        is_public: true,
        show_stats: true,
        availability: true,
        contract_type: true,
        work_mode: true,
        urgency: true,
        salary_min: true,
        salary_max: true,
        company_size: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            projects: true,
            posts: true,
            followers: true,
            follows: true,
          }
        },
        projects: {
          where: { is_public: true },
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
          },
          orderBy: { created_at: "desc" },
          take: 6
        },
        skills: {
          select: {
            level: true,
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

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user is public or if requesting user is the same user
    if (!user.is_public && session?.user?.id !== userId) {
      return NextResponse.json(
        { error: "User profile is private" },
        { status: 403 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string  }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (await context.params).id

    if (!session?.user || session.user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      username,
      bio,
      location,
      website,
      github_url,
      linkedin_url,
      twitter_url,
      phone,
      is_public,
      show_stats,
      availability,
      contract_type,
      work_mode,
      urgency,
      salary_min,
      salary_max,
      company_size,
    } = body

    // Check if username is taken by another user
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        username,
        bio,
        location,
        website,
        github_url,
        linkedin_url,
        twitter_url,
        phone,
        is_public,
        show_stats,
        availability,
        contract_type,
        work_mode,
        urgency,
        salary_min,
        salary_max,
        company_size,
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar_url: true,
        bio: true,
        location: true,
        website: true,
        github_url: true,
        linkedin_url: true,
        twitter_url: true,
        phone: true,
        is_public: true,
        show_stats: true,
        availability: true,
        contract_type: true,
        work_mode: true,
        urgency: true,
        salary_min: true,
        salary_max: true,
        company_size: true,
        updated_at: true,
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
