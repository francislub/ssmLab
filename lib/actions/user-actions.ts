"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "LAB_TECHNICIAN" | "PHARMACIST" | "CASHIER"
}) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return { success: true, user: userWithoutPassword }
  } catch (error) {
    console.error("Error creating user:", error)
    return { error: "Failed to create user" }
  }
}

export async function getUsers(role?: string) {
  try {
    const users = await prisma.user.findMany({
      where: role ? { role: role as any } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { users }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { error: "Failed to fetch users" }
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return { error: "User not found" }
    }

    return { user }
  } catch (error) {
    console.error("Error fetching user:", error)
    return { error: "Failed to fetch user" }
  }
}

export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    role?: "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "LAB_TECHNICIAN" | "PHARMACIST" | "CASHIER"
  },
) {
  try {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    revalidatePath("/dashboard/users")
    return { success: true, user }
  } catch (error) {
    console.error("Error updating user:", error)
    return { error: "Failed to update user" }
  }
}

export async function updateUserPassword(id: string, newPassword: string) {
  try {
    // Hash password
    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating user password:", error)
    return { error: "Failed to update user password" }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: {
        id,
      },
    })

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "Failed to delete user" }
  }
}
