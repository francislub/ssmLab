"use server"

import prisma from "@/lib/prisma"

export async function getDashboardStats(userRole: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const oneWeekAgo = new Date(today)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Common stats
    const totalPatients = await prisma.patient.count()
    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    })

    // Role-specific stats
    let stats = []

    switch (userRole) {
      case "RECEPTIONIST":
        const newPatientsWeek = await prisma.patient.count({
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

        stats = [
          { title: "Total Patients", value: totalPatients.toString() },
          { title: "Appointments Today", value: todayAppointments.toString() },
          { title: "New Patients (Week)", value: newPatientsWeek.toString() },
          { title: "Pending Appointments", value: pendingAppointments.toString() },
        ]
        break

      case "DOCTOR":
        const assignedPatients = await prisma.patient.count({
          where: {
            doctorId: {
              not: null,
            },
          },
        })

        const pendingLabResults = await prisma.testRequest.count({
          where: {
            status: {
              in: ["REQUESTED", "IN_PROGRESS"],
            },
          },
        })

        const completedDiagnoses = await prisma.diagnosis.count()

        stats = [
          { title: "Assigned Patients", value: assignedPatients.toString() },
          { title: "Today's Appointments", value: todayAppointments.toString() },
          { title: "Pending Lab Results", value: pendingLabResults.toString() },
          { title: "Completed Diagnoses", value: completedDiagnoses.toString() },
        ]
        break

      case "LAB_TECHNICIAN":
        const pendingTests = await prisma.testRequest.count({
          where: {
            status: {
              in: ["REQUESTED", "IN_PROGRESS"],
            },
          },
        })

        const completedToday = await prisma.testResult.count({
          where: {
            createdAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        })

        const weeklyTests = await prisma.testRequest.count({
          where: {
            createdAt: {
              gte: oneWeekAgo,
            },
          },
        })

        // For demo purposes, consider 5% of pending tests as urgent
        const urgentTests = Math.ceil(pendingTests * 0.05)

        stats = [
          { title: "Pending Tests", value: pendingTests.toString() },
          { title: "Completed Today", value: completedToday.toString() },
          { title: "Total Tests (Week)", value: weeklyTests.toString() },
          { title: "Urgent Tests", value: urgentTests.toString() },
        ]
        break

      case "CASHIER":
        const pendingPayments = await prisma.payment.count({
          where: {
            status: "PENDING",
          },
        })

        const todayRevenue = await prisma.payment.aggregate({
          where: {
            createdAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
            status: "COMPLETED",
          },
          _sum: {
            amount: true,
          },
        })

        const transactionsToday = await prisma.payment.count({
          where: {
            createdAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        })

        const weeklyRevenue = await prisma.payment.aggregate({
          where: {
            createdAt: {
              gte: oneWeekAgo,
            },
            status: "COMPLETED",
          },
          _sum: {
            amount: true,
          },
        })

        stats = [
          { title: "Pending Payments", value: pendingPayments.toString() },
          { title: "Today's Revenue", value: `$${(todayRevenue._sum.amount || 0).toLocaleString()}` },
          { title: "Transactions Today", value: transactionsToday.toString() },
          { title: "Weekly Revenue", value: `$${(weeklyRevenue._sum.amount || 0).toLocaleString()}` },
        ]
        break

      case "PHARMACIST":
        const pendingPrescriptions = await prisma.prescriptionMedication.count({
          where: {
            medicationDispenses: {
              none: {},
            },
          },
        })

        const dispensedToday = await prisma.medicationDispense.count({
          where: {
            createdAt: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
            status: "DISPENSED",
          },
        })

        const lowStockItems = await prisma.medicationInventory.count({
          where: {
            quantity: {
              lt: 20,
            },
          },
        })

        const totalMedications = await prisma.medicationInventory.count()

        stats = [
          { title: "Pending Prescriptions", value: pendingPrescriptions.toString() },
          { title: "Dispensed Today", value: dispensedToday.toString() },
          { title: "Low Stock Items", value: lowStockItems.toString() },
          { title: "Total Medications", value: totalMedications.toString() },
        ]
        break

      default: // ADMIN
        const totalStaff = await prisma.user.count()

        const monthlyRevenue = await prisma.payment.aggregate({
          where: {
            createdAt: {
              gte: new Date(today.getFullYear(), today.getMonth(), 1),
            },
            status: "COMPLETED",
          },
          _sum: {
            amount: true,
          },
        })

        const testsPerformed = await prisma.testResult.count()

        stats = [
          { title: "Total Patients", value: totalPatients.toString() },
          { title: "Total Staff", value: totalStaff.toString() },
          { title: "Monthly Revenue", value: `$${(monthlyRevenue._sum.amount || 0).toLocaleString()}` },
          { title: "Tests Performed", value: testsPerformed.toString() },
        ]
    }

    return { stats }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { error: "Failed to fetch dashboard statistics" }
  }
}

export async function getPatientRegistrationData() {
  try {
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)

    const monthlyRegistrations = await prisma.$queryRaw`
      SELECT 
        MONTH(createdAt) as month,
        COUNT(*) as count
      FROM Patient
      WHERE createdAt >= ${startOfYear}
      GROUP BY MONTH(createdAt)
      ORDER BY month
    `

    // Format the data for the chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const patientData = months.map((month, index) => {
      const monthData = (monthlyRegistrations as any[]).find((item) => item.month === index + 1)
      return {
        month,
        count: monthData ? Number(monthData.count) : 0,
      }
    })

    return { patientData }
  } catch (error) {
    console.error("Error fetching patient registration data:", error)
    return { error: "Failed to fetch patient registration data" }
  }
}

export async function getTestDistributionData() {
  try {
    const testDistribution = await prisma.testRequest.groupBy({
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

    const testData = testDistribution.map((item) => ({
      name: item.testType,
      value: item._count.testType,
    }))

    return { testData }
  } catch (error) {
    console.error("Error fetching test distribution data:", error)
    return { error: "Failed to fetch test distribution data" }
  }
}

export async function getAppointmentData() {
  try {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday

    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    const appointmentsByDay = await prisma.$queryRaw`
      SELECT 
        DAYOFWEEK(date) as day,
        COUNT(*) as scheduled,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
      FROM Appointment
      WHERE date >= ${weekStart} AND date <= ${weekEnd}
      GROUP BY DAYOFWEEK(date)
      ORDER BY day
    `

    // Format the data for the chart
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const appointmentData = days.map((day, index) => {
      const dayData = (appointmentsByDay as any[]).find((item) => item.day === index + 1)
      return {
        day,
        scheduled: dayData ? Number(dayData.scheduled) : 0,
        completed: dayData ? Number(dayData.completed) : 0,
      }
    })

    return { appointmentData }
  } catch (error) {
    console.error("Error fetching appointment data:", error)
    return { error: "Failed to fetch appointment data" }
  }
}
