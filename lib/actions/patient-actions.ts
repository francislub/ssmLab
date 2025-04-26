"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Receptionist Functions
export async function getPatients(query?: string) {
  try {
    const patients = await prisma.patient.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        appointments: {
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return { patients }
  } catch (error) {
    console.error("Error fetching patients:", error)
    return { error: "Failed to fetch patients" }
  }
}

// Doctor & Receptionist Function
export async function getPatientById(id: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: {
        id,
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        appointments: {
          orderBy: {
            date: "desc",
          },
          include: {
            doctor: true,
          },
        },
        diagnoses: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
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
        },
        testResults: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            technician: true,
            testRequest: true,
          },
        },
        prescriptions: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            medications: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            cashier: true,
          },
        },
        referrals: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            referringDoctor: true,
            specialist: true,
          },
        },
      },
    })

    if (!patient) {
      return { error: "Patient not found" }
    }

    return { patient }
  } catch (error) {
    console.error("Error fetching patient:", error)
    return { error: "Failed to fetch patient" }
  }
}

// Receptionist Function
export async function createPatient(data: {
  name: string
  email?: string
  phone: string
  address?: string
  dateOfBirth?: Date
  gender?: string
  bloodGroup?: string
  doctorId?: string
}) {
  try {
    const patient = await prisma.patient.create({
      data,
    })

    revalidatePath("/dashboard/patients")
    return { success: true, patient }
  } catch (error) {
    console.error("Error creating patient:", error)
    return { error: "Failed to create patient" }
  }
}

// Receptionist Function
export async function updatePatient(
  id: string,
  data: {
    name?: string
    email?: string
    phone?: string
    address?: string
    dateOfBirth?: Date
    gender?: string
    bloodGroup?: string
    doctorId?: string
  },
) {
  try {
    const patient = await prisma.patient.update({
      where: {
        id,
      },
      data,
    })

    revalidatePath(`/dashboard/patients/${id}`)
    revalidatePath("/dashboard/patients")
    return { success: true, patient }
  } catch (error) {
    console.error("Error updating patient:", error)
    return { error: "Failed to update patient" }
  }
}

// Receptionist Function
export async function assignDoctorToPatient(patientId: string, doctorId: string) {
  try {
    const patient = await prisma.patient.update({
      where: {
        id: patientId,
      },
      data: {
        doctorId,
      },
    })

    revalidatePath(`/dashboard/patients/${patientId}`)
    revalidatePath("/dashboard/patients")
    return { success: true, patient }
  } catch (error) {
    console.error("Error assigning doctor to patient:", error)
    return { error: "Failed to assign doctor to patient" }
  }
}

// Receptionist Function
export async function searchPatient(query: string) {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return { patients }
  } catch (error) {
    console.error("Error searching patients:", error)
    return { error: "Failed to search patients" }
  }
}

export async function deletePatient(id: string) {
  try {
    await prisma.patient.delete({
      where: {
        id,
      },
    })

    revalidatePath("/dashboard/patients")
    return { success: true }
  } catch (error) {
    console.error("Error deleting patient:", error)
    return { error: "Failed to delete patient" }
  }
}

export async function getPatientStats() {
  try {
    const totalPatients = await prisma.patient.count()

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    const oneWeekAgo = new Date(today)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const newPatientsThisWeek = await prisma.patient.count({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    })

    const pendingAppointments = await prisma.appointment.count({
      where: {
        status: "SCHEDULED",
      },
    })

    return {
      totalPatients,
      todayAppointments,
      newPatientsThisWeek,
      pendingAppointments,
    }
  } catch (error) {
    console.error("Error fetching patient stats:", error)
    return { error: "Failed to fetch patient statistics" }
  }
}
