import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">KEBEERA Diagnostic Laboratory</h1>
          <p className="text-xl">SSM LAB Management System</p>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Welcome to SSM LAB</h2>
          <p className="text-xl mb-8">A comprehensive laboratory management system for healthcare professionals</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">For Staff</h3>
              <p className="mb-6">Access the system to manage patients, tests, and more.</p>
              <Link href="/login">
                <Button size="lg" className="w-full">
                  Login
                </Button>
              </Link>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">For Patients</h3>
              <p className="mb-6">Check your test results and appointment status.</p>
              <Link href="/patient-portal">
                <Button size="lg" variant="outline" className="w-full">
                  Patient Portal
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-blue-100 dark:bg-blue-900">
              <h3 className="font-semibold text-lg mb-2">Fast Results</h3>
              <p>Get your test results quickly and accurately</p>
            </div>
            <div className="p-6 rounded-lg bg-green-100 dark:bg-green-900">
              <h3 className="font-semibold text-lg mb-2">Expert Staff</h3>
              <p>Our team of professionals ensures quality service</p>
            </div>
            <div className="p-6 rounded-lg bg-purple-100 dark:bg-purple-900">
              <h3 className="font-semibold text-lg mb-2">Modern Equipment</h3>
              <p>State-of-the-art technology for precise diagnostics</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} KEBEERA Diagnostic Laboratory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
