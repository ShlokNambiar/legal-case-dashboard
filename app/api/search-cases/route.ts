import { type NextRequest, NextResponse } from "next/server"
import { initializeDatabase, searchCasesByNumber } from "@/lib/dbSupabase"

// GET endpoint to search cases by case number
export async function GET(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    await initializeDatabase()
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "Search query is required"
      }, { status: 400, headers })
    }
    
    console.log('🔄 SEARCHING CASES:', query)
    const cases = await searchCasesByNumber(query)
    
    console.log(`✅ Found ${cases.length} matching cases`)
    
    return NextResponse.json({
      success: true,
      cases: cases,
      query: query,
      count: cases.length
    }, { headers })

  } catch (error) {
    console.error('Error searching cases:', error)
    return NextResponse.json(
      { error: "Failed to search cases" },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
