import { type NextRequest, NextResponse } from "next/server"

// This API endpoint specifically for Trimbakeshwar cases
export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File || formData.get('key') as File

    if (!file) {
      const csvData = formData.get('csvData') as string
      if (!csvData) {
        return NextResponse.json({ error: "No CSV file or data provided" }, { status: 400 })
      }
      return await processCsvForLocation(csvData, "Trimbakeshwar")
    }

    const bytes = await file.arrayBuffer()
    const csvText = new TextDecoder().decode(bytes)
    return await processCsvForLocation(csvText, "Trimbakeshwar")

  } catch (error) {
    console.error("Error processing Trimbakeshwar CSV:", error)
    return NextResponse.json(
      {
        error: "Failed to process CSV data for Trimbakeshwar",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers },
    )
  }
}

async function processCsvForLocation(csvText: string, location: string) {
  try {
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

        // Force assign the specified location
        caseData.taluka = location
        cases.push(caseData)
      }
    }

    console.log(`Processed ${cases.length} cases for ${location}`)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${cases.length} cases for ${location}`,
      location: location,
      cases: cases.slice(0, 5),
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
    console.error(`Error parsing CSV for ${location}:`, error)
    return NextResponse.json(
      {
        error: `Failed to parse CSV data for ${location}`,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

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
