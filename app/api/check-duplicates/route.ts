import { NextResponse } from "next/server"
import { checkForDuplicateCaseNumbers } from "@/lib/dbSupabase"

export async function GET() {
  try {
    console.log('=== Checking for duplicate case numbers ===')
    
    const result = await checkForDuplicateCaseNumbers()
    
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
    
  } catch (error) {
    console.error('Error checking duplicates:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check for duplicates',
      details: error instanceof Error ? error.message : 'Unknown error'
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