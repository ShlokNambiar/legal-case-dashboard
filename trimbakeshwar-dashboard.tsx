"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Calendar,
  Send,
  Download,
  Clock,
  Bell,
  MapPin,
  Scale,
  FileCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  RefreshCw,
  Filter,
  ArrowLeft,
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
    const events: { [key: string]: Array<{ type: "case"; case: any }> } = {}

    cases.forEach((case_) => {
      const caseDate = new Date(case_.date)

      if (caseDate.getMonth() === currentMonth && caseDate.getFullYear() === currentYear) {
        const dateKey = caseDate.getDate().toString()
        if (!events[dateKey]) events[dateKey] = []
        events[dateKey].push({ type: "case", case: case_ })
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
    <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-indigo-900">
            {monthNames[currentMonth]} {currentYear}
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              className="h-7 w-7 p-0 hover:bg-indigo-100"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="h-7 w-7 p-0 hover:bg-indigo-100"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-indigo-600 py-1">
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
            const hasEvents = dayEvents.length > 0

            return (
              <Tooltip key={day}>
                <TooltipTrigger asChild>
                  <div
                    className={`h-8 flex items-center justify-center text-xs cursor-pointer hover:bg-indigo-100 rounded relative ${
                      isToday
                        ? "bg-indigo-200 text-indigo-800 font-semibold"
                        : hasEvents
                          ? "bg-indigo-100 text-indigo-700"
                          : ""
                    }`}
                  >
                    {day}
                    {hasEvents && <div className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-current"></div>}
                  </div>
                </TooltipTrigger>
                {dayEvents.length > 0 && (
                  <TooltipContent>
                    <div className="text-sm space-y-1">
                      {dayEvents.map((event, idx) => (
                        <div key={idx}>
                          <div className="font-medium">Case #{event.case.caseNumber}</div>
                          <div className="text-xs">
                            {event.case.caseType} - {event.case.status}
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

        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-indigo-100 text-xs text-indigo-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-indigo-200 rounded"></div>
            <span>Case Dates</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TrimbakeshwarDashboard() {
  const { cases, loading, error, lastUpdated, updateCasesFromCsv, refreshCases } = useCases()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [casesPerPage, setCasesPerPage] = useState(10)

  // Filter cases for Trimbakeshwar only
  const trimbakeshwarCases = useMemo(() => {
    return cases.filter((case_) => case_.taluka === "Trimbakeshwar")
  }, [cases])

  // Get unique values for filters
  const caseTypes = useMemo(() => {
    const types = ["All Types", ...new Set(trimbakeshwarCases.map((c) => c.caseType).filter(Boolean))]
    return types
  }, [trimbakeshwarCases])

  const statuses = useMemo(() => {
    const statusList = ["All Statuses", ...new Set(trimbakeshwarCases.map((c) => c.status).filter(Boolean))]
    return statusList
  }, [trimbakeshwarCases])

  // Get today's date for comparison
  const today = new Date()

  // Enhanced filter and search logic
  const filteredCases = useMemo(() => {
    const filtered = trimbakeshwarCases.filter((case_) => {
      const matchesSearch =
        case_.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.appellant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.respondent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.caseType?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = selectedType === "All Types" || case_.caseType === selectedType
      const matchesStatus = selectedStatus === "All Statuses" || case_.status === selectedStatus

      return matchesSearch && matchesType && matchesStatus
    })

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField as keyof typeof a]
        let bValue = b[sortField as keyof typeof b]

        if (sortField === "date") {
          aValue = new Date(aValue as string).getTime()
          bValue = new Date(bValue as string).getTime()
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [trimbakeshwarCases, searchTerm, selectedType, selectedStatus, sortField, sortDirection])

  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / casesPerPage)
  const startIndex = (currentPage - 1) * casesPerPage
  const paginatedCases = filteredCases.slice(startIndex, startIndex + casesPerPage)

  // Statistics calculations
  const stats = useMemo(() => {
    const total = filteredCases.length
    const received = filteredCases.filter((c) => c.status?.toLowerCase().includes("received")).length
    const underReview = filteredCases.filter((c) => c.status?.toLowerCase().includes("review")).length
    const completed = filteredCases.filter((c) => c.status?.toLowerCase().includes("completed")).length

    return { total, received, underReview, completed }
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

  // Handle export
  const handleExport = (format: string) => {
    const dataToExport = filteredCases.map((case_) => ({
      Date: case_.date,
      "Case Type": case_.caseType,
      "Case Number": case_.caseNumber,
      Year: case_.year,
      Appellant: case_.appellant,
      Respondent: case_.respondent,
      Status: case_.status,
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
      a.download = `trimbakeshwar-cases-${new Date().toISOString().split("T")[0]}.csv`
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
    } else if (statusLower.includes("received")) {
      return { variant: "secondary" as const, icon: FileCheck, color: "text-indigo-700" }
    } else if (statusLower.includes("scheduled")) {
      return { variant: "outline" as const, icon: Calendar, color: "text-blue-700" }
    } else if (statusLower.includes("review")) {
      return { variant: "secondary" as const, icon: Clock, color: "text-cyan-700" }
    } else if (statusLower.includes("issued")) {
      return { variant: "outline" as const, icon: Send, color: "text-purple-700" }
    } else {
      return { variant: "outline" as const, icon: Clock, color: "text-gray-700" }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/20 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-indigo-700">Loading cases...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/20 to-blue-50/20">
        <div className="mx-auto max-w-7xl space-y-4 p-4">
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border-indigo-100">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-indigo-900">Trimbakeshwar Legal Case Dashboard</h1>
                  <p className="text-sm text-indigo-700">Sub-Divisional Magistrate Office, Nashik</p>
                </div>
              </div>
              <div className="w-24"></div> {/* Spacer for centering */}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-indigo-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Trimbakeshwar Subdivision</span>
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
            <Card className="border border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50/50 to-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">{stats.total}</div>
                <div className="text-xs text-indigo-700">Total Cases</div>
              </CardContent>
            </Card>

            <Card className="border border-green-100 shadow-sm bg-gradient-to-br from-green-50/50 to-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{stats.received}</div>
                <div className="text-xs text-green-700">Received</div>
              </CardContent>
            </Card>

            <Card className="border border-cyan-100 shadow-sm bg-gradient-to-br from-cyan-50/50 to-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-cyan-600 mb-1">{stats.underReview}</div>
                <div className="text-xs text-cyan-700">Under Review</div>
              </CardContent>
            </Card>

            <Card className="border border-purple-100 shadow-sm bg-gradient-to-br from-purple-50/50 to-white">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{stats.completed}</div>
                <div className="text-xs text-purple-700">Completed</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left Column - Cases */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search and Filters */}
              <Card className="border border-indigo-100 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
                    <Input
                      placeholder="Search by case number, appellant, respondent, or type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 border-indigo-200 focus:border-indigo-500 bg-white/50"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-5 gap-3">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="h-9 text-sm border-indigo-200 bg-white/50">
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

                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="h-9 text-sm border-indigo-200 bg-white/50">
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
                      onClick={handleClearFilters}
                      className="h-9 text-sm bg-white/50 border-indigo-200 hover:bg-indigo-50"
                    >
                      <Filter className="h-3 w-3 mr-1" />
                      Clear
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-9 text-sm bg-white/50 border-indigo-200 hover:bg-indigo-50"
                        >
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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshCases}
                      className="h-9 text-sm bg-white/50 border-indigo-200 hover:bg-indigo-50"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  </div>

                  {/* Results Info */}
                  <div className="flex items-center justify-between text-sm text-indigo-700">
                    <span>
                      Showing {paginatedCases.length} of {filteredCases.length} cases
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Cases Table */}
              <Card className="border border-indigo-100 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-indigo-100">
                          <TableHead className="font-semibold text-indigo-900">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("date")}
                              className="h-auto p-0 font-semibold hover:bg-indigo-50"
                            >
                              Date
                              {sortField === "date" &&
                                (sortDirection === "asc" ? (
                                  <SortAsc className="ml-1 h-3 w-3" />
                                ) : (
                                  <SortDesc className="ml-1 h-3 w-3" />
                                ))}
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold text-indigo-900">Case Type</TableHead>
                          <TableHead className="font-semibold text-indigo-900">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort("caseNumber")}
                              className="h-auto p-0 font-semibold hover:bg-indigo-50"
                            >
                              Case Number
                              {sortField === "caseNumber" &&
                                (sortDirection === "asc" ? (
                                  <SortAsc className="ml-1 h-3 w-3" />
                                ) : (
                                  <SortDesc className="ml-1 h-3 w-3" />
                                ))}
                            </Button>
                          </TableHead>
                          <TableHead className="font-semibold text-indigo-900">Year</TableHead>
                          <TableHead className="font-semibold text-indigo-900">Appellant</TableHead>
                          <TableHead className="font-semibold text-indigo-900">Respondent</TableHead>
                          <TableHead className="font-semibold text-indigo-900">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCases.map((case_, index) => {
                          const statusInfo = getStatusInfo(case_.status)
                          const StatusIcon = statusInfo.icon

                          return (
                            <TableRow key={`${case_.caseNumber}-${index}`} className="hover:bg-indigo-50/50">
                              <TableCell className="font-medium">
                                <div className="font-semibold text-sm">{formatDate(case_.date)}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-700">
                                  {case_.caseType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="font-semibold text-sm">{case_.caseNumber}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{case_.year}</div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium text-sm">{case_.appellant}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{case_.respondent}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
                                  <Badge variant={statusInfo.variant} className="text-xs">
                                    {case_.status}
                                  </Badge>
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
                    <div className="flex items-center justify-between p-4 border-t border-indigo-100">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-indigo-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Select
                          value={casesPerPage.toString()}
                          onValueChange={(value) => {
                            setCasesPerPage(Number(value))
                            setCurrentPage(1)
                          }}
                        >
                          <SelectTrigger className="w-20 h-8 border-indigo-200">
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
                          className="border-indigo-200 hover:bg-indigo-50"
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
                              className={`w-8 h-8 p-0 ${page === currentPage ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-200 hover:bg-indigo-50"}`}
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
                          className="border-indigo-200 hover:bg-indigo-50"
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

              {/* Recent Cases */}
              <Card className="border border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50/30 to-blue-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-900">
                    <Bell className="h-4 w-4" />
                    Recent Cases
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {filteredCases.slice(0, 3).map((case_) => (
                      <div key={case_.caseNumber} className="p-2 bg-indigo-100/50 rounded border border-indigo-200">
                        <div className="font-medium text-xs text-indigo-900">Case #{case_.caseNumber}</div>
                        <div className="text-xs text-indigo-700 mt-1">
                          {case_.caseType} - {case_.status}
                        </div>
                      </div>
                    ))}
                    {filteredCases.length === 0 && (
                      <div className="text-center py-3 text-indigo-600">
                        <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
                        <p className="text-xs">No cases found</p>
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
