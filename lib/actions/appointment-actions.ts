"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Receptionist Function
export async function getAppointments(query?: string, status?: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { patient: { name: { contains: query, mode: "insensitive" } } },
                  { doctor: { name: { contains: query, mode: "insensitive" } } },
                ],
              }
            : {},
          status ? { status: status as any } : {},
        ],
      },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return { appointments }
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return { error: "Failed to fetch appointments" }
  }
}

export async function getAppointmentById(id: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id,
      },
      include: {
        patient: true,
        doctor: true,
      },
    })

    if (!appointment) {
      return { error: "Appointment not found" }
    }

    return { appointment }
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return { error: "Failed to fetch appointment" }
  }
}

// Receptionist Function
export async function createAppointment(data: {
  patientId: string
  doctorId: string
  date: Date
  notes?: string
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
}) {
  try {
    const appointment = await prisma.appointment.create({
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
        date: data.date,
        notes: data.notes,
        status: data.status || "SCHEDULED",
      },
      include: {
        patient: true,
        doctor: true,
      },
    })

    revalidatePath("/dashboard/appointments")
    revalidatePath(`/dashboard/patients/${data.patientId}`)
    return { success: true, appointment }
  } catch (error) {
    console.error("Error creating appointment:", error)
    return { error: "Failed to create appointment" }
  }
}

// Receptionist Function
export async function scheduleAppointment(patientId: string, doctorId: string, date: Date, notes?: string) {
  return createAppointment({
    patientId,
    doctorId,
    date,
    notes,
  })
}

export async function updateAppointment(
  id: string,
  data: {
    date?: Date
    notes?: string
    status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  },
) {
  try {
    const appointment = await prisma.appointment.update({
      where: {
        id,
      },
      data,
      include: {
        patient: true,
        doctor: true,
      },
    })

    revalidatePath("/dashboard/appointments")
    revalidatePath(`/dashboard/patients/${appointment.patientId}`)
    return { success: true, appointment }
  } catch (error) {
    console.error("Error updating appointment:", error)
    return { error: "Failed to update appointment" }
  }
}

export async function deleteAppointment(id: string) {
  try {
    const appointment = await prisma.appointment.delete({
      where: {
        id,
      },
    })

    revalidatePath("/dashboard/appointments")
    revalidatePath(`/dashboard/patients/${appointment.patientId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return { error: "Failed to delete appointment" }
  }
}

export async function getAppointmentStats() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    // Get appointments for each day of the week
    const weeklyAppointments = await prisma.$queryRaw`
      SELECT 
        DATE(date) as day,
        COUNT(*) as scheduled,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
      FROM Appointment
      WHERE date >= ${weekStart} AND date <= ${weekEnd}
      GROUP BY DATE(date)
      ORDER BY DATE(date)
    `

    return { weeklyAppointments }
  } catch (error) {
    console.error("Error fetching appointment stats:", error)
    return { error: "Failed to fetch appointment statistics" }
  }
}
