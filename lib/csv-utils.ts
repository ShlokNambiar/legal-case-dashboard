export interface CaseData {
  date: string
  caseType: string
  caseNumber: string
  appellant: string
  respondent: string
  received: string  // This will store the original "प्राप्त" or similar values
  nextDate: string  // New field for next hearing date
  status: string    // This will be the new editable status field
  taluka: string
  filedDate: string
  lastUpdate: string
}

export function parseCsvToCases(csvText: string): CaseData[] {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const cases: CaseData[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    if (values.length < headers.length) continue

    const caseData: Partial<CaseData> = {}

    headers.forEach((header, index) => {
      const value = values[index] || ""

      switch (header) {
        case "date":
          // Convert DD/MM/YYYY to YYYY-MM-DD
          const dateParts = value.split("/")
          if (dateParts.length === 3) {
            const [day, month, year] = dateParts
            caseData.date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
          } else {
            caseData.date = value
          }
          break
        case "case type":
        case "casetype":
          caseData.caseType = value
          break
        case "case number":
        case "casenumber":
          caseData.caseNumber = value
          break
        case "appellant":
          caseData.appellant = value
          break
        case "respondent":
          caseData.respondent = value
          break
        case "received":
          caseData.received = value
          break
        case "next date":
        case "nextdate":
          caseData.nextDate = value
          break
        case "status":
        case "custom_status":
        case "custom status":
        case "editable_status":
          caseData.status = value
          break
        case "taluka":
          caseData.taluka = value
          break
      }
    })

    // Set default values and derive missing fields
    if (caseData.date && caseData.caseType && caseData.caseNumber) {
      const finalCase: CaseData = {
        date: caseData.date,
        caseType: caseData.caseType,
        caseNumber: caseData.caseNumber,
        appellant: caseData.appellant || "Unknown",
        respondent: caseData.respondent || "Unknown",
        received: caseData.received || "प्राप्त",  // Default to "प्राप्त" if no received status
        nextDate: caseData.nextDate || "2025-07-17",  // Default to 17th July 2025
        status: caseData.status || "",  // Default to empty for editable status
        taluka: caseData.taluka || "Unknown",
        filedDate: caseData.date,
        lastUpdate: new Date().toISOString().split("T")[0],
      }

      cases.push(finalCase)
    }
  }

  return cases
}

export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return "N/A"

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

export function isValidDate(dateString: string): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}
