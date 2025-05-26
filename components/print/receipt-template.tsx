"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Printer, Download, Mail, Microscope, MapPin, Phone, Globe } from "lucide-react"
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

  const handleDownload = () => {
    // This would typically generate a PDF
    handlePrint()
  }

  const handleEmail = () => {
    // This would typically send the receipt via email
    console.log("Email receipt functionality would be implemented here")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "CASH":
        return "bg-green-100 text-green-800"
      case "MOBILE_MONEY":
        return "bg-blue-100 text-blue-800"
      case "CARD":
        return "bg-purple-100 text-purple-800"
      case "BANK_TRANSFER":
        return "bg-orange-100 text-orange-800"
      case "INSURANCE":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end print:hidden">
        <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Printer className="h-4 w-4" />
          Print Receipt
        </Button>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button onClick={handleEmail} variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Email Receipt
        </Button>
      </div>

      {/* Receipt Card */}
      <Card className="max-w-2xl mx-auto shadow-2xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 h-2"></div>

        <CardContent ref={componentRef} className="p-0">
          <div className="p-8 space-y-6 print:text-black bg-white">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-full">
                  <Microscope className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{receiptData.hospitalInfo.name}</h1>
                  <p className="text-sm text-gray-600 font-medium">Advanced Diagnostic Laboratory</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{receiptData.hospitalInfo.address}</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{receiptData.hospitalInfo.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{receiptData.hospitalInfo.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Receipt Title */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-green-50 px-6 py-3 rounded-full border border-blue-200">
                <h2 className="text-2xl font-bold text-gray-900">PAYMENT RECEIPT</h2>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Receipt Number</p>
                  <p className="text-lg font-bold text-gray-900">{receiptData.receiptNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date & Time</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(receiptData.date)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Patient Name</p>
                  <p className="text-lg font-bold text-gray-900">{receiptData.patientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Patient ID</p>
                  <p className="text-lg font-semibold text-gray-900">{receiptData.patientId}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">Payment Details</h3>

              {/* Invoice Items */}
              {receiptData.invoiceItems && receiptData.invoiceItems.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Service Description
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {receiptData.invoiceItems.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                              {formatCurrency(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gradient-to-r from-blue-50 to-green-50">
                        <tr>
                          <td className="px-6 py-4 text-lg font-bold text-gray-900">Total Amount</td>
                          <td className="px-6 py-4 text-lg font-bold text-gray-900 text-right">
                            {formatCurrency(receiptData.amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Service Description</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{receiptData.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Amount</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(receiptData.amount)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Payment Method</p>
                  <Badge className={`mt-1 ${getPaymentMethodColor(receiptData.paymentMethod)}`}>
                    {receiptData.paymentMethod.replace("_", " ")}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</p>
                  <Badge className="mt-1 bg-green-100 text-green-800">PAID</Badge>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Footer */}
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Processed By</p>
                <p className="text-lg font-semibold text-gray-900">{receiptData.cashierName}</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  Thank you for choosing {receiptData.hospitalInfo.name}
                </p>
                <p className="text-sm text-gray-600">
                  Your health is our priority. We appreciate your trust in our services.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 text-center">
                  This is a computer-generated receipt and is valid without signature. For any queries, please contact
                  us at {receiptData.hospitalInfo.phone} or {receiptData.hospitalInfo.email}
                </p>
              </div>

              {/* QR Code Placeholder */}
              <div className="text-center">
                <div className="inline-block p-4 bg-white border-2 border-gray-300 rounded-lg">
                  <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR Code</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Scan for digital receipt verification</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
