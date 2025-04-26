"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getTestRequestById } from "@/lib/actions/test-actions"
import { TestReportTemplate } from "@/components/print/test-report-template"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PrintTestReportPage() {
  const params = useParams()
  const testId = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    const fetchTestData = async () => {
      setLoading(true)
      try {
        const result = await getTestRequestById(testId)

        if (result.error) {
          setError(result.error)
          return
        }

        if (!result.testRequest.testResult) {
          setError("No test result found for this test")
          return
        }

        setReportData({
          testId: result.testRequest.id,
          testType: result.testRequest.testType,
          patientName: result.testRequest.diagnosis.patient.name,
          patientId: result.testRequest.diagnosis.patient.id,
          doctorName: result.testRequest.diagnosis.doctor.name,
          technicianName: result.testRequest.testResult.technician.name,
          requestDate: result.testRequest.createdAt,
          resultDate: result.testRequest.testResult.createdAt,
          result: result.testRequest.testResult.result,
          notes: result.testRequest.diagnosis.notes,
          hospitalInfo: {
            name: "SSM Laboratory & Medical Center",
            address: "123 Health Street, Kampala, Uganda",
            phone: "+256 700 123456",
            email: "info@ssmlab.com",
          },
        })
      } catch (err) {
        setError("Failed to load test data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (testId) {
      fetchTestData()
    }
  }, [testId])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <Skeleton className="mx-auto h-8 w-64" />
                <Skeleton className="mx-auto mt-2 h-4 w-48" />
                <Skeleton className="mx-auto mt-2 h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-red-500">Error</h2>
            <p className="mt-2">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">Test Report</h1>
      {reportData && <TestReportTemplate reportData={reportData} />}
    </div>
  )
}
