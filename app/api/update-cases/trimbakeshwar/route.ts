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
    // First, check if 'key' contains CSV text data (which is what your automation sends)
    const keyValue = formData.get('key')
    if (keyValue && typeof keyValue === 'string') {
      console.log('Found CSV text in key field, processing for Trimbakeshwar')
      return await processCsvForLocation(keyValue, "Trimbakeshwar")
    }

    // If key is a file, process it as a file
    if (keyValue && keyValue instanceof File) {
      console.log('Found file in key field:', keyValue.name, 'size:', keyValue.size)
      try {
        const bytes = await keyValue.arrayBuffer()
        const csvText = new TextDecoder('utf-8').decode(bytes)
        return await processCsvForLocation(csvText, "Trimbakeshwar")
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
        return await processCsvForLocation(csvText, "Trimbakeshwar")
      } catch (fileError) {
        console.error('Error reading file field:', fileError)
        return NextResponse.json({ error: "Failed to read uploaded file from file field" }, { status: 500 })
      }
    }

    // Check if CSV data was sent as text in csvData field
    const csvData = formData.get('csvData') as string
    if (csvData) {
      console.log('Found CSV data in csvData field')
      return await processCsvForLocation(csvData, "Trimbakeshwar")
    }

    console.log('No CSV data found in any field')
    return NextResponse.json({ error: "No CSV file or data provided" }, { status: 400 })

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
