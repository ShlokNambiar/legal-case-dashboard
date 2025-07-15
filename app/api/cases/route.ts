import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, upsertCases } from "@/lib/dbSupabase"

// POST endpoint to add a new case
export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    await initializeDatabase()

    const body = await request.json()
    console.log('🔄 ADDING NEW CASE:', body.caseNumber)

    // Convert frontend case data to database format
    const dbCase = {
      "Case Type": body.caseType || "अपील",
      "Case Number": body.caseNumber,
      "Appellant": body.appellant,
      "Respondent": body.respondent,
      "Received": body.received || "प्राप्त",
      "Next Date": body.nextDate || "17-07-2025",
      "Taluka": body.taluka || "Igatpuri"
    }

    const result = await upsertCases([dbCase])

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500, headers }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Added new case ${body.caseNumber}`,
      inserted: result.inserted
    }, { headers })

  } catch (error) {
    console.error('Error adding case:', error)
    return NextResponse.json(
      { error: "Failed to add case" },
      { status: 500, headers }
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