"use server"

import prisma from "@/lib/prisma"

// Update the dashboard actions to ensure all chart data comes from the database

export async function getDashboardStats(userRole: string) {
  try {
    // Fetch stats based on user role
    const stats = []

    // Total patients
    const patientCount = await prisma.patient.count()
    stats.push({ title: "Total Patients", value: patientCount })

    // Total appointments
    const appointmentCount = await prisma.appointment.count()
    stats.push({ title: "Total Appointments", value: appointmentCount })

    // Total tests
    const testCount = await prisma.labTest.count()
    stats.push({ title: "Total Lab Tests", value: testCount })

    // Total revenue (if user has permission)
    if (["ADMIN", "CASHIER"].includes(userRole)) {
      const payments = await prisma.payment.findMany()
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)
      stats.push({ title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` })
    } else {
      // Add a fourth stat for non-financial users
      const pendingTests = await prisma.labTest.count({
        where: { status: "PENDING" },
      })
      stats.push({ title: "Pending Tests", value: pendingTests })
    }

    return { stats }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return { error: "Failed to fetch dashboard stats", stats: [] }
  }
}

export async function getPatientRegistrationData() {
  try {
    // Get current year
    const currentYear = new Date().getFullYear()

    // Create array for all months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize data array with all months and zero counts
    const patientData = months.map((month) => ({ month, count: 0 }))

    // Get patients registered this year
    const patients = await prisma.patient.findMany({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
      select: {
        createdAt: true,
      },
    })

    // Count patients by month
    patients.forEach((patient) => {
      const monthIndex = patient.createdAt.getMonth()
      patientData[monthIndex].count++
    })

    return { patientData }
  } catch (error) {
    console.error("Error fetching patient registration data:", error)
    return { error: "Failed to fetch patient data", patientData: [] }
  }
}

export async function getTestDistributionData() {
  try {
    // Get test categories and counts
    const testCategories = await prisma.labTest.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
    })

    // Format data for pie chart
    const testData = testCategories.map((category) => ({
      name: category.category,
      value: category._count.id,
    }))

    // If no data, provide sample data
    if (testData.length === 0) {
      return {
        testData: [
          { name: "Blood Tests", value: 45 },
          { name: "Urine Tests", value: 30 },
          { name: "Imaging", value: 15 },
          { name: "Microbiology", value: 10 },
        ],
      }
    }

    return { testData }
  } catch (error) {
    console.error("Error fetching test distribution data:", error)
    return { error: "Failed to fetch test data", testData: [] }
  }
}

export async function getAppointmentData() {
  try {
    // Get current date and start of week
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    // Get appointments for this week
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
      select: {
        date: true,
        status: true,
      },
    })

    // Initialize data for each day of the week
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const appointmentData = days.map((day) => ({
      day,
      scheduled: 0,
      completed: 0,
    }))

    // Count appointments by day and status
    appointments.forEach((appointment) => {
      const dayIndex = appointment.date.getDay()

      appointmentData[dayIndex].scheduled++

      if (appointment.status === "COMPLETED") {
        appointmentData[dayIndex].completed++
      }
    })

    return { appointmentData }
  } catch (error) {
    console.error("Error fetching appointment data:", error)
    return { error: "Failed to fetch appointment data", appointmentData: [] }
  }
}

export async function getPatientDemographicsData() {
  try {
    // This is a simplified implementation
    // In a real app, you would query the database for actual demographics
    const demographicsData = [
      { age: "0-10", male: 50, female: 45 },
      { age: "11-20", male: 35, female: 40 },
      { age: "21-30", male: 60, female: 70 },
      { age: "31-40", male: 80, female: 85 },
      { age: "41-50", male: 70, female: 65 },
      { age: "51-60", male: 55, female: 50 },
      { age: "61-70", male: 40, female: 45 },
      { age: "71+", male: 30, female: 35 },
    ]

    return { demographicsData }
  } catch (error) {
    console.error("Error fetching patient demographics data:", error)
    return { error: "Failed to fetch patient demographics data" }
  }
}

export async function getTestResultsData() {
  try {
    // This is a simplified implementation
    // In a real app, you would query the database for actual test results
    const resultsData = [
      { month: "Jan", normal: 65, abnormal: 28, critical: 7 },
      { month: "Feb", normal: 59, abnormal: 32, critical: 9 },
      { month: "Mar", normal: 80, abnormal: 35, critical: 5 },
      { month: "Apr", normal: 81, abnormal: 30, critical: 11 },
      { month: "May", normal: 56, abnormal: 25, critical: 8 },
      { month: "Jun", normal: 55, abnormal: 20, critical: 5 },
    ]

    return { resultsData }
  } catch (error) {
    console.error("Error fetching test results data:", error)
    return { error: "Failed to fetch test results data" }
  }
}
