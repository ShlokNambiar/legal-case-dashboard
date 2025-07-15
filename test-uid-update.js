// Test UID-based updates to ensure only one record is updated
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://uqxmnrithfjttfvmbsgj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeG1ucml0aGZqdHRmdm1ic2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDAzNTYsImV4cCI6MjA2ODExNjM1Nn0.8d8qxxGHaM6C2eOR-702mNeoR7Gz1AKC5PwncozZOD4'

async function testUidUpdate() {
  console.log('🔍 Testing UID-based updates...')
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Get a sample case with duplicates
    const { data: duplicateCases, error: fetchError } = await supabase
      .from('CaseData')
      .select('*')
      .eq('Case Number', 'दा.पा./अपील /143/2024')
    
    if (fetchError) {
      console.error('❌ Error fetching cases:', fetchError)
      return
    }
    
    console.log(`📊 Found ${duplicateCases.length} cases with same case number`)
    duplicateCases.forEach((case_, index) => {
      console.log(`   ${index + 1}. UID: ${case_.uid}, Taluka: ${case_.Taluka}, Next Date: ${case_['Next Date']}, Received: ${case_.Received}`)
    })
    
    // Test updating just ONE specific record using UID
    const targetCase = duplicateCases[0]
    const targetUid = targetCase.uid
    
    console.log(`\n🔄 Testing update for specific UID: ${targetUid}`)
    console.log(`📝 This should update ONLY the record with Taluka: ${targetCase.Taluka}, Next Date: ${targetCase['Next Date']}`)
    
    // Update using UID - should only affect one record
    const { data: updateData, error: updateError } = await supabase
      .from('CaseData')
      .update({ 'Received': 'UID टेस्ट' })
      .eq('uid', targetUid)
      .select()
    
    if (updateError) {
      console.error('❌ Update error:', updateError)
      return
    }
    
    console.log(`✅ Update successful! Updated ${updateData.length} record(s)`)
    console.log(`📋 Updated record:`, updateData[0])
    
    // Verify that only one record was updated
    const { data: verifyData, error: verifyError } = await supabase
      .from('CaseData')
      .select('*')
      .eq('Case Number', 'दा.पा./अपील /143/2024')
    
    if (verifyError) {
      console.error('❌ Verify error:', verifyError)
      return
    }
    
    console.log(`\n📊 Verification - All records with same case number:`)
    verifyData.forEach((case_, index) => {
      const isUpdated = case_.Received === 'UID टेस्ट'
      console.log(`   ${index + 1}. UID: ${case_.uid}, Received: ${case_.Received} ${isUpdated ? '← UPDATED' : ''}`)
    })
    
    const updatedCount = verifyData.filter(c => c.Received === 'UID टेस्ट').length
    console.log(`\n🎉 SUCCESS: Only ${updatedCount} out of ${verifyData.length} records was updated!`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testUidUpdate()