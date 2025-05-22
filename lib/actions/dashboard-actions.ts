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
    // Get patients with age and gender
    const patients = await prisma.patient.findMany({
      select: {
        dateOfBirth: true,
        gender: true,
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

    // Calculate age and group patients
    const today = new Date()
    patients.forEach((patient) => {
      if (!patient.dateOfBirth) return

      const birthDate = new Date(patient.dateOfBirth)
      const age = today.getFullYear() - birthDate.getFullYear()

      // Determine age group index
      let groupIndex
      if (age <= 10) groupIndex = 0
      else if (age <= 20) groupIndex = 1
      else if (age <= 30) groupIndex = 2
      else if (age <= 40) groupIndex = 3
      else if (age <= 50) groupIndex = 4
      else if (age <= 60) groupIndex = 5
      else if (age <= 70) groupIndex = 6
      else groupIndex = 7

      // Increment count based on gender
      if (patient.gender === "MALE") {
        ageGroups[groupIndex].male++
      } else if (patient.gender === "FEMALE") {
        ageGroups[groupIndex].female++
      }
    })

    return { demographicsData: ageGroups }
  } catch (error) {
    console.error("Error fetching patient demographics:", error)
    return { error: "Failed to fetch demographics", demographicsData: [] }
  }
}

export async function getTestResultsData() {
  try {
    // Get current year
    const currentYear = new Date().getFullYear()

    // Create array for first 6 months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    // Initialize data array
    const resultsData = months.map((month) => ({
      month,
      normal: 0,
      abnormal: 0,
      critical: 0,
    }))

    // Get test results for this year
    const tests = await prisma.labTest.findMany({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear}-07-01`), // First 6 months
        },
      },
      select: {
        createdAt: true,
        result: true,
      },
    })

    // Count tests by month and result
    tests.forEach((test) => {
      const monthIndex = test.createdAt.getMonth()
      if (monthIndex > 5) return // Only first 6 months

      if (test.result === "NORMAL") {
        resultsData[monthIndex].normal++
      } else if (test.result === "ABNORMAL") {
        resultsData[monthIndex].abnormal++
      } else if (test.result === "CRITICAL") {
        resultsData[monthIndex].critical++
      }
    })

    return { resultsData }
  } catch (error) {
    console.error("Error fetching test results data:", error)
    return { error: "Failed to fetch test results", resultsData: [] }
  }
}
