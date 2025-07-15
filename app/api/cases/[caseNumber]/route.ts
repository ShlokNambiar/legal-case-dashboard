import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, updateCaseField, getCaseByNumber } from "@/lib/dbSupabase"

// PATCH endpoint to update specific fields of a case
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ caseNumber: string }> }
) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    await initializeDatabase()

    const { caseNumber } = await params
    const body = await request.json()
    const { field, value } = body

    if (!field || value === undefined) {
      return NextResponse.json(
        { error: "Field and value are required" },
        { status: 400, headers }
      )
    }

    // Validate field
    const allowedFields = ['status', 'received', 'next_date', 'case_type']
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: `Invalid field. Allowed fields: ${allowedFields.join(', ')}` },
        { status: 400, headers }
      )
    }
    
    console.log(`API: Updating case ${caseNumber}, field: ${field}, value: ${value}`)

    const result = await updateCaseField(caseNumber, field, value)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500, headers }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${field} for case ${caseNumber}`,
      updated: result.updated
    }, { headers })

  } catch (error) {
    console.error('Error updating case:', error)
    return NextResponse.json(
      { error: "Failed to update case" },
      { status: 500, headers }
    )
  }
}

// GET endpoint to fetch a specific case
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseNumber: string }> }
) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    await initializeDatabase()

    const { caseNumber } = await params
    const case_ = await getCaseByNumber(caseNumber)

    if (!case_) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404, headers }
      )
    }

    return NextResponse.json({
      success: true,
      case: case_
    }, { headers })

  } catch (error) {
    console.error('Error fetching case:', error)
    return NextResponse.json(
      { error: "Failed to fetch case" },
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
      'Access-Control-Allow-Methods': 'PATCH, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
