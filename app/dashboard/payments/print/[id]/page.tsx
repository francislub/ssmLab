"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getReceiptData } from "@/lib/actions/payment-actions"
import { ReceiptTemplate } from "@/components/print/receipt-template"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PrintReceiptPage() {
  const params = useParams()
  const paymentId = params.id as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [receiptData, setReceiptData] = useState<any>(null)

  useEffect(() => {
    const fetchReceiptData = async () => {
      setLoading(true)
      try {
        const result = await getReceiptData(paymentId)

        if (result.error) {
          setError(result.error)
          return
        }

        setReceiptData(result.receiptData)
      } catch (err) {
        setError("Failed to load receipt data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (paymentId) {
      fetchReceiptData()
    }
  }, [paymentId])

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
      <h1 className="mb-6 text-2xl font-bold">Payment Receipt</h1>
      {receiptData && <ReceiptTemplate receiptData={receiptData} />}
    </div>
  )
}
