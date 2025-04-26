"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Doctor Function
export async function referToSpecialist(
  patientId: string,
  referringDoctorId: string,
  specialistId: string,
  reason: string,
  notes?: string,
) {
  try {
    const referral = await prisma.referral.create({
      data: {
        patient: {
          connect: {
            id: patientId,
          },
        },
        referringDoctor: {
          connect: {
            id: referringDoctorId,
          },
        },
        specialist: {
          connect: {
            id: specialistId,
          },
        },
        reason,
        notes,
        status: "PENDING",
      },
      include: {
        patient: true,
        referringDoctor: true,
        specialist: true,
      },
    })

    revalidatePath(`/dashboard/patients/${patientId}`)
    return { success: true, referral }
  } catch (error) {
    console.error("Error creating referral:", error)
    return { error: "Failed to create referral" }
  }
}

export async function getReferrals(patientId?: string, status?: string) {
  try {
    const referrals = await prisma.referral.findMany({
      where: {
        AND: [patientId ? { patientId } : {}, status ? { status: status as any } : {}],
      },
      include: {
        patient: true,
        referringDoctor: true,
        specialist: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { referrals }
  } catch (error) {
    console.error("Error fetching referrals:", error)
    return { error: "Failed to fetch referrals" }
  }
}

export async function updateReferralStatus(id: string, status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED") {
  try {
    const referral = await prisma.referral.update({
      where: {
        id,
      },
      data: {
        status,
      },
      include: {
        patient: true,
      },
    })

    revalidatePath(`/dashboard/patients/${referral.patientId}`)
    return { success: true, referral }
  } catch (error) {
    console.error("Error updating referral status:", error)
    return { error: "Failed to update referral status" }
  }
}
