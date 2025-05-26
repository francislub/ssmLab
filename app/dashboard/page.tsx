"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Calendar,
  Microscope,
  CreditCard,
  Pill,
  TrendingUp,
  Activity,
  Clock,
  Plus,
  FileText,
  UserPlus,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  getDashboardStats,
  getPatientRegistrationData,
  getRecentPatientRegistrations,
  getAppointmentData,
  getPatientDemographicsData,
  getTestResultsData,
  getRecentActivities,
  getUpcomingAppointments,
  getLabTestStatus,
  getTodayStats,
} from "@/lib/actions/dashboard-actions"
import { getRevenueData } from "@/lib/actions/payment-actions"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<any[]>([])
  const [patientData, setPatientData] = useState<any[]>([])
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([])
  const [appointmentData, setAppointmentData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [demographicsData, setDemographicsData] = useState<any[]>([])
  const [testResultsData, setTestResultsData] = useState<any[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [testStatus, setTestStatus] = useState<any[]>([])
  const [todayStats, setTodayStats] = useState<any>({})

  const userRole = session?.user?.role || "RECEPTIONIST"

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)

      try {
        // Fetch dashboard stats based on user role
        const statsResult = await getDashboardStats(userRole)
        if (!statsResult.error) {
          setStats(statsResult.stats)
        }

        // Fetch patient registration data
        const patientResult = await getPatientRegistrationData()
        if (!patientResult.error) {
          setPatientData(patientResult.patientData)
        }

        // Fetch recent patient registrations
        const recentResult = await getRecentPatientRegistrations()
        if (!recentResult.error) {
          setRecentRegistrations(recentResult.recentRegistrations)
        }

        // Fetch appointment data
        const appointmentResult = await getAppointmentData()
        if (!appointmentResult.error) {
          setAppointmentData(appointmentResult.appointmentData)
        }

        // Fetch revenue data
        const revenueResult = await getRevenueData()
        if (!revenueResult.error) {
          setRevenueData(revenueResult.revenueData)
        }

        // Fetch patient demographics data
        const demographicsResult = await getPatientDemographicsData()
        if (!demographicsResult.error) {
          setDemographicsData(demographicsResult.demographicsData)
        }

        // Fetch test results data
        const resultsResult = await getTestResultsData()
        if (!resultsResult.error) {
          setTestResultsData(resultsResult.resultsData)
        }

        // Fetch recent activities
        const activitiesResult = await getRecentActivities()
        if (!activitiesResult.error) {
          setRecentActivities(activitiesResult.recentActivities)
        }

        // Fetch upcoming appointments
        const upcomingResult = await getUpcomingAppointments()
        if (!upcomingResult.error) {
          setUpcomingAppointments(upcomingResult.upcomingAppointments)
        }

        // Fetch lab test status
        const testStatusResult = await getLabTestStatus()
        if (!testStatusResult.error) {
          setTestStatus(testStatusResult.testStatus)
        }

        // Fetch today stats
        const todayStatsResult = await getTodayStats()
        if (!todayStatsResult.error) {
          setTodayStats(todayStatsResult.todayStats)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchDashboardData()
    }
  }, [session, userRole])

  // Map icons to stats based on title
  const getIconForStat = (title: string) => {
    if (title.includes("Patient")) return Users
    if (title.includes("Appointment")) return Calendar
    if (title.includes("Test")) return Microscope
    if (title.includes("Revenue") || title.includes("Payment")) return CreditCard
    if (title.includes("Medication") || title.includes("Prescription")) return Pill
    if (title.includes("Week") || title.includes("Month")) return TrendingUp
    return Activity
  }

  // Map colors to stats based on index
  const getColorForStat = (index: number) => {
    const colors = [
      "bg-blue-500 text-white",
      "bg-green-500 text-white",
      "bg-purple-500 text-white",
      "bg-amber-500 text-white",
    ]
    return colors[index % colors.length]
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const formatTime = (date: Date) => {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day",
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">
              {getGreeting()}, {session?.user?.name}! 👋
            </h1>
            <p className="text-xl text-blue-100">
              Welcome back to your <span className="font-semibold text-yellow-300">{userRole.toLowerCase()}</span>{" "}
              dashboard
            </p>
            <p className="text-blue-200">{"Here's what's happening at Kebera Lab today"}</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-200">Today</p>
              <p className="text-2xl font-bold">{new Date().toLocaleDateString()}</p>
            </div>
            <Avatar className="h-16 w-16 border-4 border-white/20">
              <AvatarImage src="/placeholder.svg" alt={session?.user?.name || "User"} />
              <AvatarFallback className="bg-white/20 text-white text-xl">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/10"></div>
        <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-white/10"></div>
      </div>

      {/* Today's Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Today's Patients</p>
                <p className="text-2xl font-bold text-blue-700">{todayStats.patients || 0}</p>
              </div>
              <div className="rounded-full bg-blue-500 p-3 text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-green-700">{todayStats.appointments || 0}</p>
              </div>
              <div className="rounded-full bg-green-500 p-3 text-white">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Today's Tests</p>
                <p className="text-2xl font-bold text-purple-700">{todayStats.tests || 0}</p>
              </div>
              <div className="rounded-full bg-purple-500 p-3 text-white">
                <Microscope className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-amber-700">${todayStats.revenue?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="rounded-full bg-amber-500 p-3 text-white">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
          : stats.map((stat, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`rounded-full p-3 ${getColorForStat(index)}`}>
                      {React.createElement(getIconForStat(stat.title), { className: "h-6 w-6" })}
                    </div>
                  </div>
                </CardContent>
                <div className="h-1 w-full bg-gradient-to-r from-primary to-primary-foreground/20"></div>
              </Card>
            ))}
      </div>

      {/* Quick Actions & Recent Activities */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-blue-500 hover:bg-blue-600" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Patient
            </Button>
            <Button className="w-full justify-start bg-green-500 hover:bg-green-600" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
            <Button className="w-full justify-start bg-purple-500 hover:bg-purple-600" size="sm">
              <Microscope className="mr-2 h-4 w-4" />
              Order Lab Test
            </Button>
            <Button className="w-full justify-start bg-amber-500 hover:bg-amber-600" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`rounded-full p-2 ${activity.color} text-white`}>
                      {activity.icon === "Users" && <Users className="h-4 w-4" />}
                      {activity.icon === "Calendar" && <Calendar className="h-4 w-4" />}
                      {activity.icon === "Microscope" && <Microscope className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(activity.time).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lab Test Status & Upcoming Appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lab Test Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-purple-500" />
              Lab Test Status
            </CardTitle>
            <CardDescription>Current status of all lab tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-12" />
                      </div>
                    ))
                : testStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                        <span className="font-medium">{status.status}</span>
                      </div>
                      <Badge variant="secondary" className="font-bold">
                        {status.count}
                      </Badge>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Next 5 scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
              ) : upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {appointment.patient.firstName.charAt(0)}
                        {appointment.patient.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.type}</p>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(appointment.date).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No upcoming appointments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="tests">Lab Tests</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Registrations</CardTitle>
                <CardDescription>Monthly patient registrations for the current year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={patientData}>
                        <defs>
                          <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#0088FE"
                          fillOpacity={1}
                          fill="url(#colorPatients)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Patient Registrations</CardTitle>
                <CardDescription>Daily patient registrations for the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={recentRegistrations}>
                        <defs>
                          <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#00C49F" stopOpacity={0.3} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [value, "Registrations"]}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Bar
                          dataKey="registrations"
                          fill="url(#colorRegistrations)"
                          stroke="#00C49F"
                          strokeWidth={1}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Appointments</CardTitle>
              <CardDescription>Scheduled vs. completed appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="scheduled" fill="#8884d8" name="Scheduled" />
                      <Bar dataKey="completed" fill="#82ca9d" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Demographics</CardTitle>
              <CardDescription>Age and gender distribution of patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demographicsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="age" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="male" fill="#0088FE" name="Male" />
                      <Bar dataKey="female" fill="#FF8042" name="Female" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Monthly test results by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={testResultsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="normal" stroke="#00C49F" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="abnormal" stroke="#FFBB28" />
                      <Line type="monotone" dataKey="critical" stroke="#FF8042" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Revenue trends for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
