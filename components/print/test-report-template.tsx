"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer } from "lucide-react"
import { useReactToPrint } from "react-to-print"

interface TestReportTemplateProps {
  reportData: {
    testId: string
    testType: string
    patientName: string
    patientId: string
    doctorName: string
    technicianName: string
    requestDate: Date
    resultDate: Date
    result: string
    notes?: string
    hospitalInfo: {
      name: string
      address: string
      phone: string
      email: string
    }
  }
}

export function TestReportTemplate({ reportData }: TestReportTemplateProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Test-Report-${reportData.testId}`,
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      <Card>
        <CardContent ref={componentRef} className="p-8">
          <div className="space-y-6 print:text-black">
            {/* Hospital Info */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">{reportData.hospitalInfo.name}</h1>
              <p>{reportData.hospitalInfo.address}</p>
              <p>Tel: {reportData.hospitalInfo.phone}</p>
              <p>Email: {reportData.hospitalInfo.email}</p>
            </div>

            <div className="border-b border-t border-dashed py-2 text-center">
              <h2 className="text-xl font-semibold">LABORATORY TEST REPORT</h2>
            </div>

            {/* Report Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-semibold">Test ID:</span> {reportData.testId}
                </p>
                <p>
                  <span className="font-semibold">Test Type:</span> {reportData.testType}
                </p>
                <p>
                  <span className="font-semibold">Request Date:</span>{" "}
                  {new Date(reportData.requestDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Result Date:</span>{" "}
                  {new Date(reportData.resultDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold">Patient:</span> {reportData.patientName}
                </p>
                <p>
                  <span className="font-semibold">Patient ID:</span> {reportData.patientId}
                </p>
                <p>
                  <span className="font-semibold">Referring Doctor:</span> {reportData.doctorName}
                </p>
                <p>
                  <span className="font-semibold">Lab Technician:</span> {reportData.technicianName}
                </p>
              </div>
            </div>

            {/* Test Results */}
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <div className="rounded-md border p-4">
                <p className="whitespace-pre-wrap">{reportData.result}</p>
              </div>

              {reportData.notes && (
                <div className="mt-4">
                  <h4 className="font-semibold">Additional Notes</h4>
                  <p className="whitespace-pre-wrap">{reportData.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 grid grid-cols-2 gap-8 border-t border-dashed pt-4">
              <div className="text-center">
                <div className="mt-12 border-t border-dashed pt-2">
                  <p className="font-semibold">{reportData.technicianName}</p>
                  <p className="text-sm">Laboratory Technician</p>
                </div>
              </div>
              <div className="text-center">
                <div className="mt-12 border-t border-dashed pt-2">
                  <p className="font-semibold">Dr. {reportData.doctorName}</p>
                  <p className="text-sm">Referring Doctor</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p>This is an official laboratory report from {reportData.hospitalInfo.name}</p>
              <p>Please consult your doctor for interpretation of these results</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
