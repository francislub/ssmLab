"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, Microscope, CreditCard, Pill, TrendingUp, Activity } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
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
  getTestDistributionData,
  getAppointmentData,
} from "@/lib/actions/dashboard-actions"
import { getRevenueData } from "@/lib/actions/payment-actions"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function DashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<any[]>([])
  const [patientData, setPatientData] = useState<any[]>([])
  const [testData, setTestData] = useState<any[]>([])
  const [appointmentData, setAppointmentData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

        // Fetch test distribution data
        const testResult = await getTestDistributionData()
        if (!testResult.error) {
          setTestData(testResult.testData)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name}!</p>
      </div>

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
              <Card key={index} className="overflow-hidden">
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
                <CardTitle>Test Distribution</CardTitle>
                <CardDescription>Distribution of different types of tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={testData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {testData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
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
                    <BarChart
                      data={[
                        { age: "0-10", male: 50, female: 45 },
                        { age: "11-20", male: 35, female: 40 },
                        { age: "21-30", male: 60, female: 70 },
                        { age: "31-40", male: 80, female: 85 },
                        { age: "41-50", male: 70, female: 65 },
                        { age: "51-60", male: 55, female: 50 },
                        { age: "61-70", male: 40, female: 45 },
                        { age: "71+", male: 30, female: 35 },
                      ]}
                    >
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
                    <LineChart
                      data={[
                        { month: "Jan", normal: 65, abnormal: 28, critical: 7 },
                        { month: "Feb", normal: 59, abnormal: 32, critical: 9 },
                        { month: "Mar", normal: 80, abnormal: 35, critical: 5 },
                        { month: "Apr", normal: 81, abnormal: 30, critical: 11 },
                        { month: "May", normal: 56, abnormal: 25, critical: 8 },
                        { month: "Jun", normal: 55, abnormal: 20, critical: 5 },
                      ]}
                    >
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
