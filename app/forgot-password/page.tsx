"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { resetPassword } from "@/lib/actions/auth-actions"
import { KeyRound, Mail, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [resetComplete, setResetComplete] = useState(false)
  const [tempPassword, setTempPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await resetPassword(email)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setResetComplete(true)
        // In a real app, you wouldn't show the temp password in the UI
        // This is just for demo purposes
        setTempPassword(result.tempPassword || "")
        toast({
          title: "Success",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while resetting your password",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md overflow-hidden shadow-xl">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,#8b5cf6,#ec4899,#3b82f6)] opacity-10 blur-3xl"></div>
        <CardHeader className="space-y-1 bg-primary-50 dark:bg-gray-800/50">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-4">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        {!resetComplete ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="flex items-center justify-center gap-1 text-primary hover:underline">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4 pt-6">
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-200">
                Password reset instructions have been sent to your email.
              </p>
            </div>
            {tempPassword && (
              <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  Demo Mode: Your temporary password is:
                </p>
                <p className="mt-1 font-mono text-center bg-white dark:bg-gray-800 p-2 rounded border">
                  {tempPassword}
                </p>
                <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                  In a real application, this would be sent securely via email.
                </p>
              </div>
            )}
            <Button asChild className="w-full mt-4">
              <Link href="/login">Return to Login</Link>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
