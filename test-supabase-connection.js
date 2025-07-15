// Simple test script to verify Supabase connection and data structure
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uqxmnrithfjttfvmbsgj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeG1ucml0aGZqdHRmdm1ic2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDAzNTYsImV4cCI6MjA2ODExNjM1Nn0.8d8qxxGHaM6C2eOR-702mNeoR7Gz1AKC5PwncozZOD4'

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test 1: Get total count
    const { count, error: countError } = await supabase
      .from('CaseData')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Count error:', countError)
      return
    }
    
    console.log(`✅ Total records: ${count}`)
    
    // Test 2: Get sample data to see structure
    const { data: sampleData, error: sampleError } = await supabase
      .from('CaseData')
      .select('*')
      .limit(3)
    
    if (sampleError) {
      console.error('❌ Sample data error:', sampleError)
      return
    }
    
    console.log(`✅ Sample data (${sampleData.length} records):`)
    if (sampleData.length > 0) {
      console.log('📋 Column names:', Object.keys(sampleData[0]))
      console.log('📋 First record:', sampleData[0])
    }
    
    // Test 3: Try updating a record
    if (sampleData.length > 0) {
      const testCase = sampleData[0]
      const caseNumber = testCase['Case Number']
      
      console.log(`🔄 Testing update for case: ${caseNumber}`)
      
      const { data: updateData, error: updateError } = await supabase
        .from('CaseData')
        .update({ 'Received': 'प्राप्त' })
        .eq('Case Number', caseNumber)
        .select()
      
      if (updateError) {
        console.error('❌ Update error:', updateError)
      } else {
        console.log(`✅ Update successful:`, updateData)
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testConnection()