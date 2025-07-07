"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Calendar,
  Send,
  Download,
  Clock,
  Eye,
  Bell,
  MapPin,
  Scale,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  RefreshCw,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCases } from "@/hooks/use-cases"

// Calendar component
function CalendarWidget({ cases }: { cases: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const monthEvents = useMemo(() => {
    const events: { [key: string]: Array<{ type: "hearing" | "reminder"; case: any }> } = {}

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
    <Card className="border border-gray-200">
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
          {Array.from({ length: startingDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="h-8"></div>
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const dayEvents = monthEvents[day.toString()] || []
            const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString()
            const hasHearing = dayEvents.some((e) => e.type === "hearing")
            const hasReminder = dayEvents.some((e) => e.type === "reminder")

            return (
              <Tooltip key={day}>
                <TooltipTrigger asChild>
                  <div
                    className={`h-8 flex items-center justify-center text-xs cursor-pointer hover:bg-gray-50 rounded relative ${
                      isToday
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : hasHearing
                          ? "bg-blue-50 text-blue-700"
                          : hasReminder
                            ? "bg-amber-50 text-amber-700"
                            : ""
                    }`}
                  >
                    {day}
                    {(hasHearing || hasReminder) && (
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-current"></div>
                    )}
                  </div>
                </TooltipTrigger>
                {dayEvents.length > 0 && (
                  <TooltipContent>
                    <div className="text-sm space-y-1">
                      {dayEvents.map((event, idx) => (
                        <div key={idx}>
                          <div className="font-medium">{event.case.caseId}</div>
                          <div className="text-xs">
                            {event.type === "hearing" ? "Hearing" : "Reminder"}: {event.case.nextAction}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-100 rounded"></div>
            <span>Hearings</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-100 rounded"></div>
            <span>Reminders</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RealDataDashboard() {
  const { cases, loading, error, lastUpdated, updateCasesFromCsv, refreshCases } = useCases()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedTaluka, setSelectedTaluka] = useState("All Talukas")
  const [selectedPriority, setSelectedPriority] = useState("All Priorities")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [casesPerPage, setCasesPerPage] = useState(10)

  // Get unique values for filters
  const caseTypes = useMemo(() => {
    const types = ["All Types", ...new Set(cases.map((c) => c.type).filter(Boolean))]
    return types
  }, [cases])

  const talukas = useMemo(() => {
    const talukaList = ["All Talukas", ...new Set(cases.map((c) => c.taluka).filter(Boolean))]
    return talukaList
  }, [cases])

  const priorities = ["All Priorities", "High", "Medium", "Low"]

  const statuses = useMemo(() => {
    const statusList = ["All Statuses", ...new Set(cases.map((c) => c.status).filter(Boolean))]
    return statusList
  }, [cases])

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
    const filtered = cases.filter((case_) => {
      const matchesSearch =
        case_.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.petitioner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.respondent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.assignedOfficer?.toLowerCase().includes(searchTerm.toLowerCase())

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
  }, [cases, searchTerm, selectedType, selectedTaluka, selectedPriority, selectedStatus, sortField, sortDirection])

  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / casesPerPage)
  const startIndex = (currentPage - 1) * casesPerPage
  const paginatedCases = filteredCases.slice(startIndex, startIndex + casesPerPage)

  // Statistics calculations
  const stats = useMemo(() => {
    const total = filteredCases.length
    const urgent = filteredCases.filter((c) => isUrgentReminder(c.reminderDate)).length
    const highPriority = filteredCases.filter((c) => c.priority === "High").length
    const completed = filteredCases.filter((c) => c.status?.toLowerCase().includes("completed")).length

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
    setCurrentPage(1)
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
    const dataToExport = filteredCases.map((case_) => ({
      "Case ID": case_.caseId,
      Type: case_.type,
      Petitioner: case_.petitioner,
      Respondent: case_.respondent,
      Taluka: case_.taluka,
      "Hearing Date": case_.hearingDate,
      Status: case_.status,
      Priority: case_.priority,
      "Assigned Officer": case_.assignedOfficer,
      "Next Action": case_.nextAction,
    }))

    if (format === "CSV") {
      const csvContent = [
        Object.keys(dataToExport[0]).join(","),
        ...dataToExport.map((row) => Object.values(row).join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `legal-cases-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } else {
      alert(`${format} export functionality would be implemented here`)
    }
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedType("All Types")
    setSelectedTaluka("All Talukas")
    setSelectedPriority("All Priorities")
    setSelectedStatus("All Statuses")
    setCurrentPage(1)
    setSortField(null)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Get status badge variant and icon
  const getStatusInfo = (status: string) => {
    const statusLower = status?.toLowerCase() || ""

    if (statusLower.includes("completed")) {
      return { variant: "default" as const, icon: CheckCircle2, color: "text-green-700" }
    } else if (statusLower.includes("served") || statusLower.includes("notice")) {
      return { variant: "secondary" as const, icon: FileCheck, color: "text-blue-700" }
    } else if (statusLower.includes("pending")) {
      return { variant: "destructive" as const, icon: AlertTriangle, color: "text-red-700" }
    } else if (statusLower.includes("review")) {
      return { variant: "secondary" as const, icon: Eye, color: "text-purple-700" }
    } else {
      return { variant: "outline" as const, icon: Clock, color: "text-gray-700" }
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading cases...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl space-y-4 p-4">
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Legal Case Monitoring Dashboard</h1>
                <p className="text-sm text-gray-600">Sub-Divisional Magistrate Office, Nashik</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Igatpuri & Trimbakeshwar</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
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

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
                <div className="text-xs text-gray-600">Total Cases</div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">{stats.urgent}</div>
                <div className="text-xs text-gray-600">Urgent Reminders</div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-600 mb-1">{stats.highPriority}</div>
                <div className="text-xs text-gray-600">High Priority</div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left Column - Cases */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search and Filters */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-4 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search cases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 border-gray-200 focus:border-blue-500"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-6 gap-3">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="h-9 text-sm">
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
                      <SelectTrigger className="h-9 text-sm">
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
                      <SelectTrigger className="h-9 text-sm">
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
                      <SelectTrigger className="h-9 text-sm">
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

                    <Button variant="outline" onClick={handleClearFilters} className="h-9 text-sm">
                      <Filter className="h-3 w-3 mr-1" />
                      Clear
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-9 text-sm">
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleExport("CSV")}>Export as CSV</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("PDF")}>Export as PDF</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("Excel")}>Export as Excel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Results Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      Showing {paginatedCases.length} of {filteredCases.length} cases
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={refreshCases}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
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
                        <TableRow className="border-b">
                          <TableHead className="font-semibold">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("caseId")}
                              className="h-auto p-0 font-semibold"
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
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">Petitioner</TableHead>
                          <TableHead className="font-semibold">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("hearingDate")}
                              className="h-auto p-0 font-semibold"
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
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("priority")}
                              className="h-auto p-0 font-semibold"
                            >
                              Priority
                              {sortField === "priority" &&
                                (sortDirection === "asc" ? (
                                  <SortAsc className="ml-1 h-3 w-3" />
                                ) : (
                                  <SortDesc className="ml-1 h-3 w-3" />
                                ))}
                            </Button>
                          </TableHead>
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
                                  <div className="font-semibold text-sm">{case_.caseId}</div>
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
                                  <div className="font-medium text-sm">{case_.petitioner}</div>
                                  <div className="text-xs text-gray-500">vs {case_.respondent}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-sm">{formatDate(case_.hearingDate)}</div>
                                  <div className="text-xs text-gray-500">{case_.assignedOfficer}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
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
                                <div className="flex gap-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSendReminder(case_.caseId)}
                                        className="h-7 w-7 p-0"
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
                                      <Button size="sm" variant="outline" className="h-7 w-7 p-0">
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
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Select
                          value={casesPerPage.toString()}
                          onValueChange={(value) => {
                            setCasesPerPage(Number(value))
                            setCurrentPage(1)
                          }}
                        >
                          <SelectTrigger className="w-20 h-8">
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
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
                              className="w-8 h-8 p-0"
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
            <div className="space-y-4">
              {/* Calendar */}
              <CalendarWidget cases={filteredCases} />

              {/* Urgent Cases */}
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Urgent Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {filteredCases
                      .filter((c) => isUrgentReminder(c.reminderDate))
                      .slice(0, 3)
                      .map((case_) => (
                        <div key={case_.caseId} className="p-2 bg-amber-50 rounded border border-amber-200">
                          <div className="font-medium text-xs">{case_.caseId}</div>
                          <div className="text-xs text-gray-600 mt-1">{case_.nextAction}</div>
                        </div>
                      ))}
                    {filteredCases.filter((c) => isUrgentReminder(c.reminderDate)).length === 0 && (
                      <div className="text-center py-3 text-gray-500">
                        <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
                        <p className="text-xs">No urgent items</p>
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
