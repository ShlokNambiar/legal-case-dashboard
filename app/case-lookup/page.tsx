"use client"

import CaseLookupChatbot from "@/components/case-lookup-chatbot"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Scale, MessageCircle, Search, FileText, Copy } from "lucide-react"

export default function CaseLookupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              मुख्य पृष्ठ पर वापस जाएं
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div className="text-right">
              <h1 className="text-lg font-bold text-gray-900">Legal Case Monitoring System</h1>
              <p className="text-sm text-gray-600">Sub-Divisional Magistrate Office, Nashik</p>
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                केस लुकअप चैटबॉट
              </h1>
              <p className="text-lg text-gray-600 font-medium">
                केस नंबर से तुरंत अपना केस खोजें
              </p>
              <p className="text-sm text-gray-500 max-w-2xl mx-auto">
                बस अपना केस नंबर टाइप करें और हमारा AI असिस्टेंट आपको पूरी जानकारी देगा
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 max-w-5xl mx-auto shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            कैसे उपयोग करें
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div className="font-semibold text-blue-900 mb-2">केस नंबर दर्ज करें</div>
              <div className="text-blue-700">जैसे: "177" या "अपील/177/2024"</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div className="font-semibold text-green-900 mb-2">AI से जवाब पाएं</div>
              <div className="text-green-700">तुरंत केस की पूरी जानकारी मिलेगी</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div className="font-semibold text-purple-900 mb-2">विवरण कॉपी करें</div>
              <div className="text-purple-700">केस की जानकारी को आसानी से कॉपी करें</div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600">तुरंत खोज</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-xs text-gray-600">AI चैट</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-xs text-gray-600">पूरी जानकारी</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Copy className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-xs text-gray-600">कॉपी सुविधा</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbot Component */}
        <div className="max-w-6xl mx-auto">
          <CaseLookupChatbot />
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
