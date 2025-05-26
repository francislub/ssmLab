import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Microscope, Users, Clock, Shield, Award, Heart, ArrowRight, CheckCircle, Star, Activity } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Microscope className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">KEBEERA Diagnostic Laboratory</h1>
              <p className="text-xl opacity-90">Advanced Laboratory Management System</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Trusted Healthcare Partner
          </Badge>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Welcome to Kebera Lab
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience excellence in diagnostic services with our state-of-the-art laboratory management system,
              designed for healthcare professionals who demand precision and efficiency.
            </p>

            {/* Staff Login Card */}
            <Card className="max-w-md mx-auto mb-12 shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Staff Access Portal</CardTitle>
                <CardDescription className="text-base">
                  Access the comprehensive system to manage patients, tests, appointments, and more
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Login to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Why Choose Kebera Lab?</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We combine cutting-edge technology with expert healthcare professionals to deliver exceptional
                diagnostic services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Fast & Accurate Results</h4>
                  <p className="text-muted-foreground">
                    Get your test results quickly with our advanced automated systems and expert analysis
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Expert Medical Team</h4>
                  <p className="text-muted-foreground">
                    Our team of certified professionals ensures the highest quality standards in every test
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Microscope className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Advanced Technology</h4>
                  <p className="text-muted-foreground">
                    State-of-the-art equipment and modern laboratory techniques for precise diagnostics
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Secure & Confidential</h4>
                  <p className="text-muted-foreground">
                    Your health information is protected with industry-leading security measures
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Patient-Centered Care</h4>
                  <p className="text-muted-foreground">
                    Compassionate service focused on your comfort and well-being throughout your visit
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-3">Comprehensive Testing</h4>
                  <p className="text-muted-foreground">
                    Wide range of diagnostic tests and health screenings available under one roof
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Our Services</h3>
              <p className="text-lg text-muted-foreground">
                Comprehensive diagnostic solutions for all your healthcare needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                "Blood Chemistry",
                "Hematology",
                "Microbiology",
                "Immunology",
                "Pathology",
                "Radiology",
                "Cardiology",
                "Endocrinology",
              ].map((service, index) => (
                <div
                  key={service}
                  className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 hover:shadow-md transition-all duration-300"
                >
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <div className="text-blue-100">Tests Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5,000+</div>
                <div className="text-blue-100">Happy Patients</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-blue-100">Expert Staff</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Service Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">What Our Patients Say</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Dr. Sarah Johnson",
                  role: "Family Physician",
                  content:
                    "Kebera Lab consistently delivers accurate results with exceptional turnaround times. Their professionalism is unmatched.",
                  rating: 5,
                },
                {
                  name: "Michael Chen",
                  role: "Patient",
                  content:
                    "The staff is incredibly caring and the facility is modern and clean. I always feel comfortable during my visits.",
                  rating: 5,
                },
                {
                  name: "Dr. Emily Rodriguez",
                  role: "Cardiologist",
                  content:
                    "Their advanced diagnostic capabilities have been instrumental in providing the best care for my patients.",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Microscope className="h-6 w-6" />
                <span className="text-xl font-bold">Kebera Lab</span>
              </div>
              <p className="text-gray-400">
                Leading diagnostic laboratory committed to excellence in healthcare services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Laboratory Testing</li>
                <li>Health Screenings</li>
                <li>Diagnostic Imaging</li>
                <li>Consultation Services</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Phone: +256 123 456 789</li>
                <li>Email: info@keberalab.com</li>
                <li>Address: Kampala, Uganda</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hours</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mon - Fri: 7:00 AM - 8:00 PM</li>
                <li>Saturday: 8:00 AM - 6:00 PM</li>
                <li>Sunday: 9:00 AM - 4:00 PM</li>
                <li>Emergency: 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} KEBEERA Diagnostic Laboratory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
