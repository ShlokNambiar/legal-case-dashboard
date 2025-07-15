// Script to add UID column to handle duplicate case numbers
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uqxmnrithfjttfvmbsgj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeG1ucml0aGZqdHRmdm1ic2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDAzNTYsImV4cCI6MjA2ODExNjM1Nn0.8d8qxxGHaM6C2eOR-702mNeoR7Gz1AKC5PwncozZOD4'

async function addUidColumn() {
  console.log('🔧 Adding UID column to handle duplicate case numbers...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Step 1: Check if UID column already exists
    console.log('📋 Checking current table structure...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('legal_cases')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.error('❌ Error checking table structure:', sampleError)
      return
    }
    
    const columns = Object.keys(sampleData[0] || {})
    console.log('📋 Current columns:', columns)
    
    if (columns.includes('uid')) {
      console.log('✅ UID column already exists!')
    } else {
      console.log('⚠️ UID column does not exist. You need to add it manually in Supabase.')
      console.log('📝 Go to your Supabase dashboard and run this SQL:')
      console.log('   ALTER TABLE legal_cases ADD COLUMN uid UUID DEFAULT gen_random_uuid();')
      console.log('   UPDATE legal_cases SET uid = gen_random_uuid() WHERE uid IS NULL;')
      return
    }
    
    // Step 2: Get all records and check UIDs
    console.log('📊 Fetching all records to check UIDs...')
    const { data: allCases, error: fetchError } = await supabase
      .from('legal_cases')
      .select('*')
    
    if (fetchError) {
      console.error('❌ Error fetching cases:', fetchError)
      return
    }
    
    console.log(`📊 Total records: ${allCases.length}`)
    
    // Check how many have UIDs
    const withUid = allCases.filter(case_ => case_.uid)
    const withoutUid = allCases.filter(case_ => !case_.uid)
    
    console.log(`✅ Records with UID: ${withUid.length}`)
    console.log(`❌ Records without UID: ${withoutUid.length}`)
    
    if (withoutUid.length > 0) {
      console.log('🔧 Generating UIDs for records without them...')
      
      // Update records without UIDs in batches
      const batchSize = 100
      for (let i = 0; i < withoutUid.length; i += batchSize) {
        const batch = withoutUid.slice(i, i + batchSize)
        console.log(`📝 Updating batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(withoutUid.length/batchSize)}...`)
        
        for (const case_ of batch) {
          const { error: updateError } = await supabase
            .from('legal_cases')
            .update({ uid: crypto.randomUUID() })
            .eq('Case Number', case_['Case Number'])
            .eq('Taluka', case_.Taluka)
            .eq('Next Date', case_['Next Date'])
          
          if (updateError) {
            console.error('❌ Error updating UID:', updateError)
          }
        }
      }
      
      console.log('✅ UID generation complete!')
    }
    
    // Step 3: Verify all records now have UIDs
    const { data: verifyData, error: verifyError } = await supabase
      .from('legal_cases')
      .select('uid')
      .is('uid', null)
    
    if (verifyError) {
      console.error('❌ Error verifying UIDs:', verifyError)
      return
    }
    
    if (verifyData.length === 0) {
      console.log('✅ All records now have UIDs!')
      console.log('🎉 Database is ready for unique updates!')
    } else {
      console.log(`⚠️ Still ${verifyData.length} records without UIDs`)
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error)
  }
}

addUidColumn()