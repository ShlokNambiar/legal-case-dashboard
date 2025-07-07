"use client"

import { useState, useEffect } from "react"
import { type CaseData, parseCsvToCases } from "@/lib/csv-utils"

// All mock data has been cleared
const sampleCases: CaseData[] = []

export function useCases() {
  const [cases, setCases] = useState<CaseData[]>(sampleCases)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date())

  // Load initial data
  useEffect(() => {
    loadCases()
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
        setCases(parsed.cases || sampleCases)
        setLastUpdated(new Date(parsed.lastUpdated))
      } else {
        setCases(sampleCases)
        setLastUpdated(new Date())
      }
    } catch (err) {
      setError("Failed to load cases")
      console.error("Error loading cases:", err)
      setCases(sampleCases) // Fallback to sample data
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
      setCases(newCases.length > 0 ? newCases : sampleCases)
      setLastUpdated(new Date())

      // Save to localStorage for persistence
      localStorage.setItem(
        "legal-cases",
        JSON.stringify({
          cases: newCases.length > 0 ? newCases : sampleCases,
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

  return {
    cases,
    loading,
    error,
    lastUpdated,
    updateCasesFromCsv,
    refreshCases,
  }
}
