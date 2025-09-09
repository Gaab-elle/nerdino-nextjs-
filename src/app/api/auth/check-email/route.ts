import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        email_verified: true,
        accounts: {
          select: {
            provider: true
          }
        }
      }
    })

    if (user) {
      const providers = user.accounts.map(account => account.provider)
      return NextResponse.json({
        exists: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          providers
        }
      })
    }

    return NextResponse.json({ exists: false })
  } catch (error) {
    console.error("Check email error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
