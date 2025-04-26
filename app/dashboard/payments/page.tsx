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
import { Search, Filter, CreditCard } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { getPayments, createPayment, getPaymentStats } from "@/lib/actions/payment-actions"
import { getPatients } from "@/lib/actions/patient-actions"

export default function PaymentsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [payments, setPayments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  const [paymentForm, setPaymentForm] = useState({
    patientId: "",
    amount: "",
    paymentMethod: "CASH",
    description: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch payment stats
      const statsResult = await getPaymentStats()
      if (!statsResult.error) {
        setStats(statsResult)
      }

      // Fetch patients for the payment form
      const patientsResult = await getPatients()
      if (!patientsResult.error) {
        setPatients(patientsResult.patients)
      }

      // Fetch payments
      const status =
        activeTab === "all"
          ? undefined
          : activeTab === "completed"
            ? "COMPLETED"
            : activeTab === "pending"
              ? "PENDING"
              : activeTab === "refunded"
                ? "REFUNDED"
                : undefined

      const result = await getPayments(searchTerm, status)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setPayments(result.payments)
      }
      setLoading(false)
    }

    fetchData()
  }, [activeTab, searchTerm, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPaymentForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!paymentForm.patientId || !paymentForm.amount || !paymentForm.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const result = await createPayment({
      patientId: paymentForm.patientId,
      cashierId: session?.user?.id || "",
      amount: Number.parseFloat(paymentForm.amount),
      paymentMethod: paymentForm.paymentMethod,
      description: paymentForm.description,
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
        description: "Payment recorded successfully",
      })
      setIsAddPaymentOpen(false)
      setPaymentForm({
        patientId: "",
        amount: "",
        paymentMethod: "CASH",
        description: "",
      })

      // Refresh payments
      const status =
        activeTab === "all"
          ? undefined
          : activeTab === "completed"
            ? "COMPLETED"
            : activeTab === "pending"
              ? "PENDING"
              : activeTab === "refunded"
                ? "REFUNDED"
                : undefined

      const updatedResult = await getPayments(searchTerm, status)
      if (!updatedResult.error) {
        setPayments(updatedResult.payments)
      }

      // Refresh stats
      const statsResult = await getPaymentStats()
      if (!statsResult.error) {
        setStats(statsResult)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage patient payments and transactions</p>
        </div>
        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
          <DialogTrigger asChild>
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
              <DialogDescription>Record a new payment from a patient</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitPayment}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient</Label>
                  <Select
                    value={paymentForm.patientId}
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
                  <Label htmlFor="amount">Amount (UGX)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={paymentForm.amount}
                    onChange={handleInputChange}
                    placeholder="50000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={paymentForm.paymentMethod}
                    onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                    required
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="INSURANCE">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={paymentForm.description}
                    onChange={handleInputChange}
                    placeholder="Payment for consultation and lab tests..."
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddPaymentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Payment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-3xl font-bold">UGX {stats.todayRevenue.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-green-100 p-2 text-green-700 dark:bg-green-900 dark:text-green-300">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-3xl font-bold">UGX {stats.weekRevenue.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-2 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold">UGX {stats.monthRevenue.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-2 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">UGX {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-yellow-100 p-2 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search payments or patients..."
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
                  <SelectItem value="amount-desc">Amount (Highest)</SelectItem>
                  <SelectItem value="amount-asc">Amount (Lowest)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all">All Payments</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="refunded">Refunded</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
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
                    ) : payments.length > 0 ? (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.receiptNumber}</TableCell>
                          <TableCell className="font-medium">{payment.patient.name}</TableCell>
                          <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === "COMPLETED"
                                  ? "outline"
                                  : payment.status === "REFUNDED"
                                    ? "destructive"
                                    : "default"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No payments found
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
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
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
                    ) : payments.length > 0 ? (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.receiptNumber}</TableCell>
                          <TableCell className="font-medium">{payment.patient.name}</TableCell>
                          <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">COMPLETED</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No completed payments found
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
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
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
                    ) : payments.length > 0 ? (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.receiptNumber}</TableCell>
                          <TableCell className="font-medium">{payment.patient.name}</TableCell>
                          <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                          <TableCell>
                            <Badge variant="default">PENDING</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                Complete
                              </Button>
                              <Button variant="ghost" size="sm">
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No pending payments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="refunded" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
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
                    ) : payments.length > 0 ? (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.receiptNumber}</TableCell>
                          <TableCell className="font-medium">{payment.patient.name}</TableCell>
                          <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>UGX {payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">REFUNDED</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No refunded payments found
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
          <div className="text-sm text-muted-foreground">Showing {payments.length} payments</div>
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
