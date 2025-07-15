// Script to check what tables exist in Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uqxmnrithfjttfvmbsgj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeG1ucml0aGZqdHRmdm1ic2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDAzNTYsImV4cCI6MjA2ODExNjM1Nn0.8d8qxxGHaM6C2eOR-702mNeoR7Gz1AKC5PwncozZOD4'

async function checkTables() {
  console.log('🔍 Checking available tables...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Try different possible table names
    const tableNames = ['CaseData', 'casedata', 'case_data', 'legal_cases', 'Legal_Cases']
    
    for (const tableName of tableNames) {
      console.log(`\n📋 Testing table: ${tableName}`)
      
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`❌ Error: ${error.message}`)
      } else {
        console.log(`✅ Found table ${tableName} with ${count} records`)
        
        // Get sample data to see structure
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select('*')
          .limit(2)
        
        if (!sampleError && sampleData && sampleData.length > 0) {
          console.log(`📋 Columns:`, Object.keys(sampleData[0]))
          console.log(`📋 Sample record:`, sampleData[0])
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkTables()