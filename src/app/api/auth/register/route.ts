import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, username } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password and name are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Check if username is taken (if provided)
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      })

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username: username || null,
        email_verification_token: verificationToken,
        email_verification_expires: expiresAt,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        created_at: true,
      }
    })

    // Send verification email
    await sendVerificationEmail(email, verificationToken, name || undefined)

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email to verify your account.", 
        user,
        emailSent: true
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
