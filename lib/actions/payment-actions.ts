"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Cashier Function: Generate invoice
export async function generateInvoice(patientId: string) {
  try {
    // Get patient details
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          where: {
            paymentStatus: "UNPAID",
          },
          include: {
            doctor: true,
          },
        },
        testRequests: {
          where: {
            status: "COMPLETED",
            diagnosis: {
              patient: {
                id: patientId,
              },
            },
          },
          include: {
            testResult: true,
          },
        },
        prescriptions: {
          where: {
            medications: {
              some: {
                medicationDispenses: {
                  some: {
                    status: "DISPENSED",
                  },
                },
              },
            },
          },
          include: {
            medications: {
              include: {
                medicationDispenses: true,
              },
            },
          },
        },
      },
    })

    if (!patient) {
      return { error: "Patient not found" }
    }

    // Calculate costs
    const consultationFees = patient.appointments.reduce((sum, appointment) => sum + 50000, 0) // Example: 50,000 UGX per consultation
    const testFees = patient.testRequests.reduce((sum, test) => sum + 30000, 0) // Example: 30,000 UGX per test

    // Calculate medication fees from prescriptions
    let medicationFees = 0
    for (const prescription of patient.prescriptions) {
      for (const medication of prescription.medications) {
        for (const dispense of medication.medicationDispenses) {
          // Assuming each medication has a price stored in the inventory
          const medicationInventory = await prisma.medicationInventory.findFirst({
            where: { name: { equals: medication.medicationName } },
          })

          if (medicationInventory) {
            medicationFees += medicationInventory.unitPrice * dispense.quantity
          }
        }
      }
    }

    const totalAmount = consultationFees + testFees + medicationFees

    // Create invoice in the database
    const invoice = await prisma.invoice.create({
      data: {
        patient: { connect: { id: patientId } },
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        amount: totalAmount,
        status: "PENDING",
        items: {
          create: [
            { name: "Consultation Fees", amount: consultationFees },
            { name: "Laboratory Tests", amount: testFees },
            { name: "Medications", amount: medicationFees },
          ],
        },
      },
      include: {
        patient: true,
        items: true,
      },
    })

    revalidatePath(`/dashboard/patients/${patientId}`)
    revalidatePath("/dashboard/payments")

    return { success: true, invoice }
  } catch (error) {
    console.error("Error generating invoice:", error)
    return { error: "Failed to generate invoice" }
  }
}

// Cashier Function: Process payment
export async function processPayment(patientId: string, amount: number, paymentMethod: string, invoiceId?: string) {
  try {
    // Generate receipt number
    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        patient: { connect: { id: patientId } },
        amount,
        paymentMethod,
        receiptNumber,
        status: "COMPLETED",
        description: invoiceId ? `Payment for invoice #${invoiceId}` : "Payment for services",
        invoice: invoiceId ? { connect: { id: invoiceId } } : undefined,
      },
      include: {
        patient: true,
      },
    })

    // If invoice ID is provided, update its status
    if (invoiceId) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: "PAID" },
      })
    }

    // Update appointment payment status if applicable
    if (invoiceId) {
      await prisma.appointment.updateMany({
        where: {
          patientId,
          paymentStatus: "UNPAID",
        },
        data: {
          paymentStatus: "PAID",
        },
      })
    }

    revalidatePath(`/dashboard/patients/${patientId}`)
    revalidatePath("/dashboard/payments")

    return { success: true, payment }
  } catch (error) {
    console.error("Error processing payment:", error)
    return { error: "Failed to process payment" }
  }
}

// Cashier Function: View payment history
export async function viewPaymentHistory(patientId: string) {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        patientId,
      },
      include: {
        patient: true,
        cashier: true,
        invoice: {
          include: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { payments }
  } catch (error) {
    console.error("Error fetching payment history:", error)
    return { error: "Failed to fetch payment history" }
  }
}

// Cashier Function: Get receipt data for printing
export async function getReceiptData(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        patient: true,
        cashier: true,
        invoice: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!payment) {
      return { error: "Payment not found" }
    }

    // Format receipt data
    const receiptData = {
      receiptNumber: payment.receiptNumber,
      date: payment.createdAt,
      patientName: payment.patient.name,
      patientId: payment.patient.id,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      description: payment.description,
      cashierName: payment.cashier?.name || "System",
      invoiceItems: payment.invoice?.items || [],
      hospitalInfo: {
        name: "SSM Laboratory & Medical Center",
        address: "123 Health Street, Kampala, Uganda",
        phone: "+256 700 123456",
        email: "info@ssmlab.com",
      },
    }

    return { success: true, receiptData }
  } catch (error) {
    console.error("Error fetching receipt data:", error)
    return { error: "Failed to fetch receipt data" }
  }
}

