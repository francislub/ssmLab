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

// Check if email exists in the database
export async function checkEmailExists(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      return { error: "No account found with this email" }
    }

    return { success: true, userId: user.id }
  } catch (error) {
    console.error("Email check error:", error)
    return { error: "Failed to verify email" }
  }
}

// Reset password with new password
export async function resetPassword(email: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      return { error: "No account found with this email" }
    }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "Failed to reset password" }
  }
}
