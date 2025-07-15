import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, upsertCases, getAllCases } from "@/lib/dbSupabase"

// POST endpoint to add a new case
export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    await initializeDatabase()

    const body = await request.json()
    console.log('📝 Adding new case:', body)

    // Validate required fields
    if (!body.caseNumber || !body.appellant || !body.respondent) {
      return NextResponse.json(
        { error: "Case number, appellant, and respondent are required" },
        { status: 400, headers }
      )
    }

    // Create case record with proper database column names
    const newCase = {
      "Case Number": body.caseNumber,
      "Case Type": body.caseType || "अपील",
      "Appellant": body.appellant,
      "Respondent": body.respondent,
      "Received": body.received || "प्राप्त",
      "Next Date": body.nextDate || null,
      "Taluka": body.taluka || "Igatpuri",
      status: body.status || "",
      remarks: body.remarks || ""
    }

    console.log('📝 Formatted case for database:', newCase)

    const result = await upsertCases([newCase])

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500, headers }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Case added successfully",
      case: newCase
    }, { headers })

  } catch (error) {
    console.error('Error adding case:', error)
    return NextResponse.json(
      { error: "Failed to add case" },
      { status: 500, headers }
    )
  }
}

// GET endpoint to fetch all cases
export async function GET() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    await initializeDatabase()
    const cases = await getAllCases()

    return NextResponse.json({
      success: true,
      cases: cases,
      count: cases.length
    }, { headers })

  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json(
      { error: "Failed to fetch cases" },
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
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}