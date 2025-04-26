"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, UserPlus, Trash2, Edit } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getPatients, createPatient, updatePatient, deletePatient } from "@/lib/actions/patient-actions"
import { getDoctors } from "@/lib/actions/user-actions"
import { useSession } from "next-auth/react"

export default function PatientsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [patients, setPatients] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    doctorId: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch doctors
      const doctorsResult = await getDoctors()
      if (!doctorsResult.error) {
        setDoctors(doctorsResult.doctors)
      }

      // Fetch patients
      const patientsResult = await getPatients(searchTerm)
      if (patientsResult.error) {
        toast({
          title: "Error",
          description: patientsResult.error,
          variant: "destructive",
        })
      } else {
        setPatients(patientsResult.patients)
      }

      setLoading(false)
    }

    fetchData()
  }, [searchTerm, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await createPatient({
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone,
      address: formData.address || undefined,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      gender: formData.gender || undefined,
      bloodGroup: formData.bloodGroup || undefined,
      doctorId: formData.doctorId || undefined,
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
        description: "Patient registered successfully",
      })
      setIsAddPatientOpen(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
        doctorId: "",
      })

      // Refresh patient list
      const updatedResult = await getPatients(searchTerm)
      if (!updatedResult.error) {
        setPatients(updatedResult.patients)
      }
    }
  }

  const handleEditPatient = (patient: any) => {
    setSelectedPatient(patient)
    setFormData({
      name: patient.name,
      email: patient.email || "",
      phone: patient.phone,
      address: patient.address || "",
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : "",
      gender: patient.gender || "",
      bloodGroup: patient.bloodGroup || "",
      doctorId: patient.doctorId || "",
    })
    setIsEditPatientOpen(true)
  }

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient) return

    const result = await updatePatient(selectedPatient.id, {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone,
      address: formData.address || undefined,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      gender: formData.gender || undefined,
      bloodGroup: formData.bloodGroup || undefined,
      doctorId: formData.doctorId || undefined,
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
        description: "Patient updated successfully",
      })
      setIsEditPatientOpen(false)
      setSelectedPatient(null)
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
        doctorId: "",
      })

      // Refresh patient list
      const updatedResult = await getPatients(searchTerm)
      if (!updatedResult.error) {
        setPatients(updatedResult.patients)
      }
    }
  }

  const handleDeleteClick = (patient: any) => {
    setSelectedPatient(patient)
    setIsDeleteDialogOpen(true)
  }

  const handleDeletePatient = async () => {
    if (!selectedPatient) return

    const result = await deletePatient(selectedPatient.id)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Patient deleted successfully",
      })
      setIsDeleteDialogOpen(false)
      setSelectedPatient(null)

      // Refresh patient list
      const updatedResult = await getPatients(searchTerm)
      if (!updatedResult.error) {
        setPatients(updatedResult.patients)
      }
    }
  }

  // Filter patients based on active tab
  const filteredPatients = patients.filter((patient) => {
    if (activeTab === "all") return true
    if (activeTab === "recent") {
      const lastVisit = patient.appointments[0]?.date
      if (!lastVisit) return false
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return new Date(lastVisit) > oneWeekAgo
    }
    return true
  })

  const renderPatientForm = (isEdit = false, onSubmit: (e: React.FormEvent) => Promise<void>) => (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+256 7XX XXX XXX"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              type="date"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            type="email"
            placeholder="john.doe@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="123 Main St, Kampala"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Select value={formData.bloodGroup} onValueChange={(value) => handleSelectChange("bloodGroup", value)}>
              <SelectTrigger id="bloodGroup">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignDoctor">Assign Doctor</Label>
            <Select value={formData.doctorId} onValueChange={(value) => handleSelectChange("doctorId", value)}>
              <SelectTrigger id="assignDoctor">
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
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          type="button"
          onClick={() => (isEdit ? setIsEditPatientOpen(false) : setIsAddPatientOpen(false))}
        >
          Cancel
        </Button>
        <Button type="submit">{isEdit ? "Update Patient" : "Register Patient"}</Button>
      </DialogFooter>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage patient records and information</p>
        </div>
        <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>Enter the patient's information to register them in the system.</DialogDescription>
            </DialogHeader>
            {renderPatientForm(false, handleSubmit)}
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
                placeholder="Search patients..."
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
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="recent">Recent Visit</SelectItem>
                  <SelectItem value="oldest">Oldest Visit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all">All Patients</TabsTrigger>
                <TabsTrigger value="recent">Recent Visits</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled Today</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Assigned Doctor</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => {
                        // Calculate age
                        const age = patient.dateOfBirth
                          ? Math.floor(
                              (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
                                (365.25 * 24 * 60 * 60 * 1000),
                            )
                          : "N/A"

                        // Format last visit date
                        const lastVisit = patient.appointments[0]?.date
                          ? new Date(patient.appointments[0].date).toLocaleDateString()
                          : "No visits"

                        return (
                          <TableRow key={patient.id}>
                            <TableCell>{patient.id.substring(0, 8)}</TableCell>
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>{patient.gender || "N/A"}</TableCell>
                            <TableCell>{age}</TableCell>
                            <TableCell>{patient.phone}</TableCell>
                            <TableCell>{patient.doctor?.name || "Unassigned"}</TableCell>
                            <TableCell>{lastVisit}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Link href={`/dashboard/patients/${patient.id}`}>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={() => handleEditPatient(patient)}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteClick(patient)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No patients found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="recent" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Assigned Doctor</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          <div className="flex justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => {
                        // Calculate age
                        const age = patient.dateOfBirth
                          ? Math.floor(
                              (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
                                (365.25 * 24 * 60 * 60 * 1000),
                            )
                          : "N/A"

                        // Format last visit date
                        const lastVisit = patient.appointments[0]?.date
                          ? new Date(patient.appointments[0].date).toLocaleDateString()
                          : "No visits"

                        return (
                          <TableRow key={patient.id}>
                            <TableCell>{patient.id.substring(0, 8)}</TableCell>
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>{patient.gender || "N/A"}</TableCell>
                            <TableCell>{age}</TableCell>
                            <TableCell>{patient.phone}</TableCell>
                            <TableCell>{patient.doctor?.name || "Unassigned"}</TableCell>
                            <TableCell>{lastVisit}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Link href={`/dashboard/patients/${patient.id}`}>
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </Link>
                                <Button variant="ghost" size="sm" onClick={() => handleEditPatient(patient)}>
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteClick(patient)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No recent patients found
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
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Assigned Doctor</TableHead>
                      <TableHead>Appointment Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No appointments scheduled for today
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex items-center justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredPatients.length} of {patients.length} patients
          </div>
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

      {/* Edit Patient Dialog */}
      <Dialog open={isEditPatientOpen} onOpenChange={setIsEditPatientOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update the patient's information.</DialogDescription>
          </DialogHeader>
          {renderPatientForm(true, handleUpdatePatient)}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the patient record and all associated data from
              the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
