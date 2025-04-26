"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  getAppointmentStats,
} from "@/lib/actions/appointment-actions"
import { getPatients } from "@/lib/actions/patient-actions"

export default function AppointmentsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    weeklyAppointments: [],
  })

  const [appointmentForm, setAppointmentForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    notes: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch appointment stats
      const statsResult = await getAppointmentStats()
      if (!statsResult.error) {
        setStats(statsResult)
      }

      // Fetch patients for the appointment form
      const patientsResult = await getPatients()
      if (!patientsResult.error) {
        setPatients(patientsResult.patients)
      }

      // Fetch appointments
      const status =
        activeTab === "all"
          ? undefined
          : activeTab === "scheduled"
            ? "SCHEDULED"
            : activeTab === "completed"
              ? "COMPLETED"
              : activeTab === "cancelled"
                ? "CANCELLED"
                : undefined

      const result = await getAppointments(searchTerm, status)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setAppointments(result.appointments)
      }
      setLoading(false)
    }

    fetchData()
  }, [activeTab, searchTerm, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAppointmentForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setAppointmentForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!appointmentForm.patientId || !appointmentForm.doctorId || !appointmentForm.date || !appointmentForm.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const appointmentDateTime = new Date(`${appointmentForm.date}T${appointmentForm.time}`)

    const result = await createAppointment({
      patientId: appointmentForm.patientId,
      doctorId: appointmentForm.doctorId,
      date: appointmentDateTime,
      notes: appointmentForm.notes,
    })

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      })
      setIsAddAppointmentOpen(false)
      setAppointmentForm({
        patientId: "",
        doctorId: "",
        date: "",
        time: "",
        notes: "",
      })

      // Refresh appointments
      const status =
        activeTab === "all"
          ? undefined
          : activeTab === "scheduled"
            ? "SCHEDULED"
            : activeTab === "completed"
              ? "COMPLETED"
              : activeTab === "cancelled"
                ? "CANCELLED"
                : undefined

      const updatedResult = await getAppointments(searchTerm, status)
      if (!updatedResult.error) {
        setAppointments(updatedResult.appointments)
      }
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    const result = await updateAppointment(id, {
      status: status as any,
    })

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      })

      // Refresh appointments
      const status =
        activeTab === "all"
          ? undefined
          : activeTab === "scheduled"
            ? "SCHEDULED"
            : activeTab === "completed"
              ? "COMPLETED"
              : activeTab === "cancelled"
                ? "CANCELLED"
                : undefined

      const updatedResult = await getAppointments(searchTerm, status)
      if (!updatedResult.error) {
        setAppointments(updatedResult.appointments)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>Create a new appointment for a patient</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitAppointment}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient</Label>
                  <Select
                    value={appointmentForm.patientId}
                    onValueChange={(value) => handleSelectChange("patientId", value)}
                    required
                  >
                    <SelectTrigger id="patientId">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorId">Doctor</Label>
                  <Select
                    value={appointmentForm.doctorId}
                    onValueChange={(value) => handleSelectChange("doctorId", value)}
                    required
                  >
                    <SelectTrigger id="doctorId">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-sarah">Dr. Sarah Johnson</SelectItem>
                      <SelectItem value="dr-michael">Dr. Michael Chen</SelectItem>
                      <SelectItem value="dr-james">Dr. James Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={appointmentForm.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={appointmentForm.time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={appointmentForm.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional notes about the appointment..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddAppointmentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule Appointment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search appointments or patients..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Select defaultValue="date-desc">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                  <SelectItem value="patient">Patient Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all">All Appointments</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.id.substring(0, 8)}</TableCell>
                          <TableCell className="font-medium">{appointment.patient.name}</TableCell>
                          <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {new Date(appointment.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>{appointment.doctor.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                appointment.status === "COMPLETED"
                                  ? "outline"
                                  : appointment.status === "CANCELLED"
                                    ? "destructive"
                                    : "default"
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {appointment.status === "SCHEDULED" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(appointment.id, "COMPLETED")}
                                  >
                                    Complete
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(appointment.id, "CANCELLED")}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="scheduled" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.id.substring(0, 8)}</TableCell>
                          <TableCell className="font-medium">{appointment.patient.name}</TableCell>
                          <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {new Date(appointment.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>{appointment.doctor.name}</TableCell>
                          <TableCell>
                            <Badge variant="default">SCHEDULED</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(appointment.id, "COMPLETED")}
                              >
                                Complete
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(appointment.id, "CANCELLED")}
                              >
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No scheduled appointments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="completed" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.id.substring(0, 8)}</TableCell>
                          <TableCell className="font-medium">{appointment.patient.name}</TableCell>
                          <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {new Date(appointment.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>{appointment.doctor.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">COMPLETED</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No completed appointments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="cancelled" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : appointments.length > 0 ? (
                      appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.id.substring(0, 8)}</TableCell>
                          <TableCell className="font-medium">{appointment.patient.name}</TableCell>
                          <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {new Date(appointment.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>{appointment.doctor.name}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">CANCELLED</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No cancelled appointments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">Showing {appointments.length} appointments</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
