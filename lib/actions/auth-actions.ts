"use server"

import { hash, compare } from "bcryptjs"
import { signIn } from "next-auth/react"
import { AuthError } from "next-auth"
import prisma from "@/lib/prisma"

export async function registerUser(data: {
  name: string
  email: string
  password: string
  role: string
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (existingUser) {
      return { error: "User already exists" }
    }

    const hashedPassword = await hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as any,
      },
    })

    return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Failed to register user" }
  }
}

export async function authenticate(data: { email: string; password: string }) {
  try {
    await signIn("credentials", { ...data, redirect: false })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" }
        default:
          return { error: "Something went wrong" }
      }
    }
    return { error: "Something went wrong" }
  }
}

export async function changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      return { error: "User not found" }
    }

    const isPasswordValid = await compare(data.currentPassword, user.password)

    if (!isPasswordValid) {
      return { error: "Current password is incorrect" }
    }

    const hashedPassword = await hash(data.newPassword, 10)

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Change password error:", error)
    return { error: "Failed to change password" }
  }
}

// Add reset password functionality

export async function resetPassword(email: string) {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      return { error: "No account found with this email" }
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Store it in the database with an expiration
    // 3. Send an email with a reset link

    // For demo purposes, we'll just generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await hash(tempPassword, 10)

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    // In a real app, you would send this via email
    // For demo, we'll just return it
    return {
      success: true,
      message: "Password has been reset. In a real application, an email would be sent.",
      tempPassword, // Only for demo purposes
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "Failed to reset password" }
  }
}
