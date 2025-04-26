"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getMedicationInventory(query?: string, lowStock?: boolean) {
  try {
    const inventory = await prisma.medicationInventory.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { category: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          lowStock
            ? {
                quantity: {
                  lt: 20,
                },
              }
            : {},
        ],
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return { inventory }
  } catch (error) {
    console.error("Error fetching medication inventory:", error)
    return { error: "Failed to fetch medication inventory" }
  }
}

export async function getMedicationById(id: string) {
  try {
    const medication = await prisma.medicationInventory.findUnique({
      where: {
        id,
      },
    })

    if (!medication) {
      return { error: "Medication not found" }
    }

    return { medication }
  } catch (error) {
    console.error("Error fetching medication:", error)
    return { error: "Failed to fetch medication" }
  }
}

export async function createMedication(data: {
  name: string
  quantity: number
  unit: string
  price: number
  expiryDate?: Date
}) {
  try {
    const medication = await prisma.medicationInventory.create({
      data: {
        name: data.name,
        category: "Uncategorized", // Default category
        quantity: data.quantity,
        unitPrice: data.price,
        unit: data.unit,
        expiryDate: data.expiryDate,
      },
    })

    revalidatePath("/dashboard/pharmacy")
    return { success: true, medication }
  } catch (error) {
    console.error("Error adding medication:", error)
    return { error: "Failed to add medication" }
  }
}

export async function updateMedication(
  id: string,
  data: {
    name?: string
    category?: string
    quantity?: number
    unitPrice?: number
    expiryDate?: Date
    supplier?: string
    notes?: string
  },
) {
  try {
    const medication = await prisma.medicationInventory.update({
      where: {
        id,
      },
      data,
    })

    revalidatePath("/dashboard/pharmacy")
    return { success: true, medication }
  } catch (error) {
    console.error("Error updating medication:", error)
    return { error: "Failed to update medication" }
  }
}

export async function deleteMedication(id: string) {
  try {
    await prisma.medicationInventory.delete({
      where: {
        id,
      },
    })

    revalidatePath("/dashboard/pharmacy")
    return { success: true }
  } catch (error) {
    console.error("Error deleting medication:", error)
    return { error: "Failed to delete medication" }
  }
}

export async function getInventoryStats() {
  try {
    // Get total inventory value
    const inventory = await prisma.medicationInventory.findMany()
    const totalValue = inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    // Get low stock items (less than 20 units)
    const lowStockItems = await prisma.medicationInventory.count({
      where: {
        quantity: {
          lt: 20,
        },
      },
    })

    // Get expired items
    const today = new Date()
    const expiredItems = await prisma.medicationInventory.count({
      where: {
        expiryDate: {
          lt: today,
        },
      },
    })

    // Get items by category
    const itemsByCategory = await prisma.medicationInventory.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
    })

    return {
      totalItems: inventory.length,
      totalValue,
      lowStockItems,
      expiredItems,
      itemsByCategory: itemsByCategory.map((category) => ({
        name: category.category,
        count: category._count.id,
        quantity: category._sum.quantity || 0,
      })),
    }
  } catch (error) {
    console.error("Error fetching inventory stats:", error)
    return { error: "Failed to fetch inventory statistics" }
  }
}
