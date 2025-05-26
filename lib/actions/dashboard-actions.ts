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

export async function getRecentPatientRegistrations() {
  try {
    // Get the last 7 days
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    // Initialize data for each day
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      days.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.toISOString().split("T")[0],
        registrations: 0,
      })
    }

    // Get patients registered in the last 7 days
    const patients = await prisma.patient.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
          lte: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Include today
        },
      },
      select: {
        createdAt: true,
      },
    })

    // Count registrations by day
    patients.forEach((patient) => {
      const patientDate = patient.createdAt.toISOString().split("T")[0]
      const dayData = days.find((day) => day.date === patientDate)
      if (dayData) {
        dayData.registrations++
      }
    })

    return { recentRegistrations: days }
  } catch (error) {
    console.error("Error fetching recent patient registrations:", error)
    return { error: "Failed to fetch recent registrations", recentRegistrations: [] }
  }
}

export async function getRecentActivities() {
  try {
    // Get recent patients (last 5)
    const recentPatients = await prisma.patient.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    })

    // Get recent appointments (last 3)
    const recentAppointments = await prisma.appointment.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Get recent lab tests (last 3)
    const recentTests = await prisma.labTest.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Combine and format activities
    const activities = []

    recentPatients.forEach((patient) => {
      activities.push({
        id: `patient-${patient.id}`,
        type: "patient",
        title: "New Patient Registered",
        description: `${patient.firstName} ${patient.lastName}`,
        time: patient.createdAt,
        icon: "Users",
        color: "bg-blue-500",
      })
    })

    recentAppointments.forEach((appointment) => {
      activities.push({
        id: `appointment-${appointment.id}`,
        type: "appointment",
        title: "New Appointment",
        description: `${appointment.patient.firstName} ${appointment.patient.lastName} - ${appointment.type}`,
        time: appointment.createdAt,
        icon: "Calendar",
        color: "bg-green-500",
      })
    })

    recentTests.forEach((test) => {
      activities.push({
        id: `test-${test.id}`,
        type: "test",
        title: "Lab Test Ordered",
        description: `${test.patient.firstName} ${test.patient.lastName} - ${test.testName}`,
        time: test.createdAt,
        icon: "Microscope",
        color: "bg-purple-500",
      })
    })

    // Sort by time and take latest 8
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    const recentActivities = activities.slice(0, 8)

    return { recentActivities }
  } catch (error) {
    console.error("Error fetching recent activities:", error)
    return { error: "Failed to fetch recent activities", recentActivities: [] }
  }
}

export async function getUpcomingAppointments() {
  try {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: today,
          lte: nextWeek,
        },
        status: "SCHEDULED",
      },
      take: 5,
      orderBy: { date: "asc" },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return { upcomingAppointments }
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error)
    return { error: "Failed to fetch upcoming appointments", upcomingAppointments: [] }
  }
}

export async function getLabTestStatus() {
  try {
    const pendingTests = await prisma.labTest.count({
      where: { status: "PENDING" },
    })

    const inProgressTests = await prisma.labTest.count({
      where: { status: "IN_PROGRESS" },
    })

    const completedTests = await prisma.labTest.count({
      where: { status: "COMPLETED" },
    })

    const testStatus = [
      { status: "Pending", count: pendingTests, color: "bg-yellow-500" },
      { status: "In Progress", count: inProgressTests, color: "bg-blue-500" },
      { status: "Completed", count: completedTests, color: "bg-green-500" },
    ]

    return { testStatus }
  } catch (error) {
    console.error("Error fetching lab test status:", error)
    return { error: "Failed to fetch lab test status", testStatus: [] }
  }
}

export async function getTodayStats() {
  try {
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const todayPatients = await prisma.patient.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const todayTests = await prisma.labTest.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const todayPayments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const todayRevenue = todayPayments.reduce((sum, payment) => sum + payment.amount, 0)

    return {
      todayStats: {
        patients: todayPatients,
        appointments: todayAppointments,
        tests: todayTests,
        revenue: todayRevenue,
      },
    }
  } catch (error) {
    console.error("Error fetching today stats:", error)
    return {
      error: "Failed to fetch today stats",
      todayStats: { patients: 0, appointments: 0, tests: 0, revenue: 0 },
    }
  }
}
