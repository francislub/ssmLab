"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getPrescriptionById } from "@/lib/actions/prescription-actions"
import { PrescriptionTemplate } from "@/components/print/prescription-template"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PrintPrescriptionPage() {
  const params = useParams()
  const prescriptionId = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prescriptionData, setPrescriptionData] = useState<any>(null)

  useEffect(() => {
    const fetchPrescriptionData = async () => {
      setLoading(true)
      try {
        const result = await getPrescriptionById(prescriptionId)

        if (result.error) {
          setError(result.error)
          return
        }

        setPrescriptionData({
          prescriptionId: result.prescription.id,
          date: result.prescription.createdAt,
          patientName: result.prescription.patient.name,
          patientId: result.prescription.patient.id,
          doctorName: result.prescription.diagnosis.doctor.name,
          medications: result.prescription.medications.map((med: any) => ({
            id: med.id,
            name: med.medicationName,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            notes: med.notes,
          })),
          diagnosisNotes: result.prescription.diagnosis.notes,
          hospitalInfo: {
            name: "SSM Laboratory & Medical Center",
            address: "123 Health Street, Kampala, Uganda",
            phone: "+256 700 123456",
            email: "info@ssmlab.com",
          },
        })
      } catch (err) {
        setError("Failed to load prescription data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (prescriptionId) {
      fetchPrescriptionData()
    }
  }, [prescriptionId])

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
                </div>
                <div>
                  <Skeleton className="h-4 w-full" />
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
      <h1 className="mb-6 text-2xl font-bold">Prescription</h1>
      {prescriptionData && <PrescriptionTemplate prescriptionData={prescriptionData} />}
    </div>
  )
}
