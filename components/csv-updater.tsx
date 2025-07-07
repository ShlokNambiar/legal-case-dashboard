"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Upload, CheckCircle, AlertCircle } from "lucide-react"

interface CsvUpdaterProps {
  onUpdate: (csvUrl: string) => Promise<{ success: boolean; count?: number; error?: string }>
  lastUpdated: Date | null
}

export function CsvUpdater({ onUpdate, lastUpdated }: CsvUpdaterProps) {
  const [csvUrl, setCsvUrl] = useState("")
  const [updating, setUpdating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleUpdate = async () => {
    if (!csvUrl.trim()) {
      setResult({ success: false, message: "Please enter a CSV URL" })
      return
    }

    setUpdating(true)
    setResult(null)

    try {
      const response = await onUpdate(csvUrl.trim())

      if (response.success) {
        setResult({
          success: true,
          message: `Successfully updated ${response.count} cases`,
        })
        setCsvUrl("") // Clear the input
      } else {
        setResult({
          success: false,
          message: response.error || "Failed to update cases",
        })
      }
    } catch {
      setResult({
        success: false,
        message: "An unexpected error occurred",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleQuickUpdate = async () => {
    // Use the provided CSV URL for quick testing
    const testUrl =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Case_Dashboard_Data-Vg4vo5BWEYQl5qOZKVEKxJO5za7rD7.csv"
    setCsvUrl(testUrl)

    setUpdating(true)
    setResult(null)

    try {
      const response = await onUpdate(testUrl)

      if (response.success) {
        setResult({
          success: true,
          message: `Successfully updated ${response.count} cases from your data`,
        })
      } else {
        setResult({
          success: false,
          message: response.error || "Failed to update cases",
        })
      }
    } catch {
      setResult({
        success: false,
        message: "An unexpected error occurred",
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Update Cases from CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Enter CSV URL from Google Drive automation..."
            value={csvUrl}
            onChange={(e) => setCsvUrl(e.target.value)}
            disabled={updating}
          />
          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={updating || !csvUrl.trim()} className="flex-1">
              {updating ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3 mr-2" />
                  Update Cases
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleQuickUpdate} disabled={updating}>
              Use Sample Data
            </Button>
          </div>
        </div>

        {result && (
          <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        {lastUpdated && (
          <div className="text-xs text-gray-500 text-center">Last updated: {lastUpdated.toLocaleString()}</div>
        )}
      </CardContent>
    </Card>
  )
}
