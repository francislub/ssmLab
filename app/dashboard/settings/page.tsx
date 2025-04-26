"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [loading, setLoading] = useState(false)

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Settings saved",
        description: "Your general settings have been saved successfully.",
      })
      setLoading(false)
    }, 1000)
  }

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Notification settings saved",
        description: "Your notification preferences have been updated.",
      })
      setLoading(false)
    }, 1000)
  }

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Security settings saved",
        description: "Your security settings have been updated.",
      })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your system settings and preferences</p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your lab management system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="labName">Lab Name</Label>
                  <Input id="labName" defaultValue="SSM Laboratory" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" defaultValue="123 Main Street, Kampala, Uganda" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+256 700 123 456" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="info@ssmlab.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="UGX">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UGX">Ugandan Shilling (UGX)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="EAT">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EAT">East Africa Time (UTC+3)</SelectItem>
                      <SelectItem value="UTC">Coordinated Universal Time (UTC)</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="EST">Eastern Standard Time (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveNotifications} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive text messages for critical alerts</p>
                    </div>
                    <Switch id="sms-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="browser-notifications">Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show desktop notifications while using the application
                      </p>
                    </div>
                    <Switch id="browser-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send reminders for upcoming appointments</p>
                    </div>
                    <Switch id="appointment-reminders" defaultChecked />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your security preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSecurity} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="30" min="5" max="120" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                  <Input id="password-expiry" type="number" defaultValue="90" min="30" max="365" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require two-factor authentication for all users</p>
                  </div>
                  <Switch id="two-factor" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="audit-logging">Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Keep detailed logs of all system activities</p>
                  </div>
                  <Switch id="audit-logging" defaultChecked />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Security Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-20 w-full items-center justify-center rounded-md border bg-white">
                        Light
                      </div>
                      <Button variant="outline" size="sm">
                        Select
                      </Button>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-20 w-full items-center justify-center rounded-md border bg-gray-900 text-white">
                        Dark
                      </div>
                      <Button variant="outline" size="sm">
                        Select
                      </Button>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-20 w-full items-center justify-center rounded-md border bg-gradient-to-r from-white to-gray-900 text-black">
                        System
                      </div>
                      <Button variant="outline" size="sm">
                        Select
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="h-8 rounded-md bg-blue-500" />
                    <div className="h-8 rounded-md bg-green-500" />
                    <div className="h-8 rounded-md bg-red-500" />
                    <div className="h-8 rounded-md bg-purple-500" />
                    <div className="h-8 rounded-md bg-yellow-500" />
                    <div className="h-8 rounded-md bg-pink-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="font-size">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Appearance</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
