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
        cases.push(caseData)
      }
    }

    // In a real application, you would save this to a database
    // For now, we'll return the processed data
    console.log(`Processed ${cases.length} cases from CSV`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${cases.length} cases`,
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
