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
      name: category.category || "Uncategorized",
      value: category._count.id,
    }))

    // If no data, return empty array (charts will handle empty state)
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
    // Get all patients with their gender and date of birth
    const patients = await prisma.patient.findMany({
      select: {
        gender: true,
        dateOfBirth: true,
      },
    })

    // Initialize age groups
    const ageGroups = [
      { age: "0-10", male: 0, female: 0 },
      { age: "11-20", male: 0, female: 0 },
      { age: "21-30", male: 0, female: 0 },
      { age: "31-40", male: 0, female: 0 },
      { age: "41-50", male: 0, female: 0 },
      { age: "51-60", male: 0, female: 0 },
      { age: "61-70", male: 0, female: 0 },
      { age: "71+", male: 0, female: 0 },
    ]

    // Calculate age and categorize patients
    const currentDate = new Date()

    patients.forEach((patient) => {
      if (!patient.dateOfBirth) return

      // Calculate age
      const age = currentDate.getFullYear() - patient.dateOfBirth.getFullYear()
      const monthDiff = currentDate.getMonth() - patient.dateOfBirth.getMonth()
      const actualAge =
        monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < patient.dateOfBirth.getDate()) ? age - 1 : age

      // Determine age group index
      let ageGroupIndex = 0
      if (actualAge <= 10) ageGroupIndex = 0
      else if (actualAge <= 20) ageGroupIndex = 1
      else if (actualAge <= 30) ageGroupIndex = 2
      else if (actualAge <= 40) ageGroupIndex = 3
      else if (actualAge <= 50) ageGroupIndex = 4
      else if (actualAge <= 60) ageGroupIndex = 5
      else if (actualAge <= 70) ageGroupIndex = 6
      else ageGroupIndex = 7

      // Increment count based on gender
      if (patient.gender === "MALE") {
        ageGroups[ageGroupIndex].male++
      } else if (patient.gender === "FEMALE") {
        ageGroups[ageGroupIndex].female++
      }
    })

    return { demographicsData: ageGroups }
  } catch (error) {
    console.error("Error fetching patient demographics data:", error)
    return {
      error: "Failed to fetch patient demographics data",
      demographicsData: [
        { age: "0-10", male: 0, female: 0 },
        { age: "11-20", male: 0, female: 0 },
        { age: "21-30", male: 0, female: 0 },
        { age: "31-40", male: 0, female: 0 },
        { age: "41-50", male: 0, female: 0 },
        { age: "51-60", male: 0, female: 0 },
        { age: "61-70", male: 0, female: 0 },
        { age: "71+", male: 0, female: 0 },
      ],
    }
  }
}

export async function getTestResultsData() {
  try {
    // Get current year
    const currentYear = new Date().getFullYear()

    // Create array for all months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize data array with all months and zero counts
    const resultsData = months.map((month) => ({
      month,
      normal: 0,
      abnormal: 0,
      critical: 0,
    }))

    // Get lab tests with results from this year
    const labTests = await prisma.labTest.findMany({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
        status: "COMPLETED",
        result: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        result: true,
      },
    })

    // Count test results by month and category
    labTests.forEach((test) => {
      const monthIndex = test.createdAt.getMonth()

      if (test.result) {
        // Simple categorization based on result content
        // You can enhance this logic based on your specific result format
        const resultLower = test.result.toLowerCase()

        if (resultLower.includes("critical") || resultLower.includes("urgent") || resultLower.includes("high risk")) {
          resultsData[monthIndex].critical++
        } else if (
          resultLower.includes("abnormal") ||
          resultLower.includes("elevated") ||
          resultLower.includes("low")
        ) {
          resultsData[monthIndex].abnormal++
        } else {
          resultsData[monthIndex].normal++
        }
      }
    })

    return { resultsData }
  } catch (error) {
    console.error("Error fetching test results data:", error)
    return {
      error: "Failed to fetch test results data",
      resultsData: [
        { month: "Jan", normal: 0, abnormal: 0, critical: 0 },
        { month: "Feb", normal: 0, abnormal: 0, critical: 0 },
        { month: "Mar", normal: 0, abnormal: 0, critical: 0 },
        { month: "Apr", normal: 0, abnormal: 0, critical: 0 },
        { month: "May", normal: 0, abnormal: 0, critical: 0 },
        { month: "Jun", normal: 0, abnormal: 0, critical: 0 },
        { month: "Jul", normal: 0, abnormal: 0, critical: 0 },
        { month: "Aug", normal: 0, abnormal: 0, critical: 0 },
        { month: "Sep", normal: 0, abnormal: 0, critical: 0 },
        { month: "Oct", normal: 0, abnormal: 0, critical: 0 },
        { month: "Nov", normal: 0, abnormal: 0, critical: 0 },
        { month: "Dec", normal: 0, abnormal: 0, critical: 0 },
      ],
    }
  }
}
