"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scale, MapPin, ArrowRight, FileText, Users, Clock, Shield, MessageCircle } from "lucide-react"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center space-y-6 py-8 sm:py-12">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Scale className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Legal Case Monitoring System
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 font-medium">Sub-Divisional Magistrate Office, Nashik</p>
              <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                Streamlined case management and monitoring for efficient legal proceedings across subdivisions
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">Case Management</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">Multi-User Access</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">Real-time Updates</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-medium text-gray-700">Secure Platform</p>
          </div>
        </div>

        {/* Case Lookup Chatbot */}
        <div className="mb-8">
          <Card className="group border border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="text-center pb-6">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">केस लुकअप चैटबॉट</CardTitle>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                केस नंबर से तुरंत अपना केस खोजें - AI असिस्टेंट के साथ आसान और तेज़
              </p>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <Link href="/case-lookup" className="block">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  केस लुकअप चैटबॉट खोलें
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Igatpuri Dashboard */}
          <Card className="group border border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="text-center pb-6">
              <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Igatpuri Subdivision</CardTitle>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Monitor and manage legal cases for Igatpuri area with comprehensive tracking and reporting
              </p>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <Link href="/igatpuri" className="block">
                <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Access Igatpuri Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Trimbakeshwar Dashboard */}
          <Card className="group border border-indigo-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader className="text-center pb-6">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Trimbakeshwar Subdivision</CardTitle>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Monitor and manage legal cases for Trimbakeshwar area with comprehensive tracking and reporting
              </p>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <Link href="/trimbakeshwar" className="block">
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Access Trimbakeshwar Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200 mt-12">
          <p className="text-sm text-gray-500">
            © 2024 Sub-Divisional Magistrate Office, Nashik. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Powered by Legal Case Monitoring System
          </p>
        </div>

      </div>
    </div>
  )
}
