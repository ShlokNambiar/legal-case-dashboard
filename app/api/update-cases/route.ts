import { type NextRequest, NextResponse } from "next/server"

// This API endpoint will be called by your automation
export async function POST(request: NextRequest) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
  try {
    // Get the form data from the request
    const formData = await request.formData()

    // Look for a file in the form data
    const file = formData.get('file') as File

    if (!file) {
      // If no file, check if CSV data was sent as text
      const csvData = formData.get('csvData') as string
      if (!csvData) {
        return NextResponse.json({ error: "No CSV file or data provided" }, { status: 400 })
      }

      // Process the CSV data directly
      return await processCsvText(csvData)
    }

    // If we have a file, read its contents
    const bytes = await file.arrayBuffer()
    const csvText = new TextDecoder().decode(bytes)

    const result = await processCsvText(csvText)
    return new NextResponse(result.body, {
      status: result.status,
      headers: { ...headers, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("Error processing CSV:", error)
    return NextResponse.json(
      {
        error: "Failed to process CSV data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers },
    )
  }
}

// Helper function to process CSV text
async function processCsvText(csvText: string) {
  try {
    // Parse CSV
    const lines = csvText.trim().split("\n")

    if (lines.length === 0) {
      return NextResponse.json({ error: "Empty CSV data" }, { status: 400 })
    }

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    const cases = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      if (values.length === headers.length) {
        const caseData: Record<string, string> = {}
        headers.forEach((header, index) => {
          caseData[header] = values[index]
        })

        // Auto-detect and assign location based on CSV content
        const detectedLocation = detectLocation(caseData, csvText)
        caseData.taluka = detectedLocation

        cases.push(caseData)
      }
    }

    // Categorize cases by location
    const igatpuriCases = cases.filter(c => c.taluka === "Igatpuri")
    const trimbakeshwarCases = cases.filter(c => c.taluka === "Trimbakeshwar")

    // Save to localStorage for each location
    await saveCasesToStorage(igatpuriCases, trimbakeshwarCases)

    console.log(`Processed ${cases.length} cases from CSV - Igatpuri: ${igatpuriCases.length}, Trimbakeshwar: ${trimbakeshwarCases.length}`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${cases.length} cases`,
      breakdown: {
        igatpuri: igatpuriCases.length,
        trimbakeshwar: trimbakeshwarCases.length
      },
      detectedLocation: cases.length > 0 ? cases[0].taluka : "Unknown",
      cases: cases.slice(0, 5), // Return first 5 for verification
      totalCases: cases.length,
      headers: headers
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  } catch (error) {
    console.error("Error parsing CSV:", error)
    return NextResponse.json(
      {
        error: "Failed to parse CSV data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      },
    )
  }
}

// Helper function to detect location based on CSV content
function detectLocation(caseData: Record<string, string>, csvText: string): string {
  // Method 1: Check case numbers or IDs for patterns (most specific)
  const caseNumber = caseData['Case Number'] || caseData['caseNumber'] || caseData['Case ID'] || caseData['caseId']
  if (caseNumber) {
    const caseNum = caseNumber.toLowerCase()
    if (caseNum.includes('tmb') || caseNum.includes('trimbakeshwar')) return "Trimbakeshwar"
    if (caseNum.includes('igt') || caseNum.includes('igatpuri')) return "Igatpuri"
  }

  // Method 2: Check each field individually for location info (case-by-case basis)
  for (const [key, value] of Object.entries(caseData)) {
    const val = value?.toLowerCase() || ''
    if (val.includes('trimbakeshwar')) return "Trimbakeshwar"
    if (val.includes('igatpuri')) return "Igatpuri"
  }

  // Method 3: Check if there's already a taluka/location field
  const locationFields = ['taluka', 'location', 'court', 'office', 'jurisdiction']
  for (const field of locationFields) {
    const value = caseData[field]?.toLowerCase()
    if (value) {
      if (value.includes('trimbakeshwar')) return "Trimbakeshwar"
      if (value.includes('igatpuri')) return "Igatpuri"
    }
  }

  // Method 4: Check filename or overall CSV content (last resort)
  const textToCheck = csvText.toLowerCase()
  if (textToCheck.includes('trimbakeshwar') && !textToCheck.includes('igatpuri')) return "Trimbakeshwar"
  if (textToCheck.includes('igatpuri') && !textToCheck.includes('trimbakeshwar')) return "Igatpuri"

  // Default: If no location detected, return Igatpuri as default
  return "Igatpuri" // Default location
}

// Helper function to save cases to storage (simulating database)
async function saveCasesToStorage(igatpuriCases: any[], trimbakeshwarCases: any[]) {
  // In a real application, this would save to a database
  // For now, we'll just log the categorization
  console.log(`Saving cases - Igatpuri: ${igatpuriCases.length}, Trimbakeshwar: ${trimbakeshwarCases.length}`)

  // You could implement actual storage logic here
  // For example, saving to different database tables or files
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// GET endpoint to fetch current cases
export async function GET() {
  // In a real application, this would fetch from your database
  // For demo purposes, we'll return sample data
  return NextResponse.json({
    message: "This endpoint would return current cases from database",
  })
}
