"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Calendar,
  Send,
  Download,
  FileText,
  Clock,
  Users,
  Plus,
  Eye,
  Bell,
  MapPin,
  Scale,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider } from "@/components/ui/tooltip"

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

// Simplified Calendar component
function CalendarWidget({ cases }: { cases: typeof sampleCases }) {
  const [currentDate, setCurrentDate] = useState(new Date())

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

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="h-7 w-7 p-0">
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="h-7 w-7 p-0">
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="h-8"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dayEvents = monthEvents[day.toString()] || []
            const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString()
            const hasEvents = dayEvents.length > 0

            return (
              <div
                key={day}
                className={`h-8 flex items-center justify-center text-xs cursor-pointer hover:bg-gray-50 rounded ${
                  isToday ? "bg-blue-100 text-blue-700 font-semibold" : hasEvents ? "bg-amber-50 text-amber-700" : ""
                }`}
              >
                {day}
              </div>
            )
          })}
        </div>

        {/* Simplified Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-100 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-100 rounded"></div>
            <span>Events</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CleanLegalDashboard() {
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

    return { total, urgent, highPriority, completed }
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
        return "text-red-700 bg-red-50"
      case "medium":
        return "text-amber-700 bg-amber-50"
      case "low":
        return "text-green-700 bg-green-50"
      default:
        return "text-gray-700 bg-gray-50"
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl space-y-8 p-6">
          {/* Clean Header */}
          <div className="text-center space-y-4 pb-8 border-b">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Legal Case Monitoring Dashboard</h1>
                <p className="text-gray-600">Sub-Divisional Magistrate Office, Nashik</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Igatpuri & Trimbakeshwar</span>
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

          {/* Simplified Statistics */}
          <div className="grid grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Cases</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">{stats.urgent}</div>
                <div className="text-sm text-gray-600">Urgent Reminders</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">{stats.highPriority}</div>
                <div className="text-sm text-gray-600">High Priority</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Cases */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search and Filters */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6 space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search cases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base border-gray-200 focus:border-blue-500"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-5 gap-4">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Type" />
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
                      <SelectTrigger className="h-10">
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
                      <SelectTrigger className="h-10">
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
                      <SelectTrigger className="h-10">
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
                      className="h-10"
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Results Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      Showing {paginatedCases.length} of {filteredCases.length} cases
                    </span>
                    <div className="flex gap-4">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Case
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cases Table */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b">
                          <TableHead className="font-semibold">Case ID</TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">Petitioner</TableHead>
                          <TableHead className="font-semibold">Hearing Date</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Priority</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCases.map((case_) => {
                          const isUrgent = isUrgentReminder(case_.reminderDate)
                          const statusInfo = getStatusInfo(case_.status)
                          const StatusIcon = statusInfo.icon

                          return (
                            <TableRow
                              key={case_.caseId}
                              className={`hover:bg-gray-50 ${isUrgent ? "bg-amber-50 border-l-4 border-l-amber-500" : ""}`}
                            >
                              <TableCell className="font-medium">
                                <div>
                                  <div className="font-semibold">{case_.caseId}</div>
                                  <div className="text-xs text-gray-500">{case_.taluka}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {case_.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{case_.petitioner}</div>
                                  <div className="text-xs text-gray-500">vs {case_.respondent}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{formatDate(case_.hearingDate)}</div>
                                  <div className="text-xs text-gray-500">{case_.assignedOfficer}</div>
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
                                <Badge className={`text-xs ${getPriorityColor(case_.priority)}`}>
                                  {case_.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSendReminder(case_.caseId)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Send className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                    <Eye className="h-3 w-3" />
                                  </Button>
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
                    <div className="flex items-center justify-between p-6 border-t">
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Calendar */}
              <CalendarWidget cases={filteredCases} />

              {/* Urgent Cases */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Urgent Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {filteredCases
                      .filter((c) => isUrgentReminder(c.reminderDate))
                      .slice(0, 3)
                      .map((case_) => (
                        <div key={case_.caseId} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="font-medium text-sm">{case_.caseId}</div>
                          <div className="text-xs text-gray-600 mt-1">{case_.nextAction}</div>
                        </div>
                      ))}
                    {filteredCases.filter((c) => isUrgentReminder(c.reminderDate)).length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No urgent items</p>
                      </div>
                    )}
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
