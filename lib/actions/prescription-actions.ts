"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Pharmacist Function: View prescriptions
export async function viewPrescriptions(patientId?: string, status?: string) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        AND: [
          patientId ? { patientId } : {},
          status
            ? {
                medications: {
                  some: {
                    medicationDispenses: {
                      some: {
                        status: status as any,
                      },
                    },
                  },
                },
              }
            : {},
        ],
      },
      include: {
        patient: true,
        diagnosis: {
          include: {
            doctor: true,
          },
        },
        medications: {
          include: {
            medicationDispenses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { prescriptions }
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return { error: "Failed to fetch prescriptions" }
  }
}

// Pharmacist Function: Dispense medication
export async function dispenseMedication(data: {
  patientId: string
  pharmacistId: string
  medicationId: string
  quantity: number
}) {
  try {
    // Check if medication exists in inventory
    const medicationInventory = await prisma.medicationInventory.findFirst({
      where: {
        name: {
          equals: await prisma.prescriptionMedication
            .findUnique({
              where: { id: data.medicationId },
              select: { medicationName: true },
            })
            .then((med) => med?.medicationName || ""),
        },
      },
    })

    if (!medicationInventory || medicationInventory.quantity < data.quantity) {
      return { error: "Insufficient inventory" }
    }

    // Update inventory
    await prisma.medicationInventory.update({
      where: {
        id: medicationInventory.id,
      },
      data: {
        quantity: medicationInventory.quantity - data.quantity,
      },
    })

    // Create dispense record
    const dispense = await prisma.medicationDispense.create({
      data: {
        patient: {
          connect: {
            id: data.patientId,
          },
        },
        pharmacist: {
          connect: {
            id: data.pharmacistId,
          },
        },
        medication: {
          connect: {
            id: data.medicationId,
          },
        },
        quantity: data.quantity,
        status: "DISPENSED",
      },
      include: {
        patient: true,
        pharmacist: true,
        medication: true,
      },
    })

    revalidatePath(`/dashboard/patients/${data.patientId}`)
    revalidatePath("/dashboard/pharmacy")
    return { success: true, dispense }
  } catch (error) {
    console.error("Error dispensing medication:", error)
    return { error: "Failed to dispense medication" }
  }
}

// Pharmacist Function: Check medicine stock
export async function checkMedicineStock(medicineName: string) {
  try {
    const medication = await prisma.medicationInventory.findFirst({
      where: {
        name: {
          contains: medicineName,
          mode: "insensitive",
        },
      },
    })

    if (!medication) {
      return { error: "Medication not found in inventory" }
    }

    return {
      success: true,
      medication,
      isLowStock: medication.quantity < 20,
      isOutOfStock: medication.quantity <= 0,
    }
  } catch (error) {
    console.error("Error checking medicine stock:", error)
    return { error: "Failed to check medicine stock" }
  }
}

// Pharmacist Function: Update inventory
export async function updateInventory(medicineId: string, quantityChange: number) {
  try {
    const medication = await prisma.medicationInventory.findUnique({
      where: {
        id: medicineId,
      },
    })

    if (!medication) {
      return { error: "Medication not found" }
    }

    // Calculate new quantity
    const newQuantity = medication.quantity + quantityChange

    // Ensure quantity doesn't go below zero
    if (newQuantity < 0) {
      return { error: "Cannot reduce inventory below zero" }
    }

    // Update inventory
    const updatedMedication = await prisma.medicationInventory.update({
      where: {
        id: medicineId,
      },
      data: {
        quantity: newQuantity,
      },
    })

    revalidatePath("/dashboard/pharmacy")
    return { success: true, medication: updatedMedication }
  } catch (error) {
    console.error("Error updating inventory:", error)
    return { error: "Failed to update inventory" }
  }
}

// Pharmacist Function: Confirm medicine pickup
export async function confirmMedicinePickup(patientId: string) {
  try {
    // Update all pending dispenses for this patient
    const updatedDispenses = await prisma.medicationDispense.updateMany({
      where: {
        patientId,
        status: "DISPENSED",
        pickedUp: false,
      },
      data: {
        pickedUp: true,
        pickupDate: new Date(),
      },
    })

    revalidatePath(`/dashboard/patients/${patientId}`)
    revalidatePath("/dashboard/pharmacy")
    return { success: true, updatedCount: updatedDispenses.count }
  } catch (error) {
    console.error("Error confirming medicine pickup:", error)
    return { error: "Failed to confirm medicine pickup" }
  }
}

export async function getPrescriptions(patientId?: string, status?: string) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        AND: [
          patientId ? { patientId } : {},
          status
            ? {
                medications: {
                  some: {
                    medicationDispenses: {
                      some: {
                        status: status as any,
                      },
                    },
                  },
                },
              }
            : {},
        ],
      },
      include: {
        patient: true,
        diagnosis: {
          include: {
            doctor: true,
          },
        },
        medications: {
          include: {
            medicationDispenses: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { prescriptions }
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return { error: "Failed to fetch prescriptions" }
  }
}

export async function getPrescriptionById(id: string) {
  try {
    const prescription = await prisma.prescription.findUnique({
      where: {
        id,
      },
      include: {
        patient: true,
        diagnosis: {
          include: {
            doctor: true,
          },
        },
        medications: {
          include: {
            medicationDispenses: {
              include: {
                pharmacist: true,
              },
            },
          },
        },
      },
    })

    if (!prescription) {
      return { error: "Prescription not found" }
    }

    return { prescription }
  } catch (error) {
    console.error("Error fetching prescription:", error)
    return { error: "Failed to fetch prescription" }
  }
}

// Doctor Function
export async function createPrescription(data: {
  patientId: string
  diagnosisId: string
  medications: {
    medicationName: string
    dosage: string
    frequency: string
    duration: string
    notes?: string
  }[]
}) {
  try {
    const prescription = await prisma.prescription.create({
      data: {
        patient: {
          connect: {
            id: data.patientId,
          },
        },
        diagnosis: {
          connect: {
            id: data.diagnosisId,
          },
        },
        medications: {
          create: data.medications,
        },
      },
      include: {
        patient: true,
        diagnosis: {
          include: {
            doctor: true,
          },
        },
        medications: true,
      },
    })

    revalidatePath(`/dashboard/patients/${data.patientId}`)
    revalidatePath("/dashboard/pharmacy")
    return { success: true, prescription }
  } catch (error) {
    console.error("Error creating prescription:", error)
    return { error: "Failed to create prescription" }
  }
}

// Doctor Function
export async function prescribeMedication(patientId: string, diagnosisId: string, medications: any[]) {
  return createPrescription({
    patientId,
    diagnosisId,
    medications,
  })
}

// Doctor Function
export async function updatePrescription(
  id: string,
  data: {
    medications: {
      id?: string
      medicationName: string
      dosage: string
      frequency: string
      duration: string
      notes?: string
    }[]
  },
) {
  try {
    // First, get the prescription to get the patientId
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      select: { patientId: true, medications: true },
    })

    if (!prescription) {
      return { error: "Prescription not found" }
    }

    // Delete existing medications
    await prisma.prescriptionMedication.deleteMany({
      where: {
        prescriptionId: id,
      },
    })

    // Create new medications
    const updatedPrescription = await prisma.prescription.update({
      where: {
        id,
      },
      data: {
        medications: {
          create: data.medications,
        },
      },
      include: {
        patient: true,
        diagnosis: {
          include: {
            doctor: true,
          },
        },
        medications: true,
      },
    })

    revalidatePath(`/dashboard/patients/${prescription.patientId}`)
    revalidatePath("/dashboard/pharmacy")
    return { success: true, prescription: updatedPrescription }
  } catch (error) {
    console.error("Error updating prescription:", error)
    return { error: "Failed to update prescription" }
  }
}

export async function getPharmacyStats() {
  try {
    // Count pending prescriptions
    const pendingPrescriptions = await prisma.prescriptionMedication.count({
      where: {
        medicationDispenses: {
          none: {},
        },
      },
    })

    // Count dispensed medications today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dispensedToday = await prisma.medicationDispense.count({
      where: {
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        status: "DISPENSED",
      },
    })

    // Count unique patients who received medications today
    const patientsToday = await prisma.medicationDispense.groupBy({
      by: ["patientId"],
      where: {
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        status: "DISPENSED",
      },
      _count: {
        patientId: true,
      },
    })

    // Count low stock items (less than 20 units)
    const lowStockItems = await prisma.medicationInventory.count({
      where: {
        quantity: {
          lt: 20,
        },
      },
    })

    // Get total medications in inventory
    const totalMedications = await prisma.medicationInventory.count()

    return {
      pendingPrescriptions,
      dispensedToday,
      patientsToday: patientsToday.length,
      lowStockItems,
      totalMedications,
    }
  } catch (error) {
    console.error("Error fetching pharmacy stats:", error)
    return { error: "Failed to fetch pharmacy statistics" }
  }
}
