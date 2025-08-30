"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search, FileText, User, Calendar, MapPin, Clock, Bot, MessageCircle, Copy, CheckCircle, AlertCircle, Sparkles, RefreshCw } from "lucide-react"

interface CaseRecord {
  id?: number
  uid?: string
  "Case Type"?: string
  "Case Number": string
  "Appellant": string
  "Respondent": string
  "Received"?: string
  "Next Date"?: string | null
  "Taluka": string
  status?: string
  remarks?: string
  created_at?: string
  updated_at?: string
}

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  cases?: CaseRecord[]
}

export default function CaseLookupChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: '🙏 नमस्कार! मी तुमचा AI केस लुकअप असिस्टंट आहे। मी तुम्हाला लगेच केसची माहिती देऊ शकतो।\n\nHello! I am your AI Case Lookup Assistant. I can provide you case information instantly.\n\n📝 कृपया केस नंबर टाका / Please enter case number:\n• संपूर्ण केस नंबर (जसे "अपील/177/2024") / Complete case number (like "Appeal/177/2024")\n• फक्त नंबर (जसे "177") / Only number (like "177")\n• अपीलकर्त्याचे नाव देखील शोधू शकता / You can also search appellant name',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedCaseId, setCopiedCaseId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const searchCases = async (query: string) => {
    try {
      const response = await fetch(`/api/search-cases?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.success) {
        return data.cases || []
      } else {
        console.error('Search failed:', data.error)
        return []
      }
    } catch (error) {
      console.error('Error searching cases:', error)
      return []
    }
  }

  const copyToClipboard = async (text: string, caseId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCaseId(caseId)
      setTimeout(() => setCopiedCaseId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: '🙏 नमस्कार! मी तुमचा AI केस लुकअप असिस्टंट आहे। मी तुम्हाला लगेच केसची माहिती देऊ शकतो।\n\nHello! I am your AI Case Lookup Assistant. I can provide you case information instantly.\n\n📝 कृपया केस नंबर टाका / Please enter case number:\n• संपूर्ण केस नंबर (जसे "अपील/177/2024") / Complete case number (like "Appeal/177/2024")\n• फक्त नंबर (जसे "177") / Only number (like "177")\n• अपीलकर्त्याचे नाव देखील शोधू शकता / You can also search appellant name',
        timestamp: new Date()
      }
    ])
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const query = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    try {
      const cases = await searchCases(query)

      let botResponse: Message

      if (cases.length === 0) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `❌ केस नंबर "${query}" साठी कोणताही रेकॉर्ड सापडला नाही। / No record found for case number "${query}".\n\n💡 सूचना / Suggestions:\n• केस नंबर तपासा / Check case number\n• फक्त नंबर लिहून पहा (जसे "177") / Try only number (like "177")\n• अपीलकर्त्याचे नाव लिहून पहा / Try appellant name\n• स्पेलिंग तपासा / Check spelling`,
          timestamp: new Date()
        }
      } else if (cases.length === 1) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `🎉 अतिशय छान! मला तुमचा केस सापडला आहे। येथे संपूर्ण माहिती आहे: / Excellent! I found your case. Here is the complete information:`,
          timestamp: new Date(),
          cases: cases
        }
      } else {
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: `✅ मला ${cases.length} केस सापडले आहेत जे "${query}" शी जुळतात: / I found ${cases.length} cases that match "${query}":`,
          timestamp: new Date(),
          cases: cases
        }
      }
      
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: '⚠️ माफ करा, केस शोधण्यात तांत्रिक समस्या आली आहे। / Sorry, there was a technical problem in searching the case.\n\n🔄 कृपया / Please:\n• काही वेळानंतर प्रयत्न करा / Try after some time\n• इंटरनेट कनेक्शन तपासा / Check internet connection\n• पेज रिफ्रेश करा / Refresh the page',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'N/A' || dateString === '-') return 'निर्धारित नाही / Not determined'
    try {
      // Handle DD-MM-YYYY format
      if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const [day, month, year] = dateString.split('-')
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return date.toLocaleDateString('hi-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      }
      return new Date(dateString).toLocaleDateString('hi-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (received: string | undefined) => {
    if (received === 'प्राप्त') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">✅ प्राप्त / Received</Badge>
    }
    return <Badge variant="outline" className="border-orange-200 text-orange-700">⏳ प्रलंबित / Pending</Badge>
  }

  const CaseCard = ({ case_ }: { case_: CaseRecord }) => (
    <Card className="mb-4 border-0 shadow-lg bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-t-lg">
        <CardTitle className="text-lg flex items-center gap-3 flex-wrap">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 truncate">{case_["Case Number"]}</div>
            <div className="text-sm text-gray-600 mt-1">केस नंबर / Case Number</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {case_["Case Type"] || "अपील / Appeal"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(case_["Case Number"], case_.uid || case_["Case Number"])}
              className="h-8 w-8 p-0 hover:bg-blue-100"
            >
              {copiedCaseId === (case_.uid || case_["Case Number"]) ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">अपीलकर्ता / Appellant</span>
            </div>
            <p className="text-sm text-gray-900 font-medium bg-green-50 p-2 rounded border-l-2 border-green-200">
              {case_["Appellant"]}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700">प्रतिवादी / Respondent</span>
            </div>
            <p className="text-sm text-gray-900 font-medium bg-red-50 p-2 rounded border-l-2 border-red-200">
              {case_["Respondent"]}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">तालुका / Taluka</span>
            </div>
            <p className="text-sm text-gray-900 font-medium bg-purple-50 p-2 rounded border-l-2 border-purple-200">
              {case_["Taluka"]}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">स्थिती / Status</span>
            </div>
            <div className="flex items-center">
              {getStatusBadge(case_["Received"])}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">पुढील तारीख / Next Date</span>
            </div>
            <p className="text-sm text-gray-900 font-medium bg-indigo-50 p-2 rounded border-l-2 border-indigo-200">
              {formatDate(case_["Next Date"])}
            </p>
          </div>
        </div>

        {case_.status && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-700">टिप्पणी / Remarks</span>
              </div>
              <p className="text-sm text-gray-900 bg-amber-50 p-3 rounded border-l-2 border-amber-200">
                {case_.status}
              </p>
            </div>
          </>
        )}

        {case_.uid && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-mono">ID: {case_.uid}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col h-[700px] max-w-5xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                AI केस लुकअप असिस्टंट / AI Case Lookup Assistant
                <Bot className="h-6 w-6 animate-pulse" />
              </h2>
              <p className="text-sm opacity-90 mt-1">लगेच केसची माहिती मिळवा / Get case information instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-white/80 hover:text-white hover:bg-white/10 h-8 px-3"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">ऑनलाइन / Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-900 shadow-lg border border-gray-100'
              }`}>
                {message.type === 'bot' && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 bg-blue-100 rounded-full">
                      <Bot className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-blue-600">AI असिस्टंट / AI Assistant</span>
                    <div className="flex-1"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                )}

                {message.type === 'user' && (
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium opacity-90">तुम्ही / You</span>
                  </div>
                )}

                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {message.content}
                </div>

                {message.cases && message.cases.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {message.cases.map((case_, index) => (
                      <CaseCard key={case_.uid || index} case_={case_} />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50">
                  <p className="text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString('hi-IN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {message.type === 'user' && (
                    <div className="text-xs opacity-60">✓ पाठवले / Sent</div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-900 shadow-lg border border-gray-100 rounded-2xl p-4 max-w-[85%]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-full">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-blue-600">AI असिस्टंट / AI Assistant</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  <span className="text-sm">केस डेटाबेसमध्ये शोधत आहे... / Searching in case database...</span>
                </div>
                <div className="mt-2 flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-6 border-t border-gray-100 bg-white rounded-b-xl">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="केस नंबर किंवा अपीलकर्त्याचे नाव टाका... / Enter case number or appellant name..."
              className="flex-1 h-12 pl-4 pr-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
              disabled={isLoading}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Quick suggestions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 font-medium">त्वरित शोध / Quick Search:</span>
          {[
            { text: '177', label: 'केस 177 / Case 177' },
            { text: 'अपील/177/2024', label: 'संपूर्ण केस नंबर / Full Case Number' },
            { text: 'भरत नवले', label: 'अपीलकर्ता नाव / Appellant Name' },
            { text: 'Igatpuri', label: 'तालुका / Taluka' }
          ].map((suggestion) => (
            <button
              key={suggestion.text}
              onClick={() => setInputValue(suggestion.text)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs bg-gradient-to-r from-gray-100 to-gray-50 hover:from-blue-100 hover:to-blue-50 text-gray-700 hover:text-blue-700 rounded-full border border-gray-200 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 font-medium"
              title={`शोधा / Search: ${suggestion.text}`}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
