"use client"

import { useState, useEffect } from "react"
import { type CaseData, parseCsvToCases } from "@/lib/csv-utils"

// Sample data with new structure
const sampleCases: CaseData[] = [
  {
    date: "2024-01-15",
    caseType: "अपील",
    caseNumber: "अपील/150/2023",
    appellant: "लक्ष्मीबाई शेलार",
    respondent: "सुनीता शेलार",
    received: "प्राप्त",
    nextDate: "2025-07-17",
    status: "",
    taluka: "Igatpuri",
    filedDate: "2024-01-15",
    lastUpdate: "2024-01-15"
  },
  {
    date: "2024-01-16",
    caseType: "रिव्हीजन",
    caseNumber: "रिव्हीजन/139/2023",
    appellant: "चंद्रबाई हंबीर",
    respondent: "गंगुबाई आघाण",
    received: "प्राप्त",
    nextDate: "2025-07-17",
    status: "",
    taluka: "Igatpuri",
    filedDate: "2024-01-16",
    lastUpdate: "2024-01-16"
  },
  {
    date: "2024-01-17",
    caseType: "मामलेदार कोर्ट",
    caseNumber: "मामलेदार/131/2023",
    appellant: "अरुण पोरजे",
    respondent: "मनोज चौधरी",
    received: "प्राप्त",
    nextDate: "2025-07-17",
    status: "",
    taluka: "Trimbakeshwar",
    filedDate: "2024-01-17",
    lastUpdate: "2024-01-17"
  },
  {
    date: "2024-01-18",
    caseType: "गौणखनिज",
    caseNumber: "गौणखनिज/113/2023",
    appellant: "केरुजी काळे",
    respondent: "कोंडाजी भालेराव",
    received: "प्राप्त",
    nextDate: "2025-07-17",
    status: "",
    taluka: "Trimbakeshwar",
    filedDate: "2024-01-18",
    lastUpdate: "2024-01-18"
  },
  {
    date: "2024-01-19",
    caseType: "अतिक्रमण",
    caseNumber: "अतिक्रमण/104/2023",
    appellant: "रामभाऊ ढोन्नर",
    respondent: "अंबाबाई ढोन्नर उर्फ बिन्नर",
    received: "प्राप्त",
    nextDate: "2025-07-17",
    status: "",
    taluka: "Igatpuri",
    filedDate: "2024-01-19",
    lastUpdate: "2024-01-19"
  },
  {
    date: "2024-01-20",
    caseType: "कुळ कायदा",
    caseNumber: "कुळ/90/2023",
    appellant: "अनुसया मालुंजकर",
    respondent: "ओम मालुंजकर",
    received: "प्राप्त",
    nextDate: "2025-07-17",
    status: "",
    taluka: "Trimbakeshwar",
    filedDate: "2024-01-20",
    lastUpdate: "2024-01-20"
  }
]

export function useCases() {
  const [cases, setCases] = useState<CaseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load initial data
  useEffect(() => {
    loadCases()
  }, [])

  // Load from localStorage on component mount
  useEffect(() => {
    const savedCases = localStorage.getItem("legal-cases")
    if (savedCases) {
      try {
        const parsed = JSON.parse(savedCases)
        if (parsed.cases && Array.isArray(parsed.cases)) {
          setCases(parsed.cases)
          setLastUpdated(new Date(parsed.lastUpdated))
          console.log(`Loaded ${parsed.cases.length} cases from localStorage`)
        }
      } catch (error) {
        console.error("Error parsing saved cases:", error)
      }
    }
  }, [])

  const loadCases = async () => {
    try {
      setLoading(true)
      setError(null)

      // First try to fetch from API
      try {
        console.log('Fetching cases from API...')
        const response = await fetch('/api/update-cases')
        console.log('API response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('API response data:', data)

          if (data.success && data.cases) {
            console.log(`Successfully loaded ${data.cases.length} cases from API`)
            setCases(data.cases)
            setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated) : new Date())

            // Also save to localStorage for offline access
            localStorage.setItem("legal-cases", JSON.stringify({
              cases: data.cases,
              lastUpdated: data.lastUpdated || new Date().toISOString(),
            }))
            return
          } else {
            console.log('API response missing success or cases:', data)
          }
        } else {
          console.log('API response not ok:', response.status, response.statusText)
        }
      } catch (apiError) {
        console.log('API not available, falling back to localStorage:', apiError)
      }

      // Fallback to localStorage if API fails
      const savedCases = localStorage.getItem("legal-cases")
      if (savedCases) {
        const parsed = JSON.parse(savedCases)
        setCases(parsed.cases || [])
        setLastUpdated(new Date(parsed.lastUpdated))
      } else {
        setCases([])
        setLastUpdated(new Date())
      }
    } catch (err) {
      setError("Failed to load cases")
      console.error("Error loading cases:", err)
      setCases([]) // Start with empty array to avoid hydration issues
    } finally {
      setLoading(false)
    }
  }

  const updateCasesFromCsv = async (csvUrl: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch CSV data
      const response = await fetch(csvUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status}`)
      }

      const csvText = await response.text()
      const newCases = parseCsvToCases(csvText)

      // Update state
      setCases(newCases)
      setLastUpdated(new Date())

      // Save to localStorage for persistence
      localStorage.setItem(
        "legal-cases",
        JSON.stringify({
          cases: newCases,
          lastUpdated: new Date().toISOString(),
        }),
      )

      console.log(`Successfully updated ${newCases.length} cases from CSV`)
      return { success: true, count: newCases.length }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update cases"
      setError(errorMessage)
      console.error("Error updating cases from CSV:", err)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const refreshCases = () => {
    // Clear localStorage to force API fetch
    localStorage.removeItem("legal-cases")
    loadCases()
  }

  const addCase = (newCase: CaseData) => {
    try {
      // Add the new case to the existing cases
      const updatedCases = [...cases, newCase]
      setCases(updatedCases)
      setLastUpdated(new Date())

      // Save to localStorage for persistence
      localStorage.setItem(
        "legal-cases",
        JSON.stringify({
          cases: updatedCases,
          lastUpdated: new Date().toISOString(),
        }),
      )

      console.log(`Successfully added new case: ${newCase.caseNumber}`)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add case"
      setError(errorMessage)
      console.error("Error adding case:", err)
      return { success: false, error: errorMessage }
    }
  }

  return {
    cases,
    loading,
    error,
    lastUpdated,
    updateCasesFromCsv,
    refreshCases,
    addCase,
  }
}
