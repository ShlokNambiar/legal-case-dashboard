"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Send,
  Download,
  FileText,
  BarChart3,
  Clock,
  Users,
  TrendingUp,
  Moon,
  Sun,
  Plus,
  Eye,
  SortAsc,
  SortDesc,
  RefreshCw,
  Bell,
  Settings,
  ChevronDown,
  MapPin,
  Scale,
  Gavel,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Enhanced sample data with more fields
const sampleCases = [
  {
    caseId: "अपिल/66/2023",
    type: "Appeal",
    petitioner: "राम शर्मा",
    respondent: "श्याम वर्मा",
    taluka: "Igatpuri",
    hearingDate: "2024-01-15",
    status: "Notice Served",
    reminderDate: "2024-01-13",
    priority: "High",
    filedDate: "2023-11-15",
    lastUpdate: "2024-01-10",
    assignedOfficer: "अधिकारी पटेल",
    documents: 5,
    nextAction: "Prepare case file",
    estimatedDays: 15,
  },
  {
    caseId: "अतिक्रमण/45/2023",
    type: "Encroachment",
    petitioner: "सुनीता पाटील",
    respondent: "महानगरपालिका",
    taluka: "Trimbakeshwar",
    hearingDate: "2024-01-16",
    status: "Awaiting Response",
    reminderDate: "2024-01-14",
    priority: "Medium",
    filedDate: "2023-10-20",
    lastUpdate: "2024-01-08",
    assignedOfficer: "अधिकारी शर्मा",
    documents: 8,
    nextAction: "Site inspection",
    estimatedDays: 20,
  },
  {
    caseId: "भाडेकरू/23/2023",
    type: "Tenancy Dispute",
    petitioner: "अनिल कुमार",
    respondent: "प्रिया देशमुख",
    taluka: "Igatpuri",
    hearingDate: "2024-01-20",
    status: "Under Review",
    reminderDate: "2024-01-18",
    priority: "Low",
    filedDate: "2023-09-12",
    lastUpdate: "2024-01-05",
    assignedOfficer: "अधिकारी गुप्ता",
    documents: 3,
    nextAction: "Review documents",
    estimatedDays: 10,
  },
  {
    caseId: "पुनरावलोकन/78/2023",
    type: "Revision",
    petitioner: "गीता जोशी",
    respondent: "राज्य सरकार",
    taluka: "Trimbakeshwar",
    hearingDate: "2024-01-12",
    status: "Hearing Completed",
    reminderDate: "2024-01-10",
    priority: "High",
    filedDate: "2023-08-30",
    lastUpdate: "2024-01-12",
    assignedOfficer: "अधिकारी वर्मा",
    documents: 12,
    nextAction: "Await judgment",
    estimatedDays: 5,
  },
  {
    caseId: "अपिल/89/2023",
    type: "Appeal",
    petitioner: "विकास मेहता",
    respondent: "स्थानिक प्राधिकरण",
    taluka: "Igatpuri",
    hearingDate: "2024-01-14",
    status: "Notice Pending",
    reminderDate: "2024-01-12",
    priority: "High",
    filedDate: "2023-12-01",
    lastUpdate: "2024-01-09",
    assignedOfficer: "अधिकारी पटेल",
    documents: 7,
    nextAction: "Send notice",
    estimatedDays: 12,
  },
  {
    caseId: "अतिक्रमण/56/2023",
    type: "Encroachment",
    petitioner: "मीरा शाह",
    respondent: "पडोशी",
    taluka: "Trimbakeshwar",
    hearingDate: "2024-01-25",
    status: "Investigation Ongoing",
    reminderDate: "2024-01-23",
    priority: "Medium",
    filedDate: "2023-11-08",
    lastUpdate: "2024-01-11",
    assignedOfficer: "अधिकारी शर्मा",
    documents: 6,
    nextAction: "Complete investigation",
    estimatedDays: 18,
  },
  {
    caseId: "भाडेकरू/34/2023",
    type: "Tenancy Dispute",
    petitioner: "संजय गुप्ता",
    respondent: "रेखा नायर",
    taluka: "Igatpuri",
    hearingDate: "2024-01-18",
    status: "Mediation Scheduled",
    reminderDate: "2024-01-16",
    priority: "Medium",
    filedDate: "2023-10-15",
    lastUpdate: "2024-01-09",
    assignedOfficer: "अधिकारी गुप्ता",
    documents: 4,
    nextAction: "Prepare mediation",
    estimatedDays: 8,
  },
  {
    caseId: "पुनरावलोकन/91/2023",
    type: "Revision",
    petitioner: "अमित पटेल",
    respondent: "जिल्हा कलेक्टर",
    taluka: "Trimbakeshwar",
    hearingDate: "2024-01-22",
    status: "Documents Submitted",
    reminderDate: "2024-01-20",
    priority: "Low",
    filedDate: "2023-09-28",
    lastUpdate: "2024-01-08",
    assignedOfficer: "अधिकारी वर्मा",
    documents: 9,
    nextAction: "Review submission",
    estimatedDays: 14,
  },
]

