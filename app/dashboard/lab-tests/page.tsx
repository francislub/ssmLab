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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { getTestRequests, updateTestRequest, recordTestResult, getTestStats } from "@/lib/actions/test-actions"

export default function LabTestsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isRecordResultOpen, setIsRecordResultOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<any>(null)
  const [testRequests, setTestRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({
    pendingTests: 0,
    completedToday: 0,
    weeklyTestCount: 0,
    urgentTests: 0,
  })

  const [resultForm, setResultForm] = useState({
    status: "",
    result: "",
    notes: "",
    reportUrl: "",
  })

  useEffect(() => {
    const fetchTestRequests = async () => {
      setLoading(true)

      // Fetch test stats
      const statsResult = await getTestStats()
      if (!statsResult.error) {
        setStats(statsResult)
      }

      // Fetch test requests
      const status =
        activeTab === "all"
          ? undefined
          : activeTab === "requested"
            ? "REQUESTED"
            : activeTab === "in-progress"
              ? "IN_PROGRESS"
              : activeTab === "completed"
                ? "COMPLETED"
                : undefined

      const result = await getTestRequests(searchTerm, status)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setTestRequests(result.testRequests)
      }
      setLoading(false)
    }

    fetchTestRequests()
  }, [searchTerm, activeTab, toast])

  const handleRecordResult = (test: any) => {
    setSelectedTest(test)
    setResultForm({
      status: test.status === "REQUESTED" ? "IN_PROGRESS" : test.status,
      result: "",
      notes: "",
      reportUrl: "",
    })
    setIsRecordResultOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setResultForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setResultForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault()

    if (resultForm.status === "COMPLETED" && !resultForm.result) {
      toast({
        title: "Error",
        description: "Please enter test results",
        variant: "destructive",
      })
      return
    }

    // If just updating status (not completing)
    if (resultForm.status !== "COMPLETED") {
      const result = await updateTestRequest(selectedTest.id, {
        status: resultForm.status as any,
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
          description: "Test status updated successfully",
        })
        setIsRecordResultOpen(false)

        // Refresh test requests
        const updatedResult = await getTestRequests(searchTerm, activeTab === "all" ? undefined : activeTab)
        if (!updatedResult.error) {
          setTestRequests(updatedResult.testRequests)
        }
      }
    } else {
      // Recording final result
      const result = await recordTestResult({
        testRequestId: selectedTest.id,
        patientId: selectedTest.diagnosis.patient.id,
        technicianId: session?.user?.id || "",
        result: resultForm.result,
        reportUrl: resultForm.reportUrl || undefined,
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
          description: "Test result recorded successfully",
        })
        setIsRecordResultOpen(false)

        // Refresh test requests
        const updatedResult = await getTestRequests(searchTerm, activeTab === "all" ? undefined : activeTab)
        if (!updatedResult.error) {
          setTestRequests(updatedResult.testRequests)
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Tests</h1>
          <p className="text-muted-foreground">Manage and record laboratory test results</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tests</p>
                <p className="text-3xl font-bold">{stats.pendingTests}</p>
              </div>
              <div className="rounded-full p-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <Search className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-3xl font-bold">{stats.completedToday}</p>
              </div>
              <div className="rounded-full p-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <Filter className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests (Week)</p>
                <p className="text-3xl font-bold">{stats.weeklyTestCount}</p>
              </div>
              <div className="rounded-full p-2 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                <Upload className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent Tests</p>
                <p className="text-3xl font-bold">{stats.urgentTests}</p>
              </div>
              <div className="rounded-full p-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                <Search className="h-6 w-6" />
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
                placeholder="Search tests or patients..."
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
                  <SelectItem value="test">Test Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-4">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all">All Tests</TabsTrigger>
                <TabsTrigger value="requested">Requested</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test Type</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
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
                    ) : testRequests.length > 0 ? (
                      testRequests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>{test.id.substring(0, 8)}</TableCell>
                          <TableCell className="font-medium">{test.diagnosis.patient.name}</TableCell>
                          <TableCell>{test.testType}</TableCell>
                          <TableCell>{test.diagnosis.doctor.name}</TableCell>
                          <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                test.status === "COMPLETED"
                                  ? "outline"
                                  : test.status === "IN_PROGRESS"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {test.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{test.testResult?.result || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {test.status !== "COMPLETED" ? (
                                <Button variant="ghost" size="sm" onClick={() => handleRecordResult(test)}>
                                  Record Result
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm">
                                  View Report
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          No tests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="requested" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test Type</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Request Date</TableHead>
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
                    ) : testRequests.length > 0 ? (
                      testRequests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>{test.id.substring(0, 8)}</TableCell>
                          <TableCell className="font-medium">{test.diagnosis.patient.name}</TableCell>
                          <TableCell>{test.testType}</TableCell>
                          <TableCell>{test.diagnosis.doctor.name}</TableCell>
                          <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="default">{test.status.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleRecordResult(test)}>
                              Start Test
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No requested tests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="in-progress" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test Type</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Request Date</TableHead>
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
                    ) : testRequests.length > 0 ? (
                      testRequests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>{test.id.substring(0, 8)}</TableCell>
                          <TableCell className="font-medium">{test.diagnosis.patient.name}</TableCell>
                          <TableCell>{test.testType}</TableCell>
                          <TableCell>{test.diagnosis.doctor.name}</TableCell>
                          <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{test.status.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleRecordResult(test)}>
                              Record Result
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          No in-progress tests found
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
                      <TableHead>Test ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test Type</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Technician</TableHead>
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
                    ) : testRequests.length > 0 ? (
                      testRequests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>{test.id.substring(0, 8)}</TableCell>
                          <TableCell className="font-medium">{test.diagnosis.patient.name}</TableCell>
                          <TableCell>{test.testType}</TableCell>
                          <TableCell>{test.diagnosis.doctor.name}</TableCell>
                          <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{test.testResult?.result}</TableCell>
                          <TableCell>{test.testResult?.technician.name}</TableCell>
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
                          No completed tests found
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
          <div className="text-sm text-muted-foreground">Showing {testRequests.length} tests</div>
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

      <Dialog open={isRecordResultOpen} onOpenChange={setIsRecordResultOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record Test Result</DialogTitle>
            <DialogDescription>
              Enter the results for {selectedTest?.testType} for patient {selectedTest?.diagnosis?.patient?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitResult}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Test ID</Label>
                  <Input value={selectedTest?.id?.substring(0, 8)} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Test Type</Label>
                  <Input value={selectedTest?.testType} readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testStatus">Status</Label>
                <Select value={resultForm.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger id="testStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {resultForm.status === "COMPLETED" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="testResult">Result</Label>
                    <Textarea
                      id="testResult"
                      name="result"
                      value={resultForm.result}
                      onChange={handleInputChange}
                      placeholder="Enter test results..."
                      required={resultForm.status === "COMPLETED"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testNotes">Additional Notes</Label>
                    <Textarea
                      id="testNotes"
                      name="notes"
                      value={resultForm.notes}
                      onChange={handleInputChange}
                      placeholder="Any additional notes..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Report (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        name="reportUrl"
                        value={resultForm.reportUrl}
                        onChange={handleInputChange}
                        placeholder="Enter report URL or file path"
                      />
                      <Button variant="outline" size="icon" type="button">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsRecordResultOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{resultForm.status === "COMPLETED" ? "Save Result" : "Update Status"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
