"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Microscope,
  CreditCard,
  Pill,
  User,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react"

interface SidebarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Check if screen is mobile on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }

    // Initial check
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const userRole = session?.user?.role || "RECEPTIONIST"

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "RECEPTIONIST", "DOCTOR", "LAB_TECHNICIAN", "CASHIER", "PHARMACIST"],
    },
    {
      name: "Patients",
      href: "/dashboard/patients",
      icon: Users,
      roles: ["ADMIN", "RECEPTIONIST", "DOCTOR"],
    },
    {
      name: "Appointments",
      href: "/dashboard/appointments",
      icon: Calendar,
      roles: ["ADMIN", "RECEPTIONIST", "DOCTOR"],
    },
    {
      name: "Lab Tests",
      href: "/dashboard/lab-tests",
      icon: Microscope,
      roles: ["ADMIN", "DOCTOR", "LAB_TECHNICIAN"],
    },
    {
      name: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
      roles: ["ADMIN", "CASHIER"],
    },
    {
      name: "Pharmacy",
      href: "/dashboard/pharmacy",
      icon: Pill,
      roles: ["ADMIN", "PHARMACIST"],
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
      roles: ["ADMIN", "RECEPTIONIST", "DOCTOR", "LAB_TECHNICIAN", "CASHIER", "PHARMACIST"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["ADMIN"],
    },
  ]

  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRole))

  const handleSignOut = async () => {
    // Handle sign out logic
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-to-b from-primary-900 to-primary-800 text-white transition-transform duration-300 ease-in-out lg:relative lg:z-0",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Mobile close button */}
        <button className="absolute right-4 top-4 text-white lg:hidden" onClick={() => setIsMobileOpen(false)}>
          <X className="h-6 w-6" />
        </button>

        {/* Logo and collapse button */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            {!isCollapsed ? (
              <span className="text-xl font-bold">SSM LAB</span>
            ) : (
              <span className="text-xl font-bold">SL</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden text-white hover:bg-primary-700 lg:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronRight className={cn("h-5 w-5 transition-transform", isCollapsed ? "rotate-180" : "")} />
          </Button>
        </div>

        {/* User info */}
        <div className="mt-2 flex flex-col items-center p-4">
          <Avatar className="h-12 w-12 border-2 border-white">
            <AvatarImage src="/placeholder.svg" alt={session?.user?.name || "User"} />
            <AvatarFallback className="bg-primary-700 text-white">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="mt-2 text-center">
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-xs text-primary-200">{userRole.replace("_", " ")}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 font-normal text-white hover:bg-primary-700",
                      isActive ? "bg-primary-700 font-medium" : "",
                      isCollapsed ? "justify-center px-2" : "",
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-primary-200")} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Sign out button */}
        <div className="mt-auto p-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-white hover:bg-primary-700",
              isCollapsed ? "justify-center px-2" : "",
            )}
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 shrink-0 text-primary-200" />
            {!isCollapsed && <span>Sign out</span>}
          </Button>
        </div>
      </aside>
    </>
  )
}
