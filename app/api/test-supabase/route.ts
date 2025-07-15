import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    console.log('=== Testing Supabase Connection ===')
    
    // Use the exact same credentials you provided
    const supabaseUrl = 'https://uqxmnrithfjttfvmbsgj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeG1ucml0aGZqdHRmdm1ic2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDAzNTYsImV4cCI6MjA2ODExNjM1Nn0.8d8qxxGHaM6C2eOR-702mNeoR7Gz1AKC5PwncozZOD4'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('Testing connection with hardcoded credentials...')
    
    // Test 1: Basic connection with count
    const { count, error: countError } = await supabase
      .from('legal_cases')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json({
        success: false,
        step: 'count',
        error: countError.message,
        details: countError
      })
    }
    
    console.log('Count result:', count)
    
    // Test 2: Get sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from('legal_cases')
      .select('*')
      .limit(5)
    
    if (sampleError) {
      console.error('Sample data error:', sampleError)
      return NextResponse.json({
        success: false,
        step: 'sample_data',
        error: sampleError.message,
        details: sampleError
      })
    }
    
    console.log('Sample data:', sampleData)
    
    // Test 3: Check environment variables
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    return NextResponse.json({
      success: true,
      totalRecords: count,
      sampleDataCount: sampleData?.length || 0,
      sampleData: sampleData,
      environment: {
        urlMatches: envUrl === supabaseUrl,
        keyMatches: envKey === supabaseKey,
        envUrl: envUrl || 'Missing',
        envKey: envKey ? 'Set' : 'Missing'
      }
    })
    
  } catch (error) {
    console.error('Test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}