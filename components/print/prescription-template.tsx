"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer } from "lucide-react"
import { useReactToPrint } from "react-to-print"

interface PrescriptionTemplateProps {
  prescriptionData: {
    prescriptionId: string
    date: Date
    patientName: string
    patientId: string
    doctorName: string
    medications: {
      id: string
      name: string
      dosage: string
      frequency: string
      duration: string
      notes?: string
    }[]
    diagnosisNotes?: string
    hospitalInfo: {
      name: string
      address: string
      phone: string
      email: string
    }
  }
}

export function PrescriptionTemplate({ prescriptionData }: PrescriptionTemplateProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Prescription-${prescriptionData.prescriptionId}`,
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Prescription
        </Button>
      </div>

      <Card>
        <CardContent ref={componentRef} className="p-8">
          <div className="space-y-6 print:text-black">
            {/* Hospital Info */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">{prescriptionData.hospitalInfo.name}</h1>
              <p>{prescriptionData.hospitalInfo.address}</p>
              <p>Tel: {prescriptionData.hospitalInfo.phone}</p>
              <p>Email: {prescriptionData.hospitalInfo.email}</p>
            </div>

            <div className="border-b border-t border-dashed py-2 text-center">
              <h2 className="text-xl font-semibold">PRESCRIPTION</h2>
            </div>

            {/* Prescription Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-semibold">Prescription ID:</span> {prescriptionData.prescriptionId}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(prescriptionData.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold">Patient:</span> {prescriptionData.patientName}
                </p>
                <p>
                  <span className="font-semibold">Patient ID:</span> {prescriptionData.patientId}
                </p>
              </div>
            </div>

            {/* Diagnosis */}
            {prescriptionData.diagnosisNotes && (
              <div className="mt-4">
                <h3 className="font-semibold">Diagnosis</h3>
                <p className="whitespace-pre-wrap">{prescriptionData.diagnosisNotes}</p>
              </div>
            )}

            {/* Medications */}
            <div className="mt-4">
              <h3 className="font-semibold">Medications</h3>
              <table className="mt-2 w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Medication</th>
                    <th className="py-2 text-left">Dosage</th>
                    <th className="py-2 text-left">Frequency</th>
                    <th className="py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptionData.medications.map((med) => (
                    <tr key={med.id} className="border-b border-dashed">
                      <td className="py-2">{med.name}</td>
                      <td className="py-2">{med.dosage}</td>
                      <td className="py-2">{med.frequency}</td>
                      <td className="py-2">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Medication Notes */}
              <div className="mt-4 space-y-2">
                {prescriptionData.medications.map(
                  (med) =>
                    med.notes && (
                      <div key={`${med.id}-notes`}>
                        <p>
                          <span className="font-semibold">{med.name}:</span> {med.notes}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 grid grid-cols-1 gap-8 border-t border-dashed pt-4">
              <div className="text-right">
                <div className="mt-12 border-t border-dashed pt-2">
                  <p className="font-semibold">Dr. {prescriptionData.doctorName}</p>
                  <p className="text-sm">Prescribing Doctor</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              <p>This prescription is valid for 30 days from the date of issue</p>
              <p>Please follow the dosage instructions carefully</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
