// Script to check for duplicate case numbers in Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uqxmnrithfjttfvmbsgj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeG1ucml0aGZqdHRmdm1ic2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDAzNTYsImV4cCI6MjA2ODExNjM1Nn0.8d8qxxGHaM6C2eOR-702mNeoR7Gz1AKC5PwncozZOD4'

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate case numbers...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Get all cases
    const { data: allCases, error } = await supabase
      .from('legal_cases')
      .select('*')
    
    if (error) {
      console.error('❌ Error fetching cases:', error)
      return
    }
    
    console.log(`📊 Total cases in database: ${allCases.length}`)
    
    // Group by case number
    const caseGroups = {}
    allCases.forEach(case_ => {
      const caseNumber = case_['Case Number']
      if (!caseGroups[caseNumber]) {
        caseGroups[caseNumber] = []
      }
      caseGroups[caseNumber].push(case_)
    })
    
    // Find duplicates
    const duplicates = Object.entries(caseGroups).filter(([_, cases]) => cases.length > 1)
    
    console.log(`🔍 Found ${duplicates.length} case numbers with duplicates:`)
    
    let totalDuplicateRecords = 0
    duplicates.forEach(([caseNumber, cases]) => {
      console.log(`\n📋 Case Number: ${caseNumber}`)
      console.log(`   Count: ${cases.length}`)
      totalDuplicateRecords += cases.length
      
      // Show first few duplicates
      cases.slice(0, 3).forEach((case_, index) => {
        console.log(`   ${index + 1}. Taluka: ${case_.Taluka}, Next Date: ${case_['Next Date']}`)
      })
      if (cases.length > 3) {
        console.log(`   ... and ${cases.length - 3} more`)
      }
    })
    
    console.log(`\n📊 Summary:`)
    console.log(`   Unique case numbers: ${Object.keys(caseGroups).length}`)
    console.log(`   Total records: ${allCases.length}`)
    console.log(`   Duplicate records: ${totalDuplicateRecords}`)
    console.log(`   Clean records: ${allCases.length - totalDuplicateRecords + duplicates.length}`)
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

checkDuplicates()