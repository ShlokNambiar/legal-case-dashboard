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
]

export default function EnhancedLegalDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedTaluka, setSelectedTaluka] = useState("All Talukas")
  const [selectedPriority, setSelectedPriority] = useState("All Priorities")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
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
        return { variant: "default" as const, icon: CheckCircle2, color: "text-green-600" }
      case "notice served":
        return { variant: "secondary" as const, icon: FileCheck, color: "text-blue-600" }
      case "awaiting response":
        return { variant: "outline" as const, icon: Clock, color: "text-yellow-600" }
      case "notice pending":
        return { variant: "destructive" as const, icon: AlertTriangle, color: "text-red-600" }
      case "under review":
        return { variant: "secondary" as const, icon: Eye, color: "text-purple-600" }
      default:
        return { variant: "outline" as const, icon: Clock, color: "text-gray-600" }
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-yellow-600 bg-yellow-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <TooltipProvider>
      <div
        className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-purple-50"}`}
      >
        <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
          {/* Enhanced Header */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Scale className="h-8 w-8" />
                  <span className="text-lg font-semibold">SDM Office</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <Switch
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                      className="data-[state=checked]:bg-purple-400"
                    />
                    <Moon className="h-4 w-4" />
                  </div>
                  <Button variant="secondary" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>

              <CardTitle className="text-3xl md:text-4xl font-bold mb-2">Legal Case Monitoring Dashboard</CardTitle>
              <p className="text-blue-100 text-lg mb-4">Sub-Divisional Magistrate Office, Nashik</p>
              <div className="flex items-center justify-center gap-6 text-sm">
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
            </CardHeader>
          </Card>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Cases</div>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                    <div className="text-sm text-gray-600">Urgent</div>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{stats.highPriority}</div>
                    <div className="text-sm text-gray-600">High Priority</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <Clock className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">{stats.avgDays}</div>
                    <div className="text-sm text-gray-600">Avg Days</div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Filters and Search */}
          <Card className="border-0 shadow-lg">
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
                        className="pl-12 h-12 text-lg border-2 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-12">
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

                    <Button variant="outline" className="h-12">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>

                    <Button className="h-12 bg-gradient-to-r from-blue-600 to-purple-600">
                      <Plus className="h-4 w-4 mr-2" />
                      New Case
                    </Button>
                  </div>
                </div>

                {/* Enhanced Filters */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="h-10">
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
                    <SelectTrigger className="h-10">
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
                    <SelectTrigger className="h-10">
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
                    <SelectTrigger className="h-10">
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
                    className="h-10"
                  >
                    Clear Filters
                  </Button>
                </div>

                {/* Results Summary with Progress */}
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
                      <Bell className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">{stats.urgent} urgent reminders</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Last updated: {new Date().toLocaleTimeString()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Cases Table */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[120px] font-semibold">
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
                      <TableHead className="font-semibold">Respondent</TableHead>
                      <TableHead className="font-semibold">Taluka</TableHead>
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
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Officer</TableHead>
                      <TableHead className="font-semibold">Reminder</TableHead>
                      <TableHead className="w-[120px] font-semibold">Actions</TableHead>
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
                          className={`hover:bg-gray-50 transition-colors ${
                            isUrgent ? "bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-400" : ""
                          }`}
                        >
                          <TableCell className="font-medium text-sm">
                            <div className="flex flex-col">
                              <span className="font-semibold">{case_.caseId}</span>
                              <span className="text-xs text-gray-500">Filed: {formatDate(case_.filedDate)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-medium">
                              {case_.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="truncate font-medium">{case_.petitioner}</div>
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <div className="truncate">{case_.respondent}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {case_.taluka}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium">{formatDate(case_.hearingDate)}</span>
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
                            <Badge className={`text-xs ${getPriorityColor(case_.priority)}`}>{case_.priority}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium">{case_.assignedOfficer}</span>
                              <span className="text-xs text-gray-500">{case_.documents} docs</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{formatDate(case_.reminderDate)}</span>
                                <span className="text-xs text-gray-500">{case_.nextAction}</span>
                              </div>
                              {isUrgent && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <AlertCircle className="h-4 w-4 text-orange-500 animate-pulse" />
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
                                    className="h-8 w-8 p-0"
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
                                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
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

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <>
                  <Separator />
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
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        First
                      </Button>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        Last
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quick Actions & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Today's Priority</h4>
                  <div className="space-y-2">
                    {filteredCases
                      .filter((c) => isUrgentReminder(c.reminderDate))
                      .slice(0, 3)
                      .map((case_) => (
                        <div
                          key={case_.caseId}
                          className="flex items-center justify-between p-2 bg-orange-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-sm">{case_.caseId}</div>
                            <div className="text-xs text-gray-600">{case_.nextAction}</div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Case Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Igatpuri</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (filteredCases.filter((c) => c.taluka === "Igatpuri").length / filteredCases.length) * 100
                          }
                          className="w-16"
                        />
                        <span className="text-xs">{filteredCases.filter((c) => c.taluka === "Igatpuri").length}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trimbakeshwar</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (filteredCases.filter((c) => c.taluka === "Trimbakeshwar").length / filteredCases.length) *
                            100
                          }
                          className="w-16"
                        />
                        <span className="text-xs">
                          {filteredCases.filter((c) => c.taluka === "Trimbakeshwar").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Recent Updates</h4>
                  <div className="space-y-2">
                    {filteredCases
                      .sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime())
                      .slice(0, 3)
                      .map((case_) => (
                        <div key={case_.caseId} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{case_.caseId}</div>
                            <div className="text-xs text-gray-600">{formatDate(case_.lastUpdate)}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {case_.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
