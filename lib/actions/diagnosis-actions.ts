"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getDiagnoses(patientId?: string) {
  try {
    const diagnoses = await prisma.diagnosis.findMany({
      where: patientId ? { patientId } : undefined,
      include: {
        patient: true,
        doctor: true,
        testRequests: {
          include: {
            testResult: true,
          },
        },
        prescriptions: {
          include: {
            medications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { diagnoses }
  } catch (error) {
    console.error("Error fetching diagnoses:", error)
    return { error: "Failed to fetch diagnoses" }
  }
}

export async function getDiagnosisById(id: string) {
  try {
    const diagnosis = await prisma.diagnosis.findUnique({
      where: {
        id,
      },
      include: {
        patient: true,
        doctor: true,
        testRequests: {
          include: {
            testResult: true,
          },
        },
        prescriptions: {
          include: {
            medications: true,
          },
        },
      },
    })

    if (!diagnosis) {
      return { error: "Diagnosis not found" }
    }

    return { diagnosis }
  } catch (error) {
    console.error("Error fetching diagnosis:", error)
    return { error: "Failed to fetch diagnosis" }
  }
}

// Doctor Function
export async function createDiagnosis(data: {
  patientId: string
  doctorId: string
  notes: string
  testRequests?: { testType: string; status?: "REQUESTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }[]
}) {
  try {
    const diagnosis = await prisma.diagnosis.create({
      data: {
        patient: {
          connect: {
            id: data.patientId,
          },
        },
        doctor: {
          connect: {
            id: data.doctorId,
          },
        },
        notes: data.notes,
        testRequests: data.testRequests
          ? {
              create: data.testRequests.map((test) => ({
                testType: test.testType,
                status: test.status || "REQUESTED",
              })),
            }
          : undefined,
      },
      include: {
        patient: true,
        doctor: true,
        testRequests: true,
      },
    })

    revalidatePath(`/dashboard/patients/${data.patientId}`)
    return { success: true, diagnosis }
  } catch (error) {
    console.error("Error creating diagnosis:", error)
    return { error: "Failed to create diagnosis" }
  }
}

// Doctor Function
export async function recordDiagnosis(patientId: string, doctorId: string, notes: string) {
  return createDiagnosis({
    patientId,
    doctorId,
    notes,
  })
}

export async function updateDiagnosis(id: string, data: { notes?: string }) {
  try {
    const diagnosis = await prisma.diagnosis.update({
      where: {
        id,
      },
      data,
      include: {
        patient: true,
        doctor: true,
      },
    })

    revalidatePath(`/dashboard/patients/${diagnosis.patientId}`)
    return { success: true, diagnosis }
  } catch (error) {
    console.error("Error updating diagnosis:", error)
    return { error: "Failed to update diagnosis" }
  }
}

export async function deleteDiagnosis(id: string) {
  try {
    const diagnosis = await prisma.diagnosis.delete({
      where: {
        id,
      },
    })

    revalidatePath(`/dashboard/patients/${diagnosis.patientId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting diagnosis:", error)
    return { error: "Failed to delete diagnosis" }
  }
}