const caseTypes = ["All Types", "Appeal", "Encroachment", "Tenancy Dispute", "Revision"]
const talukas = ["All Talukas", "Igatpuri", "Trimbakeshwar"]
const priorities = ["All Priorities", "High", "Medium", "Low"]
const statuses = [
  "All Statuses",
  "Notice Served",
  "Awaiting Response",
  "Under Review",
  "Hearing Completed",
  "Notice Pending",
  "Investigation Ongoing",
  "Mediation Scheduled",
  "Documents Submitted",
]

// Calendar component
function CalendarWidget({ cases }: { cases: typeof sampleCases }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Get events for the month
  const monthEvents = useMemo(() => {
    const events: { [key: string]: Array<{ type: "hearing" | "reminder"; case: (typeof sampleCases)[0] }> } = {}

    cases.forEach((case_) => {
      const hearingDate = new Date(case_.hearingDate)
      const reminderDate = new Date(case_.reminderDate)

      if (hearingDate.getMonth() === currentMonth && hearingDate.getFullYear() === currentYear) {
        const dateKey = hearingDate.getDate().toString()
        if (!events[dateKey]) events[dateKey] = []
        events[dateKey].push({ type: "hearing", case: case_ })
      }

      if (reminderDate.getMonth() === currentMonth && reminderDate.getFullYear() === currentYear) {
        const dateKey = reminderDate.getDate().toString()
        if (!events[dateKey]) events[dateKey] = []
        events[dateKey].push({ type: "reminder", case: case_ })
      }
    })

    return events
  }, [cases, currentMonth, currentYear])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="h-20 p-1"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dayEvents = monthEvents[day.toString()] || []
            const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString()

            return (
              <div
                key={day}
                className={`h-20 p-1 border border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  isToday ? "bg-blue-50 border-blue-200" : ""
                }`}
                onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
              >
                <div className={`text-sm font-medium ${isToday ? "text-blue-600" : "text-gray-900"}`}>{day}</div>
                <div className="space-y-1 mt-1">
                  {dayEvents.slice(0, 2).map((event, idx) => (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <div
                          className={`text-xs px-1 py-0.5 rounded truncate ${
                            event.type === "hearing" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {event.case.caseId.split("/")[0]}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div className="font-medium">{event.case.caseId}</div>
                          <div>{event.case.petitioner}</div>
                          <div className="text-xs text-gray-500">
                            {event.type === "hearing" ? "Hearing" : "Reminder"}: {event.case.nextAction}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span className="text-sm text-gray-600">Hearings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
            <span className="text-sm text-gray-600">Reminders</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProfessionalLegalDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedTaluka, setSelectedTaluka] = useState("All Talukas")
  const [selectedPriority, setSelectedPriority] = useState("All Priorities")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [darkMode, setDarkMode] = useState(false)
  const casesPerPage = 10

  // Get today's date for comparison
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Function to check if reminder is urgent (today or tomorrow)
  const isUrgentReminder = (reminderDate: string) => {
    const reminder = new Date(reminderDate)
    const todayStr = today.toISOString().split("T")[0]
    const tomorrowStr = tomorrow.toISOString().split("T")[0]
    return reminderDate === todayStr || reminderDate === tomorrowStr
  }

  // Enhanced filter and search logic
  const filteredCases = useMemo(() => {
    const filtered = sampleCases.filter((case_) => {
      const matchesSearch =
        case_.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.petitioner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.respondent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.assignedOfficer.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = selectedType === "All Types" || case_.type === selectedType
      const matchesTaluka = selectedTaluka === "All Talukas" || case_.taluka === selectedTaluka
      const matchesPriority = selectedPriority === "All Priorities" || case_.priority === selectedPriority
      const matchesStatus = selectedStatus === "All Statuses" || case_.status === selectedStatus

      return matchesSearch && matchesType && matchesTaluka && matchesPriority && matchesStatus
    })

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField as keyof typeof a]
        let bValue = b[sortField as keyof typeof b]

        if (sortField === "hearingDate" || sortField === "reminderDate") {
          aValue = new Date(aValue as string).getTime()
          bValue = new Date(bValue as string).getTime()
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [searchTerm, selectedType, selectedTaluka, selectedPriority, selectedStatus, sortField, sortDirection])

  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / casesPerPage)
  const startIndex = (currentPage - 1) * casesPerPage
  const paginatedCases = filteredCases.slice(startIndex, startIndex + casesPerPage)

  // Statistics calculations
  const stats = useMemo(() => {
    const total = filteredCases.length
    const urgent = filteredCases.filter((c) => isUrgentReminder(c.reminderDate)).length
    const highPriority = filteredCases.filter((c) => c.priority === "High").length
    const completed = filteredCases.filter((c) => c.status === "Hearing Completed").length
    const pending = total - completed
    const avgDays = filteredCases.reduce((sum, c) => sum + c.estimatedDays, 0) / total || 0

    return { total, urgent, highPriority, completed, pending, avgDays: Math.round(avgDays) }
  }, [filteredCases])

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle send reminder
  const handleSendReminder = (caseId: string) => {
    alert(`Reminder sent for case: ${caseId}`)
  }

  // Handle export
  const handleExport = (format: string) => {
    alert(`Exporting data as ${format}...`)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Get status badge variant and icon
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "hearing completed":
        return { variant: "default" as const, icon: CheckCircle2, color: "text-green-700" }
      case "notice served":
        return { variant: "secondary" as const, icon: FileCheck, color: "text-blue-700" }
      case "awaiting response":
        return { variant: "outline" as const, icon: Clock, color: "text-amber-700" }
      case "notice pending":
        return { variant: "destructive" as const, icon: AlertTriangle, color: "text-red-700" }
      case "under review":
        return { variant: "secondary" as const, icon: Eye, color: "text-purple-700" }
      case "mediation scheduled":
        return { variant: "outline" as const, icon: Users, color: "text-indigo-700" }
      case "documents submitted":
        return { variant: "secondary" as const, icon: FileText, color: "text-teal-700" }
      default:
        return { variant: "outline" as const, icon: Clock, color: "text-gray-700" }
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-700 bg-red-50 border-red-200"
      case "medium":
        return "text-amber-700 bg-amber-50 border-amber-200"
      case "low":
        return "text-green-700 bg-green-50 border-green-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-gray-50 ${darkMode ? "dark" : ""}`}>
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
          {/* Professional Header */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-white border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Scale className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">SDM Office</h1>
                    <p className="text-sm text-gray-600">Government of Maharashtra</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-gray-600" />
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <Moon className="h-4 w-4 text-gray-600" />
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-300">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Legal Case Monitoring Dashboard</h2>
                <p className="text-gray-600 mb-4">Sub-Divisional Magistrate Office, Nashik</p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Igatpuri & Trimbakeshwar Subdivisions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {today.toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Cases</div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-700">{stats.urgent}</div>
                    <div className="text-sm text-gray-600">Urgent</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-amber-700">{stats.highPriority}</div>
                    <div className="text-sm text-gray-600">High Priority</div>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-700">{stats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-indigo-700">{stats.avgDays}</div>
                    <div className="text-sm text-gray-600">Avg Days</div>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Filters and Table */}
            <div className="lg:col-span-3 space-y-6">
              {/* Filters and Search */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Search and Quick Actions */}
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            placeholder="Search by Case ID, Petitioner, Respondent, or Officer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-11 border-gray-300">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleExport("CSV")}>Export as CSV</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("PDF")}>Export as PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("Excel")}>Export as Excel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" className="h-11 border-gray-300">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>

                        <Button className="h-11 bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" />
                          New Case
                        </Button>
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="h-10 border-gray-300">
                          <Gavel className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Case Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {caseTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedTaluka} onValueChange={setSelectedTaluka}>
                        <SelectTrigger className="h-10 border-gray-300">
                          <MapPin className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Taluka" />
                        </SelectTrigger>
                        <SelectContent>
                          {talukas.map((taluka) => (
                            <SelectItem key={taluka} value={taluka}>
                              {taluka}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                        <SelectTrigger className="h-10 border-gray-300">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="h-10 border-gray-300">
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("")
                          setSelectedType("All Types")
                          setSelectedTaluka("All Talukas")
                          setSelectedPriority("All Priorities")
                          setSelectedStatus("All Statuses")
                        }}
                        className="h-10 border-gray-300"
                      >
                        Clear Filters
                      </Button>
                    </div>

                    {/* Results Summary */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600">
                          Showing {paginatedCases.length} of {filteredCases.length} cases
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress value={(stats.completed / stats.total) * 100} className="w-20" />
                          <span className="text-xs text-gray-500">
                            {Math.round((stats.completed / stats.total) * 100)}% Complete
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-amber-600" />
                          <span className="text-sm text-gray-600">{stats.urgent} urgent reminders</span>
                        </div>
                        <Badge variant="outline" className="text-xs border-gray-300">
                          Last updated: {new Date().toLocaleTimeString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cases Table */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="w-[120px] font-semibold text-gray-900">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("caseId")}
                              className="h-auto p-0 font-semibold text-gray-900"
                            >
                              Case ID
                              {sortField === "caseId" &&
                                (sortDirection === "asc" ? (
                                  <SortAsc className="ml-1 h-3 w-3" />
                                ) : (
                                  <SortDesc className="ml-1 h-3 w-3" />
                                ))}
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">Type</TableHead>
                          <TableHead className="font-semibold text-gray-900">Petitioner</TableHead>
                          <TableHead className="font-semibold text-gray-900">Respondent</TableHead>
                          <TableHead className="font-semibold text-gray-900">Taluka</TableHead>
                          <TableHead className="font-semibold text-gray-900">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("hearingDate")}
                              className="h-auto p-0 font-semibold text-gray-900"
                            >
                              Hearing Date
                              {sortField === "hearingDate" &&
                                (sortDirection === "asc" ? (
                                  <SortAsc className="ml-1 h-3 w-3" />
                                ) : (
                                  <SortDesc className="ml-1 h-3 w-3" />
                                ))}
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold text-gray-900">Status</TableHead>
                          <TableHead className="font-semibold text-gray-900">Priority</TableHead>
                          <TableHead className="font-semibold text-gray-900">Officer</TableHead>
                          <TableHead className="font-semibold text-gray-900">Reminder</TableHead>
                          <TableHead className="w-[120px] font-semibold text-gray-900">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCases.map((case_, index) => {
                          const isUrgent = isUrgentReminder(case_.reminderDate)
                          const statusInfo = getStatusInfo(case_.status)
                          const StatusIcon = statusInfo.icon

                          return (
                            <TableRow
                              key={case_.caseId}
                              className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                                isUrgent ? "bg-amber-50 border-l-4 border-l-amber-500" : ""
                              }`}
                            >
                              <TableCell className="font-medium text-sm">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-gray-900">{case_.caseId}</span>
                                  <span className="text-xs text-gray-500">Filed: {formatDate(case_.filedDate)}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs font-medium border-gray-300">
                                  {case_.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[150px]">
                                <div className="truncate font-medium text-gray-900">{case_.petitioner}</div>
                              </TableCell>
                              <TableCell className="max-w-[150px]">
                                <div className="truncate text-gray-700">{case_.respondent}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                  {case_.taluka}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{formatDate(case_.hearingDate)}</span>
                                  <span className="text-xs text-gray-500">in {case_.estimatedDays} days</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                                  <Badge variant={statusInfo.variant} className="text-xs">
                                    {case_.status}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={`text-xs border ${getPriorityColor(case_.priority)}`}>
                                  {case_.priority}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{case_.assignedOfficer}</span>
                                  <span className="text-xs text-gray-500">{case_.documents} docs</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">
                                      {formatDate(case_.reminderDate)}
                                    </span>
                                    <span className="text-xs text-gray-500">{case_.nextAction}</span>
                                  </div>
                                  {isUrgent && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <AlertCircle className="h-4 w-4 text-amber-600 animate-pulse" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Urgent reminder due!</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSendReminder(case_.caseId)}
                                        className="h-8 w-8 p-0 border-gray-300"
                                      >
                                        <Send className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Send Reminder</p>
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-gray-300">
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View Details</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <>
                      <Separator className="border-gray-200" />
                      <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                          </p>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="page-size" className="text-sm">
                              Show:
                            </Label>
                            <Select defaultValue="10">
                              <SelectTrigger className="w-20 h-8 border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="border-gray-300"
                          >
                            First
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="border-gray-300"
                          >
                            Previous
                          </Button>
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                            return (
                              <Button
                                key={page}
                                variant={page === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className={`w-8 h-8 p-0 ${
                                  page === currentPage ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300"
                                }`}
                              >
                                {page}
                              </Button>
                            )
                          })}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="border-gray-300"
                          >
                            Next
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="border-gray-300"
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Calendar and Quick Actions */}
            <div className="space-y-6">
              {/* Calendar Widget */}
              <CalendarWidget cases={filteredCases} />

              {/* Quick Actions Panel */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <CalendarDays className="h-5 w-5" />
                    Today's Priority
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredCases
                      .filter((c) => isUrgentReminder(c.reminderDate))
                      .slice(0, 4)
                      .map((case_) => (
                        <div
                          key={case_.caseId}
                          className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{case_.caseId}</div>
                            <div className="text-xs text-gray-600">{case_.nextAction}</div>
                            <div className="text-xs text-amber-700 font-medium">
                              Due: {formatDate(case_.reminderDate)}
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="border-amber-300 text-amber-700">
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    {filteredCases.filter((c) => isUrgentReminder(c.reminderDate)).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No urgent reminders today</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Case Distribution */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <BarChart3 className="h-5 w-5" />
                    Case Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Igatpuri</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {filteredCases.filter((c) => c.taluka === "Igatpuri").length}
                        </span>
                      </div>
                      <Progress
                        value={
                          (filteredCases.filter((c) => c.taluka === "Igatpuri").length / filteredCases.length) * 100
                        }
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Trimbakeshwar</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {filteredCases.filter((c) => c.taluka === "Trimbakeshwar").length}
                        </span>
                      </div>
                      <Progress
                        value={
                          (filteredCases.filter((c) => c.taluka === "Trimbakeshwar").length / filteredCases.length) *
                          100
                        }
                        className="h-2"
                      />
                    </div>

                    <Separator className="border-gray-200" />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">By Priority</h4>
                      {["High", "Medium", "Low"].map((priority) => (
                        <div key={priority} className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">{priority}</span>
                          <Badge className={`text-xs ${getPriorityColor(priority)}`} variant="outline">
                            {filteredCases.filter((c) => c.priority === priority).length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
