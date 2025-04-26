"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createUser } from "@/lib/actions/user-actions"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "RECEPTIONIST",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate form
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Create user
    const result = await createUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role as any,
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
        description: "Account created successfully. You can now log in.",
      })
      router.push("/login")
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="NURSE">Nurse</SelectItem>
                  <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                  <SelectItem value="LAB_TECHNICIAN">Lab Technician</SelectItem>
                  <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                  <SelectItem value="CASHIER">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
