"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer } from "lucide-react"
import { useReactToPrint } from "react-to-print"

interface ReceiptTemplateProps {
  receiptData: {
    receiptNumber: string
    date: Date
    patientName: string
    patientId: string
    amount: number
    paymentMethod: string
    description: string
    cashierName: string
    invoiceItems?: { id: string; name: string; amount: number }[]
    hospitalInfo: {
      name: string
      address: string
      phone: string
      email: string
    }
  }
}

export function ReceiptTemplate({ receiptData }: ReceiptTemplateProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Receipt-${receiptData.receiptNumber}`,
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
      </div>

      <Card>
        <CardContent ref={componentRef} className="p-8">
          <div className="space-y-6 print:text-black">
            {/* Hospital Info */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">{receiptData.hospitalInfo.name}</h1>
              <p>{receiptData.hospitalInfo.address}</p>
              <p>Tel: {receiptData.hospitalInfo.phone}</p>
              <p>Email: {receiptData.hospitalInfo.email}</p>
            </div>

            <div className="border-b border-t border-dashed py-2 text-center">
              <h2 className="text-xl font-semibold">RECEIPT</h2>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-semibold">Receipt No:</span> {receiptData.receiptNumber}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(receiptData.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold">Patient:</span> {receiptData.patientName}
                </p>
                <p>
                  <span className="font-semibold">Patient ID:</span> {receiptData.patientId}
                </p>
              </div>
            </div>

            {/* Invoice Items */}
            {receiptData.invoiceItems && receiptData.invoiceItems.length > 0 ? (
              <div className="mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Description</th>
                      <th className="py-2 text-right">Amount (UGX)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptData.invoiceItems.map((item) => (
                      <tr key={item.id} className="border-b border-dashed">
                        <td className="py-2">{item.name}</td>
                        <td className="py-2 text-right">{item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="font-bold">
                      <td className="py-2">Total</td>
                      <td className="py-2 text-right">{receiptData.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4">
                <p>
                  <span className="font-semibold">Description:</span> {receiptData.description}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Amount:</span> UGX {receiptData.amount.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Payment Method:</span> {receiptData.paymentMethod}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 border-t border-dashed pt-4 text-center">
              <p>
                <span className="font-semibold">Cashier:</span> {receiptData.cashierName}
              </p>
              <p className="mt-4 text-sm">Thank you for choosing {receiptData.hospitalInfo.name}</p>
              <p className="text-xs text-muted-foreground">
                This is a computer-generated receipt and requires no signature
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
