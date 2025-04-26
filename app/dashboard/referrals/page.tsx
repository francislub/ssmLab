"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
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
import { Search, Filter, UserPlus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function ReferralsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddReferralOpen, setIsAddReferralOpen] = useState(false)
  const [referrals, setReferrals] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [specialists, setSpecialists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [referralForm, setReferralForm] = useState({
    patientId: "",
    specialistId: "",
    reason: "",
    notes: "",
  })

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      setLoading(true)

      // Mock data for demonstration
      setTimeout(() => {
        setReferrals([
          {
            id: "ref-001",
            patient: { id: "pat-001", name: "John Doe" },
            referringDoctor: { id: "doc-001", name: "Dr. Sarah Johnson" },
            specialist: { id: "doc-002", name: "Dr. Michael Chen" },
            reason: "Cardiology consultation",
            status: "PENDING",
            createdAt: new Date(2023, 5, 15),
          },
          {
            id: "ref-002",
            patient: { id: "pat-002", name: "Jane Smith" },
            referringDoctor: { id: "doc-001", name: "Dr. Sarah Johnson" },
            specialist: { id: "doc-003", name: "Dr. James Wilson" },
            reason: "Dermatology follow-up",
            status: "ACCEPTED",
            createdAt: new Date(2023, 5, 10),
          },
          {
            id: "ref-003",
            patient: { id: "pat-003", name: "Robert Brown" },
            referringDoctor: { id: "doc-004", name: "Dr. Emily Davis" },
            specialist: { id: "doc-002", name: "Dr. Michael Chen" },
            reason: "Cardiology assessment",
            status: "COMPLETED",
            createdAt: new Date(2023, 5, 5),
          },
        ])

        setPatients([
          { id: "pat-001", name: "John Doe" },
          { id: "pat-002", name: "Jane Smith" },
          { id: "pat-003", name: "Robert Brown" },
          { id: "pat-004", name: "Mary Johnson" },
        ])

        setSpecialists([
          { id: "doc-002", name: "Dr. Michael Chen", specialty: "Cardiology" },
          { id: "doc-003", name: "Dr. James Wilson", specialty: "Dermatology" },
          { id: "doc-005", name: "Dr. Lisa Taylor", specialty: "Neurology" },
          { id: "doc-006", name: "Dr. David Kim", specialty: "Orthopedics" },
        ])

        setLoading(false)
      }, 1000)
    }

    fetchData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setReferralForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setReferralForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!referralForm.patientId || !referralForm.specialistId || !referralForm.reason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Simulate API call
    toast({
      title: "Success",
      description: "Referral created successfully",
    })
    setIsAddReferralOpen(false)
    setReferralForm({
      patientId: "",
      specialistId: "",
      reason: "",
      notes: "",
    })

    // Refresh referrals (simulated)
    setReferrals((prev) => [
      {
        id: `ref-00${prev.length + 1}`,
        patient: patients.find((p) => p.id === referralForm.patientId),
        referringDoctor: { id: session?.user?.id || "doc-001", name: session?.user?.name || "Dr. User" },
        specialist: specialists.find((s) => s.id === referralForm.specialistId),
        reason: referralForm.reason,
        notes: referralForm.notes,
        status: "PENDING",
        createdAt: new Date(),
      },
      ...prev,
    ])
  }

  const filteredReferrals = referrals.filter((referral) => {
    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      referral.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.specialist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.reason.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by tab
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && referral.status === "PENDING") ||
      (activeTab === "accepted" && referral.status === "ACCEPTED") ||
      (activeTab === "completed" && referral.status === "COMPLETED")

    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground">Manage patient referrals to specialists</p>
        </div>
        <Dialog open={isAddReferralOpen} onOpenChange={setIsAddReferralOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              New Referral
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Referral</DialogTitle>
              <DialogDescription>Refer a patient to a specialist</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitReferral}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient</Label>
                  <Select
                    value={referralForm.patientId}
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
                  <Label htmlFor="specialistId">Specialist</Label>
                  <Select
                    value={referralForm.specialistId}
                    onValueChange={(value) => handleSelectChange("specialistId", value)}
                    required
                  >
                    <SelectTrigger id="specialistId">
                      <SelectValue placeholder="Select specialist" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialists.map((specialist) => (
                        <SelectItem key={specialist.id} value={specialist.id}>
                          {specialist.name} ({specialist.specialty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Referral</Label>
                  <Input
                    id="reason"
                    name="reason"
                    value={referralForm.reason}
                    onChange={handleInputChange}
                    placeholder="Brief reason for referral"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={referralForm.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional information for the specialist..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddReferralOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Referral</Button>
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
                placeholder="Search referrals..."
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
                  <SelectItem value="specialist">Specialist Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all">All Referrals</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="accepted">Accepted</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Referring Doctor</TableHead>
                      <TableHead>Specialist</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={8} className="p-2">
                              <Skeleton className="h-12 w-full" />
                            </TableCell>
                          </TableRow>
                        ))
                    ) : filteredReferrals.length > 0 ? (
                      filteredReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell>{referral.id}</TableCell>
                          <TableCell className="font-medium">{referral.patient.name}</TableCell>
                          <TableCell>{referral.referringDoctor.name}</TableCell>
                          <TableCell>{referral.specialist.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{referral.reason}</TableCell>
                          <TableCell>{new Date(referral.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                referral.status === "COMPLETED"
                                  ? "outline"
                                  : referral.status === "ACCEPTED"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {referral.status}
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
                        <TableCell colSpan={8} className="text-center py-4">
                          No referrals found
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
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Referring Doctor</TableHead>
                      <TableHead>Specialist</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
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
                    ) : filteredReferrals.length > 0 ? (
                      filteredReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell>{referral.id}</TableCell>
                          <TableCell className="font-medium">{referral.patient.name}</TableCell>
                          <TableCell>{referral.referringDoctor.name}</TableCell>
                          <TableCell>{referral.specialist.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{referral.reason}</TableCell>
                          <TableCell>{new Date(referral.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="default">PENDING</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                Accept
                              </Button>
                              <Button variant="ghost" size="sm">
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No pending referrals found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="accepted" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Referring Doctor</TableHead>
                      <TableHead>Specialist</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
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
                    ) : filteredReferrals.length > 0 ? (
                      filteredReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell>{referral.id}</TableCell>
                          <TableCell className="font-medium">{referral.patient.name}</TableCell>
                          <TableCell>{referral.referringDoctor.name}</TableCell>
                          <TableCell>{referral.specialist.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{referral.reason}</TableCell>
                          <TableCell>{new Date(referral.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">ACCEPTED</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                Complete
                              </Button>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No accepted referrals found
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
                      <TableHead>Referring Doctor</TableHead>
                      <TableHead>Specialist</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
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
                    ) : filteredReferrals.length > 0 ? (
                      filteredReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell>{referral.id}</TableCell>
                          <TableCell className="font-medium">{referral.patient.name}</TableCell>
                          <TableCell>{referral.referringDoctor.name}</TableCell>
                          <TableCell>{referral.specialist.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{referral.reason}</TableCell>
                          <TableCell>{new Date(referral.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">COMPLETED</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              View Report
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No completed referrals found
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
          <div className="text-sm text-muted-foreground">Showing {filteredReferrals.length} referrals</div>
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
