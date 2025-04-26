"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Edit, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getPatientById } from "@/lib/actions/patient-actions"
import { createAppointment } from "@/lib/actions/appointment-actions"
import { createDiagnosis } from "@/lib/actions/diagnosis-actions"
import { getDoctors } from "@/lib/actions/user-actions"
import { useSession } from "next-auth/react"

export default function PatientDetailsPage() {
  const params = useParams()
  const patientId = params.id as string
  const { data: session } = useSession()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false)
  const [isAddDiagnosisOpen, setIsAddDiagnosisOpen] = useState(false)
  const [isAddTestOpen, setIsAddTestOpen] = useState(false)
  const [patient, setPatient] = useState<any>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    time: "",
    doctorId: "",
    notes: "",
  })

  const [diagnosisForm, setDiagnosisForm] = useState({
    diagnosis: "",
    notes: "",
    testType: "",
  })

  const [testForm, setTestForm] = useState({
    testType: "",
    notes: "",
    urgency: "normal",
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch doctors
      const doctorsResult = await getDoctors()
      if (!doctorsResult.error) {
        setDoctors(doctorsResult.doctors)
      }

      // Fetch patient data
      const patientResult = await getPatientById(patientId)
      if (patientResult.error) {
        toast({
          title: "Error",
          description: patientResult.error,
          variant: "destructive",
        })
      } else {
        setPatient(patientResult.patient)
      }

      setLoading(false)
    }

    fetchData()
  }, [patientId, toast])

  const handleAppointmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAppointmentForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAppointmentSelectChange = (name: string, value: string) => {
    setAppointmentForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDiagnosisInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDiagnosisForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleDiagnosisSelectChange = (name: string, value: string) => {
    setDiagnosisForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTestInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTestForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTestSelectChange = (name: string, value: string) => {
    setTestForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!appointmentForm.date || !appointmentForm.time || !appointmentForm.doctorId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const appointmentDateTime = new Date(`${appointmentForm.date}T${appointmentForm.time}`)

    const result = await createAppointment({
      patientId,
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
        date: "",
        time: "",
        doctorId: "",
        notes: "",
      })

      // Refresh patient data
      const updatedResult = await getPatientById(patientId)
      if (!updatedResult.error) {
        setPatient(updatedResult.patient)
      }
    }
  }

  const handleSubmitDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!diagnosisForm.diagnosis || !diagnosisForm.notes) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const testRequests = diagnosisForm.testType
      ? [{ testType: diagnosisForm.testType, status: "REQUESTED" }]
      : undefined

    const result = await createDiagnosis({
      patientId,
      doctorId: session?.user?.id || "",
      notes: `${diagnosisForm.diagnosis}: ${diagnosisForm.notes}`,
      testRequests,
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
        description: "Diagnosis recorded successfully",
      })
      setIsAddDiagnosisOpen(false)
      setDiagnosisForm({
        diagnosis: "",
        notes: "",
        testType: "",
      })

      // Refresh patient data
      const updatedResult = await getPatientById(patientId)
      if (!updatedResult.error) {
        setPatient(updatedResult.patient)
      }
    }
  }

  const handleSubmitTestRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!testForm.testType) {
      toast({
        title: "Error",
        description: "Please select a test type",
        variant: "destructive",
      })
      return
    }

    const result = await createDiagnosis({
      patientId,
      doctorId: session?.user?.id || "",
      notes: `Test request: ${testForm.notes || "No additional notes"}`,
      testRequests: [
        {
          testType: testForm.testType,
          status: "REQUESTED",
        },
      ],
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
        description: "Test requested successfully",
      })
      setIsAddTestOpen(false)
      setTestForm({
        testType: "",
        notes: "",
        urgency: "normal",
      })

      // Refresh patient data
      const updatedResult = await getPatientById(patientId)
      if (!updatedResult.error) {
        setPatient(updatedResult.patient)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-3">Loading patient data...</span>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Patient not found</h2>
          <p className="text-muted-foreground mt-2">
            The patient you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link href="/dashboard/patients">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate age
  const age = patient.dateOfBirth
    ? Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : "N/A"

  // Get recent data
  const recentAppointment = patient.appointments[0]
  const recentDiagnosis = patient.diagnoses[0]
  const recentTests = patient.testResults.slice(0, 2)
  const recentPrescription = patient.prescriptions[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/patients">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
            <p className="text-muted-foreground">
              Patient ID: {patient.id.substring(0, 8)} | Registered: {new Date(patient.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Button>
          <Dialog open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Appointment</DialogTitle>
                <DialogDescription>Schedule a new appointment for {patient.name}</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitAppointment}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appointmentDate">Date</Label>
                      <Input
                        id="appointmentDate"
                        name="date"
                        value={appointmentForm.date}
                        onChange={handleAppointmentInputChange}
                        type="date"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="appointmentTime">Time</Label>
                      <Input
                        id="appointmentTime"
                        name="time"
                        value={appointmentForm.time}
                        onChange={handleAppointmentInputChange}
                        type="time"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentDoctor">Doctor</Label>
                    <Select
                      value={appointmentForm.doctorId}
                      onValueChange={(value) => handleAppointmentSelectChange("doctorId", value)}
                    >
                      <SelectTrigger id="appointmentDoctor">
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentNotes">Notes</Label>
                    <Textarea
                      id="appointmentNotes"
                      name="notes"
                      value={appointmentForm.notes}
                      onChange={handleAppointmentInputChange}
                      placeholder="Appointment notes..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddAppointmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Schedule</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                <dd>{patient.name}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                  <dd>{patient.gender || "Not specified"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Age</dt>
                  <dd>{age} years</dd>
                </div>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
                <dd>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "Not specified"}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                <dd>{patient.phone}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd>{patient.email || "Not provided"}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                <dd>{patient.address || "Not provided"}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Blood Group</dt>
                  <dd>{patient.bloodGroup || "Not specified"}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-sm font-medium text-muted-foreground">Assigned Doctor</dt>
                  <dd>{patient.doctor?.name || "Unassigned"}</dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                <TabsTrigger value="tests">Lab Tests</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recent Appointment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentAppointment ? (
                        <div>
                          <p className="font-medium">
                            {new Date(recentAppointment.date).toLocaleDateString()} at{" "}
                            {new Date(recentAppointment.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">Doctor: {recentAppointment.doctor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Notes: {recentAppointment.notes || "No notes"}
                          </p>
                          <Badge
                            className="mt-2"
                            variant={recentAppointment.status === "COMPLETED" ? "outline" : "default"}
                          >
                            {recentAppointment.status}
                          </Badge>
                        </div>
                      ) : (
                        <p>No appointments found</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recent Diagnosis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentDiagnosis ? (
                        <div>
                          <p className="font-medium">{recentDiagnosis.notes.split(":")[0]}</p>
                          <p className="text-sm text-muted-foreground">
                            Date: {new Date(recentDiagnosis.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">Doctor: {recentDiagnosis.doctor.name}</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {recentDiagnosis.notes.split(":").slice(1).join(":")}
                          </p>
                        </div>
                      ) : (
                        <p>No diagnoses found</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recent Lab Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentTests.length > 0 ? (
                        <div className="space-y-2">
                          {recentTests.map((test) => (
                            <div key={test.id} className="border-b pb-2 last:border-0 last:pb-0">
                              <p className="font-medium">{test.testRequest.testType}</p>
                              <p className="text-sm text-muted-foreground">
                                Date: {new Date(test.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground">Result: {test.result}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No lab tests found</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recent Prescriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentPrescription ? (
                        <div className="space-y-2">
                          {recentPrescription.medications.map((med) => (
                            <div key={med.id} className="border-b pb-2 last:border-0 last:pb-0">
                              <p className="font-medium">{med.medicationName}</p>
                              <p className="text-sm text-muted-foreground">
                                Dosage: {med.dosage}, {med.frequency}
                              </p>
                              <p className="text-sm text-muted-foreground">Duration: {med.duration}</p>
                            </div>
                          ))}
                          <p className="text-sm text-muted-foreground">
                            Prescribed on: {new Date(recentPrescription.createdAt).toLocaleDateString()}
                          </p>
                          <Badge
                            className="mt-1"
                            variant={
                              recentPrescription.medications[0]?.medicationDispenses?.length > 0 ? "outline" : "default"
                            }
                          >
                            {recentPrescription.medications[0]?.medicationDispenses?.length > 0
                              ? "DISPENSED"
                              : "PENDING"}
                          </Badge>
                        </div>
                      ) : (
                        <p>No prescriptions found</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="appointments" className="mt-4">
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setIsAddAppointmentOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Appointment
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patient.appointments.length > 0 ? (
                        patient.appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>{appointment.id.substring(0, 8)}</TableCell>
                            <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {new Date(appointment.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell>{appointment.doctor.name}</TableCell>
                            <TableCell>
                              <Badge variant={appointment.status === "COMPLETED" ? "outline" : "default"}>
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{appointment.notes || "No notes"}</TableCell>
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
                            No appointments found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="diagnoses" className="mt-4">
                <div className="flex justify-end mb-4">
                  <Dialog open={isAddDiagnosisOpen} onOpenChange={setIsAddDiagnosisOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Diagnosis
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Diagnosis</DialogTitle>
                        <DialogDescription>Record a new diagnosis for {patient.name}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitDiagnosis}>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="diagnosisName">Diagnosis</Label>
                            <Input
                              id="diagnosisName"
                              name="diagnosis"
                              value={diagnosisForm.diagnosis}
                              onChange={handleDiagnosisInputChange}
                              placeholder="Enter diagnosis"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="diagnosisNotes">Notes</Label>
                            <Textarea
                              id="diagnosisNotes"
                              name="notes"
                              value={diagnosisForm.notes}
                              onChange={handleDiagnosisInputChange}
                              placeholder="Detailed notes about the diagnosis..."
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="suggestedTests">Suggested Lab Test (Optional)</Label>
                            <Select
                              value={diagnosisForm.testType}
                              onValueChange={(value) => handleDiagnosisSelectChange("testType", value)}
                            >
                              <SelectTrigger id="suggestedTests">
                                <SelectValue placeholder="Select test" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Complete Blood Count">Complete Blood Count</SelectItem>
                                <SelectItem value="Blood Pressure">Blood Pressure</SelectItem>
                                <SelectItem value="Urinalysis">Urinalysis</SelectItem>
                                <SelectItem value="X-Ray">X-Ray</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" type="button" onClick={() => setIsAddDiagnosisOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Save Diagnosis</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patient.diagnoses.length > 0 ? (
                        patient.diagnoses.map((diagnosis) => {
                          const diagnosisParts = diagnosis.notes.split(":")
                          const diagnosisName = diagnosisParts[0]
                          const diagnosisNotes = diagnosisParts.slice(1).join(":")

                          return (
                            <TableRow key={diagnosis.id}>
                              <TableCell>{diagnosis.id.substring(0, 8)}</TableCell>
                              <TableCell>{new Date(diagnosis.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>{diagnosis.doctor.name}</TableCell>
                              <TableCell>{diagnosisName}</TableCell>
                              <TableCell className="max-w-xs truncate">{diagnosisNotes}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No diagnoses found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="tests" className="mt-4">
                <div className="flex justify-end mb-4">
                  <Dialog open={isAddTestOpen} onOpenChange={setIsAddTestOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Request Test
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Lab Test</DialogTitle>
                        <DialogDescription>Request a new lab test for {patient.name}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitTestRequest}>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="testType">Test Type</Label>
                            <Select
                              value={testForm.testType}
                              onValueChange={(value) => handleTestSelectChange("testType", value)}
                              required
                            >
                              <SelectTrigger id="testType">
                                <SelectValue placeholder="Select test type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Complete Blood Count">Complete Blood Count</SelectItem>
                                <SelectItem value="Blood Pressure">Blood Pressure</SelectItem>
                                <SelectItem value="Urinalysis">Urinalysis</SelectItem>
                                <SelectItem value="X-Ray">X-Ray</SelectItem>
                                <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="testNotes">Notes</Label>
                            <Textarea
                              id="testNotes"
                              name="notes"
                              value={testForm.notes}
                              onChange={handleTestInputChange}
                              placeholder="Additional notes for the lab technician..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="testUrgency">Urgency</Label>
                            <Select
                              value={testForm.urgency}
                              onValueChange={(value) => handleTestSelectChange("urgency", value)}
                            >
                              <SelectTrigger id="testUrgency">
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="normal">Normal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" type="button" onClick={() => setIsAddTestOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Request Test</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Test</TableHead>
                        <TableHead>Requested By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patient.testResults.length > 0 ? (
                        patient.testResults.map((test) => (
                          <TableRow key={test.id}>
                            <TableCell>{test.id.substring(0, 8)}</TableCell>
                            <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{test.testRequest.testType}</TableCell>
                            <TableCell>{test.testRequest.diagnosis.doctor.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">COMPLETED</Badge>
                            </TableCell>
                            <TableCell>{test.result}</TableCell>
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
                            No lab tests found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="prescriptions" className="mt-4">
                <div className="flex justify-end mb-4">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Prescription
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Medications</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patient.prescriptions.length > 0 ? (
                        patient.prescriptions.map((prescription) => (
                          <TableRow key={prescription.id}>
                            <TableCell>{prescription.id.substring(0, 8)}</TableCell>
                            <TableCell>{new Date(prescription.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{prescription.diagnosis.doctor.name}</TableCell>
                            <TableCell>
                              {prescription.medications.map((med, index) => (
                                <div key={index} className="text-sm">
                                  {med.medicationName} ({med.dosage})
                                  {index < prescription.medications.length - 1 ? ", " : ""}
                                </div>
                              ))}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  prescription.medications[0]?.medicationDispenses?.length > 0 ? "outline" : "default"
                                }
                              >
                                {prescription.medications[0]?.medicationDispenses?.length > 0 ? "DISPENSED" : "PENDING"}
                              </Badge>
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
                          <TableCell colSpan={6} className="text-center py-4">
                            No prescriptions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Receipt #</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patient.payments.length > 0 ? (
                        patient.payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.id.substring(0, 8)}</TableCell>
                            <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                            <TableCell>{payment.paymentMethod}</TableCell>
                            <TableCell>
                              <Badge variant={payment.status === "COMPLETED" ? "outline" : "default"}>
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{payment.receiptNumber || "N/A"}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Receipt
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No payments found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
