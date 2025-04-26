"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Lab Technician Function: View assigned tests
export async function viewAssignedTests(technicianId?: string) {
  try {
    const testRequests = await prisma.testRequest.findMany({
      where: {
        OR: [
          { status: "REQUESTED" },
          { status: "IN_PROGRESS" },
          {
            testResult: {
              technicianId: technicianId,
            },
          },
        ],
      },
      include: {
        diagnosis: {
          include: {
            patient: true,
            doctor: true,
          },
        },
        testResult: {
          include: {
            technician: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { testRequests }
  } catch (error) {
    console.error("Error fetching assigned tests:", error)
    return { error: "Failed to fetch assigned tests" }
  }
}

// Lab Technician Function: Record test results
export async function recordTestResults(
  patientId: string,
  testResults: {
    testRequestId: string
    technicianId: string
    result: string
    reportUrl?: string
  },
) {
  try {
    // Update test request status
    await prisma.testRequest.update({
      where: {
        id: testResults.testRequestId,
      },
      data: {
        status: "COMPLETED",
      },
    })

    // Create test result
    const testResult = await prisma.testResult.create({
      data: {
        testRequest: {
          connect: {
            id: testResults.testRequestId,
          },
        },
        patient: {
          connect: {
            id: patientId,
          },
        },
        technician: {
          connect: {
            id: testResults.technicianId,
          },
        },
        result: testResults.result,
        reportUrl: testResults.reportUrl,
      },
      include: {
        testRequest: true,
        patient: true,
        technician: true,
      },
    })

    revalidatePath("/dashboard/lab-tests")
    revalidatePath(`/dashboard/patients/${patientId}`)
    return { success: true, testResult }
  } catch (error) {
    console.error("Error recording test results:", error)
    return { error: "Failed to record test results" }
  }
}

// Lab Technician Function: Update test status
export async function updateTestStatus(
  patientId: string,
  testId: string,
  status: "REQUESTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
) {
  try {
    const testRequest = await prisma.testRequest.update({
      where: {
        id: testId,
      },
      data: {
        status,
      },
      include: {
        diagnosis: {
          include: {
            patient: true,
          },
        },
      },
    })

    revalidatePath("/dashboard/lab-tests")
    revalidatePath(`/dashboard/patients/${patientId}`)
    return { success: true, testRequest }
  } catch (error) {
    console.error("Error updating test status:", error)
    return { error: "Failed to update test status" }
  }
}

// Lab Technician Function: Upload test report
export async function uploadTestReport(patientId: string, testId: string, reportUrl: string) {
  try {
    // Check if test result exists
    const existingResult = await prisma.testResult.findFirst({
      where: {
        testRequest: { id: testId },
      },
    })

    if (existingResult) {
      // Update existing test result
      const testResult = await prisma.testResult.update({
        where: {
          id: existingResult.id,
        },
        data: {
          reportUrl,
        },
      })

      revalidatePath("/dashboard/lab-tests")
      revalidatePath(`/dashboard/patients/${patientId}`)
      return { success: true, testResult }
    } else {
      return { error: "Test result not found. Please record test results first." }
    }
  } catch (error) {
    console.error("Error uploading test report:", error)
    return { error: "Failed to upload test report" }
  }
}

// Lab Technician Function: View test history
export async function viewTestHistory(patientId: string) {
  try {
    const testHistory = await prisma.testResult.findMany({
      where: {
        patientId,
      },
      include: {
        testRequest: {
          include: {
            diagnosis: {
              include: {
                doctor: true,
              },
            },
          },
        },
        technician: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { testHistory }
  } catch (error) {
    console.error("Error fetching test history:", error)
    return { error: "Failed to fetch test history" }
  }
}

export async function getTestRequests(query?: string, status?: string) {
  try {
    const testRequests = await prisma.testRequest.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { testType: { contains: query, mode: "insensitive" } },
                  { diagnosis: { patient: { name: { contains: query, mode: "insensitive" } } } },
                ],
              }
            : {},
          status ? { status: status as any } : {},
        ],
      },
      include: {
        diagnosis: {
          include: {
            patient: true,
            doctor: true,
          },
        },
        testResult: {
          include: {
            technician: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { testRequests }
  } catch (error) {
    console.error("Error fetching test requests:", error)
    return { error: "Failed to fetch test requests" }
  }
}

export async function getTestRequestById(id: string) {
  try {
    const testRequest = await prisma.testRequest.findUnique({
      where: {
        id,
      },
      include: {
        diagnosis: {
          include: {
            patient: true,
            doctor: true,
          },
        },
        testResult: {
          include: {
            technician: true,
          },
        },
      },
    })

    if (!testRequest) {
      return { error: "Test request not found" }
    }

    return { testRequest }
  } catch (error) {
    console.error("Error fetching test request:", error)
    return { error: "Failed to fetch test request" }
  }
}

// Doctor Function
export async function suggestLabTests(patientId: string, doctorId: string, testList: string[], notes: string) {
  try {
    // First create a diagnosis
    const diagnosis = await prisma.diagnosis.create({
      data: {
        patient: {
          connect: {
            id: patientId,
          },
        },
        doctor: {
          connect: {
            id: doctorId,
          },
        },
        notes: `Lab tests requested: ${notes}`,
      },
    })

    // Then create test requests
    const testRequests = await Promise.all(
      testList.map((testType) =>
        prisma.testRequest.create({
          data: {
            diagnosis: {
              connect: {
                id: diagnosis.id,
              },
            },
            testType,
            status: "REQUESTED",
          },
        }),
      ),
    )

    revalidatePath(`/dashboard/patients/${patientId}`)
    revalidatePath("/dashboard/lab-tests")
    return { success: true, diagnosis, testRequests }
  } catch (error) {
    console.error("Error suggesting lab tests:", error)
    return { error: "Failed to suggest lab tests" }
  }
}

// Doctor Function
export async function viewTestResults(patientId: string) {
  try {
    const testResults = await prisma.testResult.findMany({
      where: {
        patientId,
      },
      include: {
        testRequest: {
          include: {
            diagnosis: true,
          },
        },
        technician: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { testResults }
  } catch (error) {
    console.error("Error fetching test results:", error)
    return { error: "Failed to fetch test results" }
  }
}

export async function updateTestRequest(
  id: string,
  data: {
    status?: "REQUESTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  },
) {
  try {
    const testRequest = await prisma.testRequest.update({
      where: {
        id,
      },
      data,
      include: {
        diagnosis: {
          include: {
            patient: true,
          },
        },
      },
    })

    revalidatePath("/dashboard/lab-tests")
    revalidatePath(`/dashboard/patients/${testRequest.diagnosis.patient.id}`)
    return { success: true, testRequest }
  } catch (error) {
    console.error("Error updating test request:", error)
    return { error: "Failed to update test request" }
  }
}

export async function recordTestResult(data: {
  testRequestId: string
  patientId: string
  technicianId: string
  result: string
  reportUrl?: string
}) {
  try {
    // Update test request status
    await prisma.testRequest.update({
      where: {
        id: data.testRequestId,
      },
      data: {
        status: "COMPLETED",
      },
    })

    // Create test result
    const testResult = await prisma.testResult.create({
      data: {
        testRequest: {
          connect: {
            id: data.testRequestId,
          },
        },
        patient: {
          connect: {
            id: data.patientId,
          },
        },
        technician: {
          connect: {
            id: data.technicianId,
          },
        },
        result: data.result,
        reportUrl: data.reportUrl,
      },
      include: {
        testRequest: true,
        patient: true,
        technician: true,
      },
    })

    revalidatePath("/dashboard/lab-tests")
    revalidatePath(`/dashboard/patients/${data.patientId}`)
    return { success: true, testResult }
  } catch (error) {
    console.error("Error recording test result:", error)
    return { error: "Failed to record test result" }
  }
}

export async function getTestStats() {
  try {
    // Count tests by type
    const testsByType = await prisma.testRequest.groupBy({
      by: ["testType"],
      _count: {
        testType: true,
      },
      orderBy: {
        _count: {
          testType: "desc",
        },
      },
      take: 5,
    })

    // Count tests by status
    const testsByStatus = await prisma.testRequest.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    })

    // Get pending tests count
    const pendingTests = await prisma.testRequest.count({
      where: {
        status: {
          in: ["REQUESTED", "IN_PROGRESS"],
        },
      },
    })

    // Get completed tests today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const completedToday = await prisma.testResult.count({
      where: {
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    // Get weekly test count
    const oneWeekAgo = new Date(today)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklyTestCount = await prisma.testRequest.count({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    })

    // Get urgent tests (for demo purposes, we'll consider 5% of pending tests as urgent)
    const urgentTests = Math.ceil(pendingTests * 0.05)

    return {
      testsByType: testsByType.map((item) => ({
        name: item.testType,
        value: item._count.testType,
      })),
      testsByStatus,
      pendingTests,
      completedToday,
      weeklyTestCount,
      urgentTests,
    }
  } catch (error) {
    console.error("Error fetching test stats:", error)
    return { error: "Failed to fetch test statistics" }
  }
}
