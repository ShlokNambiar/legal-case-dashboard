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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { updateCaseField } from "@/lib/api"
import { useCases } from "@/hooks/use-cases"



export default function TrimbakeshwarDashboard() {
  const { cases, loading, error, lastUpdated, updateCasesFromCsv, refreshCases, addCase } = useCases()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedStatus, setSelectedStatus] = useState("All Statuses")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [casesPerPage, setCasesPerPage] = useState(10)
  const [editableStatuses, setEditableStatuses] = useState<{[key: string]: string}>({})
  const [receivedStatuses, setReceivedStatuses] = useState<{[key: string]: string}>({})
  const [nextDates, setNextDates] = useState<{[key: string]: string}>({})
  const [statusDialogOpen, setStatusDialogOpen] = useState<{[key: string]: boolean}>({})
  const [tempStatusValue, setTempStatusValue] = useState("")
  const [currentEditingCase, setCurrentEditingCase] = useState<string | null>(null)
  const [addCaseDialogOpen, setAddCaseDialogOpen] = useState(false)
  const [newCase, setNewCase] = useState({
    caseNumber: "",
    appellant: "",
    respondent: "",
    caseType: "अपील"
  })

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
    const receivedValues = trimbakeshwarCases.map((c) => receivedStatuses[c.caseNumber] || c.received).filter(Boolean)
    const statusList = ["All Statuses", ...new Set(receivedValues)]
    return statusList
  }, [trimbakeshwarCases, receivedStatuses])



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
      const matchesStatus = selectedStatus === "All Statuses" ||
        (receivedStatuses[case_.caseNumber] || case_.received) === selectedStatus

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

    // Find the most common next date (or earliest upcoming date)
    const nextDateCounts = new Map<string, number>()
    filteredCases.forEach((c) => {
      const nextDate = nextDates[c.caseNumber] || c.nextDate || ""
      if (nextDate.trim() !== "") {
        nextDateCounts.set(nextDate, (nextDateCounts.get(nextDate) || 0) + 1)
      }
    })

    // Get the most common next date, or default to "17-07-2025"
    let mostCommonNextDate = "17-07-2025"
    let maxCount = 0
    for (const [date, count] of nextDateCounts.entries()) {
      if (count > maxCount) {
        maxCount = count
        mostCommonNextDate = date
      }
    }

    return {
      total,
      nextDate: mostCommonNextDate
    }
  }, [filteredCases, nextDates])

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

  // Handle status update
  const handleStatusUpdate = async (caseNumber: string, newStatus: string) => {
    // Update local state immediately for responsive UI
    setEditableStatuses(prev => ({
      ...prev,
      [caseNumber]: newStatus
    }))

    // Persist to database
    try {
      const result = await updateCaseField(caseNumber, 'status', newStatus)
      if (!result.success) {
        console.error('Failed to update status:', result.error)
        // Optionally show a toast notification here
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Handle received status update
  const handleReceivedUpdate = async (caseNumber: string, newReceived: string) => {
    // Update local state immediately for responsive UI
    setReceivedStatuses(prev => ({
      ...prev,
      [caseNumber]: newReceived
    }))

    // Persist to database
    try {
      const result = await updateCaseField(caseNumber, 'received', newReceived)
      if (!result.success) {
        console.error('Failed to update received status:', result.error)
        // Optionally show a toast notification here
      }
    } catch (error) {
      console.error('Error updating received status:', error)
    }
  }

  // Handle next date update
  const handleNextDateUpdate = async (caseNumber: string, newDate: string) => {
    // Update local state immediately for responsive UI
    setNextDates(prev => ({
      ...prev,
      [caseNumber]: newDate
    }))

    // Persist to database
    try {
      const result = await updateCaseField(caseNumber, 'next_date', newDate)
      if (!result.success) {
        console.error('Failed to update next date:', result.error)
        // Optionally show a toast notification here
      }
    } catch (error) {
      console.error('Error updating next date:', error)
    }
  }

  // Handle status dialog
  const openStatusDialog = (caseNumber: string, currentStatus: string) => {
    setCurrentEditingCase(caseNumber)
    setTempStatusValue(editableStatuses[caseNumber] || currentStatus || "")
    setStatusDialogOpen(prev => ({ ...prev, [caseNumber]: true }))
  }

  const closeStatusDialog = (caseNumber: string) => {
    setStatusDialogOpen(prev => ({ ...prev, [caseNumber]: false }))
    setCurrentEditingCase(null)
    setTempStatusValue("")
  }

  const saveStatusDialog = (caseNumber: string) => {
    handleStatusUpdate(caseNumber, tempStatusValue)
    closeStatusDialog(caseNumber)
  }

  // Handle add new case
  const handleAddNewCase = () => {
    if (!newCase.caseNumber || !newCase.appellant || !newCase.respondent) {
      alert("Please fill in all required fields")
      return
    }

    const caseData = {
      date: new Date().toISOString().split("T")[0],
      caseType: newCase.caseType,
      caseNumber: newCase.caseNumber,
      appellant: newCase.appellant,
      respondent: newCase.respondent,
      received: "प्राप्त",
      nextDate: "2025-07-17",
      status: "",
      taluka: "Trimbakeshwar",
      filedDate: new Date().toISOString().split("T")[0],
      lastUpdate: new Date().toISOString().split("T")[0],
    }

    // Add the case using the addCase function from useCases hook
    const result = addCase(caseData)

    if (result.success) {
      // Reset form and close dialog
      setNewCase({
        caseNumber: "",
        appellant: "",
        respondent: "",
        caseType: "अपील"
      })
      setAddCaseDialogOpen(false)

      // Show success message
      alert("Case added successfully!")
    } else {
      alert(`Failed to add case: ${result.error}`)
    }
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
      Received: receivedStatuses[case_.caseNumber] || case_.received || "-",
      Status: editableStatuses[case_.caseNumber] || case_.status || "",
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
        <div className="mx-auto max-w-7xl space-y-4 p-3 sm:p-4">
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border-indigo-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100 self-start sm:self-center"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-lg sm:text-xl font-bold text-indigo-900">Trimbakeshwar Legal Case Dashboard</h1>
                  <p className="text-xs sm:text-sm text-indigo-700">Sub-Divisional Magistrate Office, Nashik</p>
                </div>
              </div>
              <div className="hidden sm:block w-24"></div> {/* Spacer for centering on desktop */}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-indigo-600">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="border border-indigo-100 shadow-sm bg-gradient-to-br from-indigo-50/50 to-white">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-indigo-600 mb-1">{stats.total}</div>
                <div className="text-xs text-indigo-700">Total Cases</div>
              </CardContent>
            </Card>

            <Card className="border border-blue-100 shadow-sm bg-gradient-to-br from-blue-50/50 to-white">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">{stats.nextDate}</div>
                <div className="text-xs text-blue-700">Next Date</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
              {/* Search and Filters */}
              <Card className="border border-indigo-100 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
                    <Input
                      placeholder="Search cases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 border-indigo-200 focus:border-indigo-500 bg-white/50"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger className="h-9 text-sm border-indigo-200 bg-white/50 min-w-[120px]">
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
                        <SelectTrigger className="h-9 text-sm border-indigo-200 bg-white/50 min-w-[120px]">
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


                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => setAddCaseDialogOpen(true)}
                        className="h-9 text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <span className="text-lg mr-1">+</span>
                        <span className="hidden sm:inline">Add New Case</span>
                        <span className="sm:hidden">Add</span>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="h-9 text-sm bg-white/50 border-indigo-200 hover:bg-indigo-50"
                      >
                        <Filter className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Clear</span>
                        <span className="sm:hidden">Clear</span>
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-9 text-sm bg-white/50 border-indigo-200 hover:bg-indigo-50"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Export</span>
                            <span className="sm:hidden">Export</span>
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
                        onClick={refreshCases}
                        disabled={loading}
                        className="h-9 text-sm bg-white/50 border-indigo-200 hover:bg-indigo-50"
                      >
                        <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">Refresh</span>
                        <span className="sm:hidden">Refresh</span>
                      </Button>
                    </div>
                  </div>

                  {/* Results Info */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-indigo-700">
                    <span>
                      Showing {paginatedCases.length} of {filteredCases.length} cases
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Cases Table */}
              <Card className="border border-indigo-100 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto min-w-full">
                    <Table className="min-w-[800px]">
                      <TableHeader>
                        <TableRow className="border-b border-indigo-100">
                          <TableHead className="font-semibold text-indigo-900 min-w-[100px]">Case Type</TableHead>
                          <TableHead className="font-semibold text-indigo-900 min-w-[140px]">
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
                          <TableHead className="font-semibold text-indigo-900 min-w-[120px]">Appellant</TableHead>
                          <TableHead className="font-semibold text-indigo-900 min-w-[120px]">Respondent</TableHead>
                          <TableHead className="font-semibold text-indigo-900 min-w-[80px]">Received</TableHead>
                          <TableHead className="font-semibold text-indigo-900 min-w-[140px]">Next Date</TableHead>
                          <TableHead className="font-semibold text-indigo-900 min-w-[120px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCases.map((case_, index) => {
                          const statusInfo = getStatusInfo(case_.status)
                          const StatusIcon = statusInfo.icon

                          return (
                            <TableRow key={`${case_.caseNumber}-${index}`} className="hover:bg-indigo-50/50">
                              <TableCell className="p-2 sm:p-4">
                                <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-700 whitespace-nowrap">
                                  {case_.caseType}
                                </Badge>
                              </TableCell>
                              <TableCell className="p-2 sm:p-4">
                                <div className="font-semibold text-sm break-all">{case_.caseNumber}</div>
                              </TableCell>
                              <TableCell className="p-2 sm:p-4">
                                <div className="font-medium text-sm break-words">{case_.appellant}</div>
                              </TableCell>
                              <TableCell className="p-2 sm:p-4">
                                <div className="text-sm break-words">{case_.respondent}</div>
                              </TableCell>
                              <TableCell className="p-2 sm:p-4">
                                <Select
                                  value={receivedStatuses[case_.caseNumber] || case_.received || "-"}
                                  onValueChange={(value) => handleReceivedUpdate(case_.caseNumber, value)}
                                >
                                  <SelectTrigger className="w-full min-w-[70px] h-8 text-xs border-indigo-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="प्राप्त">प्राप्त</SelectItem>
                                    <SelectItem value="-">-</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="p-2 sm:p-4">
                                <Input
                                  type="date"
                                  value={nextDates[case_.caseNumber] || case_.nextDate || "2025-07-17"}
                                  onChange={(e) => handleNextDateUpdate(case_.caseNumber, e.target.value)}
                                  className="w-full min-w-[130px] h-8 text-xs border-indigo-200 focus:border-indigo-400"
                                />
                              </TableCell>
                              <TableCell>
                                <Dialog
                                  open={statusDialogOpen[case_.caseNumber] || false}
                                  onOpenChange={(open) => {
                                    if (!open) closeStatusDialog(case_.caseNumber)
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-8 min-w-[120px] justify-start"
                                      onClick={() => openStatusDialog(case_.caseNumber, case_.status)}
                                    >
                                      {(editableStatuses[case_.caseNumber] || case_.status || "Enter status...").substring(0, 15)}
                                      {(editableStatuses[case_.caseNumber] || case_.status || "").length > 15 ? "..." : ""}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>Edit Status - Case #{case_.caseNumber}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <Textarea
                                        value={tempStatusValue}
                                        onChange={(e) => setTempStatusValue(e.target.value)}
                                        placeholder="Enter detailed status information..."
                                        className="min-h-[100px]"
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => closeStatusDialog(case_.caseNumber)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={() => saveStatusDialog(case_.caseNumber)}>
                                        Save
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-indigo-100">
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
                      <div className="flex gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="border-indigo-200 hover:bg-indigo-50 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          <span className="hidden sm:inline">Previous</span>
                          <span className="sm:hidden">Prev</span>
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                          return (
                            <Button
                              key={page}
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={`w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs sm:text-sm ${page === currentPage ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-200 hover:bg-indigo-50"}`}
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
                          className="border-indigo-200 hover:bg-indigo-50 text-xs sm:text-sm px-2 sm:px-3"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
          </div>
        </div>
      </div>

      {/* Add New Case Dialog */}
      <Dialog open={addCaseDialogOpen} onOpenChange={setAddCaseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Case - Trimbakeshwar</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="caseType" className="text-right text-sm font-medium">
                Case Type *
              </label>
              <Select
                value={newCase.caseType}
                onValueChange={(value) => setNewCase(prev => ({ ...prev, caseType: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="अपील">अपील</SelectItem>
                  <SelectItem value="रिव्हीजन">रिव्हीजन</SelectItem>
                  <SelectItem value="मामलेदार कोर्ट">मामलेदार कोर्ट</SelectItem>
                  <SelectItem value="गौणखनिज">गौणखनिज</SelectItem>
                  <SelectItem value="अतिक्रमण">अतिक्रमण</SelectItem>
                  <SelectItem value="कुळ कायदा">कुळ कायदा</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="caseNumber" className="text-right text-sm font-medium">
                Case Number *
              </label>
              <Input
                id="caseNumber"
                value={newCase.caseNumber}
                onChange={(e) => setNewCase(prev => ({ ...prev, caseNumber: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., अपील/150/2023"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="appellant" className="text-right text-sm font-medium">
                Appellant *
              </label>
              <Input
                id="appellant"
                value={newCase.appellant}
                onChange={(e) => setNewCase(prev => ({ ...prev, appellant: e.target.value }))}
                className="col-span-3"
                placeholder="Appellant name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="respondent" className="text-right text-sm font-medium">
                Respondent *
              </label>
              <Input
                id="respondent"
                value={newCase.respondent}
                onChange={(e) => setNewCase(prev => ({ ...prev, respondent: e.target.value }))}
                className="col-span-3"
                placeholder="Respondent name"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddCaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewCase} className="bg-indigo-600 hover:bg-indigo-700">
              Add Case
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
