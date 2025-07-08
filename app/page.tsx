"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scale, MapPin, ArrowRight } from "lucide-react"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        {/* Header */}
        <div className="text-center space-y-4 pb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Scale className="h-8 w-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Legal Case Monitoring System</h1>
              <p className="text-gray-600">Sub-Divisional Magistrate Office, Nashik</p>
            </div>
          </div>
        </div>

        {/* Dashboard Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Igatpuri Dashboard */}
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-3">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Igatpuri Subdivision</CardTitle>
              <p className="text-sm text-gray-600">Monitor and manage legal cases for Igatpuri area</p>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/igatpuri">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Access Igatpuri Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Trimbakeshwar Dashboard */}
          <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-3">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">Trimbakeshwar Subdivision</CardTitle>
              <p className="text-sm text-gray-600">Monitor and manage legal cases for Trimbakeshwar area</p>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href="/trimbakeshwar">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Access Trimbakeshwar Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>




      </div>
    </div>
  )
}
