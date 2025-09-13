import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ No session found - using development mode');
      // TODO: Remove this in production - only for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: allowing access without session');
      } else {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const technology = searchParams.get("technology") || ""
    const sortBy = searchParams.get("sortBy") || "recent"
    const skip = (page - 1) * limit

    const where: any = {
      // Em modo de desenvolvimento, não filtrar por user_id
      ...(session?.user?.id ? { user_id: session.user.id } : {})
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (technology && technology !== 'all') {
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
        orderBy = { created_at: "desc" }
        break
      case "lastUpdate":
        orderBy = { updated_at: "desc" }
        break
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

    // Transform projects to match the expected format
    const transformedProjects = projects.map(project => ({
      id: project.id,
      name: project.title,
      description: project.description,
      technologies: project.technologies.map(t => t.technology.name),
      status: project.status,
      stars: project.stars || 0,
      forks: project.forks || 0,
      progress: project.progress || 0,
      lastUpdate: formatLastUpdate(project.updated_at),
      createdAt: project.created_at.toISOString().split('T')[0],
      demoUrl: project.demo_url,
      githubUrl: project.github_url,
      image: project.image_url || getDefaultProjectImage(project.title),
      views: project.views || 0,
      likes: project._count.likes,
      comments: project._count.comments
    }))

    return NextResponse.json({
      success: true,
      data: transformedProjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Get user projects error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function formatLastUpdate(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))

  if (diffInDays > 0) {
    return `${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'} atrás`
  } else if (diffInHours > 0) {
    return `${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'} atrás`
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'} atrás`
  } else {
    return 'Agora mesmo'
  }
}

function getDefaultProjectImage(title: string): string {
  // Generate a default image based on project title
  const images = [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop", // Code
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop", // E-commerce
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop", // Task management
    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=200&fit=crop", // Weather
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop", // Analytics
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop", // Blockchain
  ]
  
  // Simple hash to get consistent image for same title
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash + title.charCodeAt(i)) & 0xffffffff
  }
  
  return images[Math.abs(hash) % images.length]
}
