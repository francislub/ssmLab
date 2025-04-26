"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { getPrescriptions, dispenseMedication, getPharmacyStats } from "@/lib/actions/prescription-actions"
import { getMedicationInventory, createMedication } from "@/lib/actions/inventory-actions"

export default function PharmacyPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("prescriptions")
  const [activeInventoryTab, setActiveInventoryTab] = useState("all")
  const [isDispenseOpen, setIsDispenseOpen] = useState(false)
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    pendingPrescriptions: 0,
    dispensedToday: 0,
    patientsToday: 0,
    lowStockItems: 0,
    totalMedications: 0,
  })

  const [dispenseForm, setDispenseForm] = useState({
    medicationId: "",
    quantity: 1,
  })

  const [medicationForm, setMedicationForm] = useState({
    name: "",
    quantity: 0,
    unit: "",
    price: 0,
    expiryDate: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch pharmacy stats
      const statsResult = await getPharmacyStats()
      if (!statsResult.error) {
        setStats(statsResult)
      }

      if (activeTab === "prescriptions") {
        // Fetch prescriptions
        const status =
          activeInventoryTab === "all" ? undefined : activeInventoryTab === "pending" ? "PENDING" : "DISPENSED"
        const result = await getPrescriptions(undefined, status)
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          setPrescriptions(result.prescriptions)
        }
      } else {
        // Fetch inventory
        const lowStock = activeInventoryTab === "low-stock"
        const result = await getMedicationInventory(searchTerm, lowStock)
        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          setInventory(result.inventory)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [activeTab, activeInventoryTab, searchTerm, toast])

  const handleDispense = (prescription: any) => {
    setSelectedPrescription(prescription)
    if (prescription.medications && prescription.medications.length > 0) {
      setDispenseForm({
        medicationId: prescription.medications[0].id,
        quantity: 1,
      })
    }
    setIsDispenseOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "quantity") {
      setDispenseForm((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
    } else {
      setDispenseForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleMedicationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "quantity" || name === "price") {
      setMedicationForm((prev) => ({ ...prev, [name]: Number.parseFloat(value) || 0 }))
    } else {
      setMedicationForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setDispenseForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitDispense = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!dispenseForm.medicationId || dispenseForm.quantity <= 0) {
      toast({
        title: "Error",
        description: "Please select a medication and enter a valid quantity",
        variant: "destructive",
      })
      return
    }

    const result = await dispenseMedication({
      patientId: selectedPrescription.patient.id,
      pharmacistId: session?.user?.id || "",
      medicationId: dispenseForm.medicationId,
      quantity: dispenseForm.quantity,
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
        description: "Medication dispensed successfully",
      })
      setIsDispenseOpen(false)

      // Refresh data
      const prescriptionResult = await getPrescriptions(
        undefined,
        activeInventoryTab === "all" ? undefined : activeInventoryTab === "pending" ? "PENDING" : "DISPENSED",
      )
      if (!prescriptionResult.error) {
        setPrescriptions(prescriptionResult.prescriptions)
      }

      const statsResult = await getPharmacyStats()
      if (!statsResult.error) {
        setStats(statsResult)
      }
    }
  }

  const handleSubmitMedication = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!medicationForm.name || medicationForm.quantity <= 0 || !medicationForm.unit || medicationForm.price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const result = await createMedication({
      name: medicationForm.name,
      quantity: medicationForm.quantity,
      unit: medicationForm.unit,
      price: medicationForm.price,
      expiryDate: medicationForm.expiryDate ? new Date(medicationForm.expiryDate) : undefined,
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
        description: "Medication added successfully",
      })
      setIsAddMedicationOpen(false)
      setMedicationForm({
        name: "",
        quantity: 0,
        unit: "",
        price: 0,
        expiryDate: "",
      })

      // Refresh inventory
      const inventoryResult = await getMedicationInventory(searchTerm, activeInventoryTab === "low-stock")
      if (!inventoryResult.error) {
        setInventory(inventoryResult.inventory)
      }

      const pharmacyStatsResult = await getPharmacyStats()
      if (!pharmacyStatsResult.error) {
        setStats(pharmacyStatsResult)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pharmacy</h1>
          <p className="text-muted-foreground">Manage prescriptions and medication inventory</p>
        </div>
        <Button onClick={() => setIsAddMedicationOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Prescriptions</CardTitle>
            <CardDescription>Prescriptions waiting to be dispensed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingPrescriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Low Stock Items</CardTitle>
            <CardDescription>Medications with low inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items with less than 20 units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Dispensed Today</CardTitle>
            <CardDescription>Medications dispensed today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.dispensedToday}</div>
            <p className="text-xs text-muted-foreground">For {stats.patientsToday} patients</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prescriptions" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search prescriptions or patients..."
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
              <Tabs defaultValue="all" className="w-full">
                <div className="px-4">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="dispensed">Dispensed</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="m-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prescription ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Medications</TableHead>
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
                        ) : prescriptions.length > 0 ? (
                          prescriptions.map((prescription) => (
                            <TableRow key={prescription.id}>
                              <TableCell>{prescription.id.substring(0, 8)}</TableCell>
                              <TableCell className="font-medium">{prescription.patient.name}</TableCell>
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
                                  {prescription.medications[0]?.medicationDispenses?.length > 0
                                    ? "DISPENSED"
                                    : "PENDING"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {prescription.medications[0]?.medicationDispenses?.length === 0 ? (
                                  <Button variant="ghost" size="sm" onClick={() => handleDispense(prescription)}>
                                    Dispense
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No prescriptions found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="pending" className="m-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prescription ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Medications</TableHead>
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
                        ) : prescriptions.length > 0 ? (
                          prescriptions.map((prescription) => (
                            <TableRow key={prescription.id}>
                              <TableCell>{prescription.id.substring(0, 8)}</TableCell>
                              <TableCell className="font-medium">{prescription.patient.name}</TableCell>
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
                                <Badge variant="default">PENDING</Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleDispense(prescription)}>
                                  Dispense
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No pending prescriptions found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="dispensed" className="m-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prescription ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Doctor</TableHead>
                          <TableHead>Medications</TableHead>
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
                        ) : prescriptions.length > 0 ? (
                          prescriptions.map((prescription) => (
                            <TableRow key={prescription.id}>
                              <TableCell>{prescription.id.substring(0, 8)}</TableCell>
                              <TableCell className="font-medium">{prescription.patient.name}</TableCell>
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
                                <Badge variant="outline">DISPENSED</Badge>
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
                              No dispensed prescriptions found
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
              <div className="text-sm text-muted-foreground">Showing {prescriptions.length} prescriptions</div>
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
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search medications..."
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
                  <Select defaultValue="name">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="quantity-asc">Quantity (Low to High)</SelectItem>
                      <SelectItem value="quantity-desc">Quantity (High to Low)</SelectItem>
                      <SelectItem value="expiry">Expiry Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" value={activeInventoryTab} onValueChange={setActiveInventoryTab}>
                <div className="px-4">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="all">All Items</TabsTrigger>
                    <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="m-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Expiry Date</TableHead>
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
                        ) : inventory.length > 0 ? (
                          inventory.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id.substring(0, 8)}</TableCell>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>
                                {item.quantity}
                                {item.quantity < 20 && (
                                  <Badge variant="destructive" className="ml-2">
                                    Low
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell>UGX {item.price.toLocaleString()}</TableCell>
                              <TableCell>
                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No medications found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="low-stock" className="m-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Expiry Date</TableHead>
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
                        ) : inventory.length > 0 ? (
                          inventory.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.id.substring(0, 8)}</TableCell>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>
                                {item.quantity}
                                <Badge variant="destructive" className="ml-2">
                                  Low
                                </Badge>
                              </TableCell>
                              <TableCell>{item.unit}</TableCell>
                              <TableCell>UGX {item.price.toLocaleString()}</TableCell>
                              <TableCell>
                                {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  Restock
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No low stock medications found
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
              <div className="text-sm text-muted-foreground">Showing {inventory.length} medications</div>
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
        </TabsContent>
      </Tabs>

      <Dialog open={isDispenseOpen} onOpenChange={setIsDispenseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Dispense Medication</DialogTitle>
            <DialogDescription>Dispense medication for {selectedPrescription?.patient?.name}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitDispense}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Patient</Label>
                <Input value={selectedPrescription?.patient?.name} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicationId">Medication</Label>
                <Select
                  value={dispenseForm.medicationId}
                  onValueChange={(value) => handleSelectChange("medicationId", value)}
                >
                  <SelectTrigger id="medicationId">
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPrescription?.medications?.map((med) => (
                      <SelectItem key={med.id} value={med.id}>
                        {med.medicationName} ({med.dosage})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={dispenseForm.quantity}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDispenseOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Dispense Medication</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMedicationOpen} onOpenChange={setIsAddMedicationOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Medication</DialogTitle>
            <DialogDescription>Add a new medication to the inventory</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitMedication}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={medicationForm.name}
                  onChange={handleMedicationInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={medicationForm.quantity}
                    onChange={handleMedicationInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    name="unit"
                    value={medicationForm.unit}
                    onChange={handleMedicationInputChange}
                    placeholder="e.g., tablets, capsules"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (UGX)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={medicationForm.price}
                    onChange={handleMedicationInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    type="date"
                    value={medicationForm.expiryDate}
                    onChange={handleMedicationInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsAddMedicationOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Medication</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
