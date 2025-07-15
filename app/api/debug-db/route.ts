import { NextResponse } from "next/server"
import { supabase } from "@/lib/dbSupabase"

export async function GET() {
  try {
    console.log('=== Database Debug ===')
    
    // Test basic connection
    console.log('Testing Supabase connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('legal_cases')
      .select('count(*)', { count: 'exact', head: true })
    
    if (connectionError) {
      console.error('Connection error:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Connection failed',
        details: connectionError.message,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      })
    }

    console.log('Connection successful, count:', connectionTest)

    // Get first few records to check structure
    const { data: sampleData, error: sampleError } = await supabase
      .from('legal_cases')
      .select('*')
      .limit(3)

    if (sampleError) {
      console.error('Sample data error:', sampleError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch sample data',
        details: sampleError.message
      })
    }

    console.log('Sample data:', sampleData)

    // Try to get all tables to see what exists
    const { data: allTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    return NextResponse.json({
      success: true,
      totalRecords: connectionTest,
      sampleData: sampleData,
      availableTables: allTables || 'Could not fetch tables',
      tablesError: tablesError?.message || null,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}