// Cashier Function: Issue payment confirmation
export async function issuePaymentConfirmation(patientId: string, paymentId: string) {
  try {
    // Update payment to include confirmation
    const payment = await prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        confirmationSent: true,
        confirmationDate: new Date(),
      },
      include: {
        patient: true,
      },
    })

    revalidatePath(`/dashboard/patients/${patientId}`)
    revalidatePath("/dashboard/payments")

    return { success: true, payment }
  } catch (error) {
    console.error("Error issuing payment confirmation:", error)
    return { error: "Failed to issue payment confirmation" }
  }
}

export async function getPayments(query?: string, status?: string) {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { patient: { name: { contains: query, mode: "insensitive" } } },
                  { receiptNumber: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          status ? { status: status as any } : {},
        ],
      },
      include: {
        patient: true,
        cashier: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { payments }
  } catch (error) {
    console.error("Error fetching payments:", error)
    return { error: "Failed to fetch payments" }
  }
}

export async function getPaymentById(id: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: {
        id,
      },
      include: {
        patient: true,
        cashier: true,
      },
    })

    if (!payment) {
      return { error: "Payment not found" }
    }

    return { payment }
  } catch (error) {
    console.error("Error fetching payment:", error)
    return { error: "Failed to fetch payment" }
  }
}

export async function createPayment(data: {
  patientId: string
  cashierId: string
  amount: number
  paymentMethod: string
  description: string
  receiptNumber?: string
}) {
  try {
    // Generate receipt number if not provided
    const receiptNumber = data.receiptNumber || `REC-${Date.now().toString().slice(-6)}`

    const payment = await prisma.payment.create({
      data: {
        patient: {
          connect: {
            id: data.patientId,
          },
        },
        cashier: {
          connect: {
            id: data.cashierId,
          },
        },
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        description: data.description,
        receiptNumber,
        status: "COMPLETED",
      },
      include: {
        patient: true,
        cashier: true,
      },
    })

    revalidatePath("/dashboard/payments")
    revalidatePath(`/dashboard/patients/${data.patientId}`)
    return { success: true, payment }
  } catch (error) {
    console.error("Error creating payment:", error)
    return { error: "Failed to create payment" }
  }
}

export async function updatePayment(
  id: string,
  data: {
    amount?: number
    paymentMethod?: string
    description?: string
    status?: "PENDING" | "COMPLETED" | "REFUNDED" | "CANCELLED"
  },
) {
  try {
    const payment = await prisma.payment.update({
      where: {
        id,
      },
      data,
      include: {
        patient: true,
        cashier: true,
      },
    })

    revalidatePath("/dashboard/payments")
    revalidatePath(`/dashboard/patients/${payment.patientId}`)
    return { success: true, payment }
  } catch (error) {
    console.error("Error updating payment:", error)
    return { error: "Failed to update payment" }
  }
}

export async function deletePayment(id: string) {
  try {
    const payment = await prisma.payment.delete({
      where: {
        id,
      },
    })

    revalidatePath("/dashboard/payments")
    revalidatePath(`/dashboard/patients/${payment.patientId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting payment:", error)
    return { error: "Failed to delete payment" }
  }
}

export async function getRevenueData() {
  try {
    // Get monthly revenue for the current year
    const currentYear = new Date().getFullYear()
    const startDate = new Date(currentYear, 0, 1) // January 1st of current year
    const endDate = new Date(currentYear + 1, 0, 1) // January 1st of next year

    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "createdAt") as month,
        SUM(amount) as revenue
      FROM "Payment"
      WHERE "createdAt" >= ${startDate} AND "createdAt" < ${endDate}
      AND status = 'COMPLETED'
      GROUP BY EXTRACT(MONTH FROM "createdAt")
      ORDER BY month
    `

    // Format the data for the chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const revenueData = months.map((month, index) => {
      const monthData = (monthlyRevenue as any[]).find((item) => Number(item.month) === index + 1)
      return {
        month,
        revenue: monthData ? Number(monthData.revenue) : 0,
      }
    })

    return { revenueData }
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return { error: "Failed to fetch revenue data" }
  }
}

export async function getPaymentStats() {
  try {
    // Get total revenue
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })

    // Get today's revenue
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayRevenue = await prisma.payment.aggregate({
      where: {
        createdAt: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })

    // Get this week's revenue
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    const weekRevenue = await prisma.payment.aggregate({
      where: {
        createdAt: {
          gte: weekStart,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })

    // Get this month's revenue
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const monthRevenue = await prisma.payment.aggregate({
      where: {
        createdAt: {
          gte: monthStart,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })

    // Get payment methods distribution
    const paymentMethods = await prisma.payment.groupBy({
      by: ["paymentMethod"],
      where: {
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      todayRevenue: todayRevenue._sum.amount || 0,
      weekRevenue: weekRevenue._sum.amount || 0,
      monthRevenue: monthRevenue._sum.amount || 0,
      paymentMethods: paymentMethods.map((method) => ({
        method: method.paymentMethod,
        amount: method._sum.amount || 0,
      })),
    }
  } catch (error) {
    console.error("Error fetching payment stats:", error)
    return { error: "Failed to fetch payment statistics" }
  }
}
