"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Calendar, AlertCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Sample data structure matching the CSV format
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
  },
  {
    caseId: "अपिल/12/2024",
    type: "Appeal",
    petitioner: "नीता रावत",
    respondent: "ग्राम पंचायत",
    taluka: "Igatpuri",
    hearingDate: "2024-01-30",
    status: "Case Filed",
    reminderDate: "2024-01-28",
  },
  {
    caseId: "अतिक्रमण/67/2023",
    type: "Encroachment",
    petitioner: "राहुल खान",
    respondent: "सार्वजनिक विभाग",
    taluka: "Trimbakeshwar",
    hearingDate: "2024-01-17",
    status: "Site Inspection Done",
    reminderDate: "2024-01-15",
  },
  {
    caseId: "भाडेकरू/88/2023",
    type: "Tenancy Dispute",
    petitioner: "कविता सिंह",
    respondent: "मनोज त्रिपाठी",
    taluka: "Igatpuri",
    hearingDate: "2024-01-19",
    status: "Evidence Collection",
    reminderDate: "2024-01-17",
  },
  {
    caseId: "पुनरावलोकन/55/2023",
    type: "Revision",
    petitioner: "दीपक जैन",
    respondent: "तहसीलदार",
    taluka: "Trimbakeshwar",
    hearingDate: "2024-01-24",
    status: "Final Arguments",
    reminderDate: "2024-01-22",
  },
]

const caseTypes = ["All Types", "Appeal", "Encroachment", "Tenancy Dispute", "Revision"]
const talukas = ["All Talukas", "Igatpuri", "Trimbakeshwar"]

export default function LegalCaseDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedTaluka, setSelectedTaluka] = useState("All Talukas")
  const [currentPage, setCurrentPage] = useState(1)
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

  // Filter and search logic
  const filteredCases = useMemo(() => {
    return sampleCases.filter((case_) => {
      const matchesSearch =
        case_.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.petitioner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        case_.respondent.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = selectedType === "All Types" || case_.type === selectedType
      const matchesTaluka = selectedTaluka === "All Talukas" || case_.taluka === selectedTaluka

      return matchesSearch && matchesType && matchesTaluka
    })
  }, [searchTerm, selectedType, selectedTaluka])

  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / casesPerPage)
  const startIndex = (currentPage - 1) * casesPerPage
  const paginatedCases = filteredCases.slice(startIndex, startIndex + casesPerPage)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle send reminder
  const handleSendReminder = (caseId: string) => {
    // This would integrate with Make.com webhook in production
    alert(`Reminder sent for case: ${caseId}`)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "notice served":
      case "hearing completed":
        return "default"
      case "awaiting response":
      case "notice pending":
        return "secondary"
      case "under review":
      case "investigation ongoing":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
              Legal Case Monitoring Dashboard
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Sub-Divisional Magistrate Office, Nashik (Igatpuri & Trimbakeshwar)
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Today:{" "}
                {today.toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </CardHeader>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by Case ID, Petitioner, or Respondent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
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
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
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
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {paginatedCases.length} of {filteredCases.length} cases
              </p>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-600">
                  {filteredCases.filter((c) => isUrgentReminder(c.reminderDate)).length} urgent reminders
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Case ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Petitioner</TableHead>
                    <TableHead>Respondent</TableHead>
                    <TableHead>Taluka</TableHead>
                    <TableHead>Hearing Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reminder</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCases.map((case_, index) => {
                    const isUrgent = isUrgentReminder(case_.reminderDate)
                    return (
                      <TableRow
                        key={case_.caseId}
                        className={isUrgent ? "bg-orange-50 border-l-4 border-l-orange-400" : ""}
                      >
                        <TableCell className="font-medium text-sm">{case_.caseId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {case_.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">{case_.petitioner}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{case_.respondent}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {case_.taluka}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(case_.hearingDate)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(case_.status)} className="text-xs">
                            {case_.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{formatDate(case_.reminderDate)}</span>
                            {isUrgent && <AlertCircle className="h-4 w-4 text-orange-500" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendReminder(case_.caseId)}
                            className="h-8 w-8 p-0"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
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
                <Separator />
                <div className="flex items-center justify-between p-4">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredCases.length}</div>
                <div className="text-sm text-gray-600">Total Cases</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredCases.filter((c) => isUrgentReminder(c.reminderDate)).length}
                </div>
                <div className="text-sm text-gray-600">Urgent Reminders</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredCases.filter((c) => c.taluka === "Igatpuri").length}
                </div>
                <div className="text-sm text-gray-600">Igatpuri Cases</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredCases.filter((c) => c.taluka === "Trimbakeshwar").length}
                </div>
                <div className="text-sm text-gray-600">Trimbakeshwar Cases</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
