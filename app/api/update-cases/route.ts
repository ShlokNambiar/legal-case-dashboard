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
    console.log('=== API Request Started ===')
    console.log('Request method:', request.method)
    console.log('Request URL:', request.url)
    console.log('Content-Type:', request.headers.get('content-type'))

    // Get the form data from the request
    const formData = await request.formData()
    console.log('Form data parsed successfully')

    // Debug: Log all form field names and their types
    console.log('Form data keys:', Array.from(formData.keys()))
    for (const [key, value] of formData.entries()) {
      console.log(`Field "${key}":`, typeof value, value instanceof File ? `File: ${value.name}, size: ${value.size}` : `Value: ${String(value).substring(0, 100)}...`)
    }

    // Check if we have both key and value fields (from your automation)
    const allValues = formData.getAll('key').concat(formData.getAll('value'))
    console.log('All key/value entries:', allValues.length)

    // First, check if 'key' contains CSV text data (which is what your automation sends)
    const keyValue = formData.get('key')
    if (keyValue && typeof keyValue === 'string') {
      console.log('Found CSV text in key field, processing directly')
      console.log('CSV text preview:', keyValue.substring(0, 200))
      try {
        return await processCsvText(keyValue)
      } catch (csvError) {
        console.error('Error processing CSV text from key field:', csvError)
        return NextResponse.json({ error: "Failed to process CSV text", details: csvError.message }, { status: 500 })
      }
    }

    // Also check 'value' field (your automation might be sending both)
    const valueField = formData.get('value')
    if (valueField && typeof valueField === 'string') {
      console.log('Found CSV text in value field, processing directly')
      console.log('CSV text preview:', valueField.substring(0, 200))
      try {
        return await processCsvText(valueField)
      } catch (csvError) {
        console.error('Error processing CSV text from value field:', csvError)
        return NextResponse.json({ error: "Failed to process CSV text", details: csvError.message }, { status: 500 })
      }
    }

    // If key is a file, process it as a file
    if (keyValue && keyValue instanceof File) {
      console.log('Found file in key field:', keyValue.name, 'size:', keyValue.size)
      try {
        const bytes = await keyValue.arrayBuffer()
        const csvText = new TextDecoder('utf-8').decode(bytes)
        return await processCsvText(csvText)
      } catch (fileError) {
        console.error('Error reading key file:', fileError)
        return NextResponse.json({ error: "Failed to read uploaded file from key field" }, { status: 500 })
      }
    }

    // Look for a file in the 'file' field as fallback
    const file = formData.get('file') as File
    if (file && file instanceof File) {
      console.log('Found file in file field:', file.name, 'size:', file.size)
      try {
        const bytes = await file.arrayBuffer()
        const csvText = new TextDecoder('utf-8').decode(bytes)
        return await processCsvText(csvText)
      } catch (fileError) {
        console.error('Error reading file field:', fileError)
        return NextResponse.json({ error: "Failed to read uploaded file from file field" }, { status: 500 })
      }
    }

    // Check if CSV data was sent as text in csvData field
    const csvData = formData.get('csvData') as string
    if (csvData) {
      console.log('Found CSV data in csvData field')
      return await processCsvText(csvData)
    }

    console.log('No CSV data found in any field')
    return NextResponse.json({ error: "No CSV file or data provided" }, { status: 400 })

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

    // Store the cases in a simple JSON file for the dashboard to read
    // In production, this would be a database
    const fs = require('fs')
    const path = require('path')

    try {
      // Create a data directory if it doesn't exist
      const dataDir = path.join(process.cwd(), 'data')
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      // Save the cases to a JSON file
      const dataFile = path.join(dataDir, 'cases.json')
      const caseData = {
        cases: cases,
        lastUpdated: new Date().toISOString(),
        breakdown: {
          igatpuri: igatpuriCases.length,
          trimbakeshwar: trimbakeshwarCases.length
        }
      }

      fs.writeFileSync(dataFile, JSON.stringify(caseData, null, 2))
      console.log('Cases saved to file:', dataFile)
    } catch (fileError) {
      console.error('Error saving cases to file:', fileError)
      // Continue anyway - don't fail the API call
    }

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
  try {
    const fs = require('fs')
    const path = require('path')

    const dataFile = path.join(process.cwd(), 'data', 'cases.json')

    if (fs.existsSync(dataFile)) {
      const fileContent = fs.readFileSync(dataFile, 'utf8')
      const caseData = JSON.parse(fileContent)

      return NextResponse.json({
        success: true,
        ...caseData
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    } else {
      return NextResponse.json({
        success: true,
        cases: [],
        lastUpdated: null,
        breakdown: { igatpuri: 0, trimbakeshwar: 0 },
        message: "No cases found"
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    }
  } catch (error) {
    console.error('Error reading cases:', error)
    return NextResponse.json({
      success: false,
      error: "Failed to read cases",
      cases: []
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}
