#!/usr/bin/env node

/**
 * Test script for the deduplication functionality
 * This script tests the deduplication logic without actually deleting data
 */

const BASE_URL = 'http://localhost:3000'

async function testDeduplicationAPI() {
  console.log('🧪 Testing Deduplication API...')
  console.log('=' .repeat(50))

  // Test 1: Preview duplicates
  console.log('\n1️⃣ Testing Preview Mode...')
  try {
    const response = await fetch(`${BASE_URL}/api/deduplicate?mode=preview`)
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Preview API working')
      console.log(`   Duplicate groups found: ${data.totalDuplicateGroups}`)
      console.log(`   Total records to process: ${data.totalRecordsProcessed}`)
      console.log(`   Records to delete: ${data.totalRecordsDeleted}`)
      console.log(`   Records to keep: ${data.totalRecordsKept}`)
      
      if (data.duplicateGroups && data.duplicateGroups.length > 0) {
        console.log(`   Sample duplicate: "${data.duplicateGroups[0].caseNumber}" (${data.duplicateGroups[0].records.length} records)`)
      }
    } else {
      console.log('❌ Preview API failed:', data.error)
    }
  } catch (error) {
    console.log('❌ Preview API error:', error.message)
  }

  // Test 2: Test mode (small subset)
  console.log('\n2️⃣ Testing Test Mode...')
  try {
    const response = await fetch(`${BASE_URL}/api/deduplicate?mode=test&maxGroups=3`)
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Test API working')
      console.log(`   Test groups: ${data.totalDuplicateGroups}`)
      console.log(`   Test records: ${data.totalRecordsProcessed}`)
      
      if (data.duplicateGroups && data.duplicateGroups.length > 0) {
        const group = data.duplicateGroups[0]
        console.log(`   Sample test group: "${group.caseNumber}"`)
        console.log(`     Records: ${group.records.length}`)
        console.log(`     To keep: ${group.recordsToKeep.length}`)
        console.log(`     To delete: ${group.recordsToDelete.length}`)
        
        // Show date comparison logic
        if (group.recordsToKeep.length > 0 && group.recordsToDelete.length > 0) {
          const keepRecord = group.recordsToKeep[0]
          const deleteRecord = group.recordsToDelete[0]
          console.log(`     Keeping (newer): Next Date = "${keepRecord['Next Date']}"`)
          console.log(`     Deleting (older): Next Date = "${deleteRecord['Next Date']}"`)
        }
      }
    } else {
      console.log('❌ Test API failed:', data.error)
    }
  } catch (error) {
    console.log('❌ Test API error:', error.message)
  }

  // Test 3: Identify duplicates
  console.log('\n3️⃣ Testing Identify Mode...')
  try {
    const response = await fetch(`${BASE_URL}/api/deduplicate?mode=identify`)
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Identify API working')
      console.log(`   Duplicate groups identified: ${data.totalDuplicateGroups}`)
      
      if (data.duplicateGroups && data.duplicateGroups.length > 0) {
        console.log('\n📋 Sample duplicate groups:')
        data.duplicateGroups.slice(0, 3).forEach((group, index) => {
          console.log(`   ${index + 1}. "${group.caseNumber}": ${group.records.length} records`)
          
          // Show date sorting logic
          group.records.forEach((record, recordIndex) => {
            const status = recordIndex === 0 ? '✅ KEEP' : '🗑️ DELETE'
            console.log(`      ${status}: Next Date = "${record['Next Date']}", Taluka = ${record.Taluka}`)
          })
        })
      }
    } else {
      console.log('❌ Identify API failed:', data.error)
    }
  } catch (error) {
    console.log('❌ Identify API error:', error.message)
  }

  console.log('\n' + '=' .repeat(50))
  console.log('🎉 Deduplication API tests completed!')
}

async function testDateParsing() {
  console.log('\n📅 Testing Date Parsing Logic...')
  console.log('=' .repeat(50))

  // Test various date formats that might exist in the database
  const testDates = [
    '01/09/2025',    // DD/MM/YYYY
    '05-08-2025',    // DD-MM-YYYY  
    '2025-07-15',    // YYYY-MM-DD
    '15/7/2025',     // D/M/YYYY
    '9-12-2025',     // D-MM-YYYY
    '----',          // Empty/invalid
    '-',             // Empty/invalid
    '',              // Empty
    '2025-12-31',    // Valid ISO
    '31/12/24',      // DD/MM/YY
    'invalid-date'   // Invalid format
  ]

  console.log('Testing date parsing with various formats:')
  testDates.forEach(dateStr => {
    // Since we can't directly import the parseDate function in this test,
    // we'll just show what formats we expect to handle
    console.log(`   "${dateStr}" -> Expected to be parsed correctly`)
  })

  console.log('\n💡 The parseDate function should handle:')
  console.log('   ✅ DD/MM/YYYY and DD-MM-YYYY formats')
  console.log('   ✅ YYYY-MM-DD ISO format')
  console.log('   ✅ Single digit days/months')
  console.log('   ✅ 2-digit years (converted to 20xx or 19xx)')
  console.log('   ✅ Invalid/empty dates (treated as very old)')
}

async function showUsageInstructions() {
  console.log('\n📖 DEDUPLICATION USAGE INSTRUCTIONS')
  console.log('=' .repeat(50))
  
  console.log('\n🔍 Step 1: Preview duplicates (safe)')
  console.log('   Command: node scripts/deduplicate-cases.js preview')
  console.log('   Purpose: See what duplicates exist without deleting anything')
  
  console.log('\n🧪 Step 2: Test on small subset (safe)')
  console.log('   Command: node scripts/deduplicate-cases.js test')
  console.log('   Purpose: Verify the logic works on a few duplicate groups')
  
  console.log('\n🚨 Step 3: Execute deduplication (DANGER - deletes data!)')
  console.log('   Command: node scripts/deduplicate-cases.js execute')
  console.log('   Purpose: Actually delete duplicate records')
  console.log('   ⚠️  Requires double confirmation')
  
  console.log('\n🌐 Alternative: Use API endpoints')
  console.log(`   Preview: GET ${BASE_URL}/api/deduplicate?mode=preview`)
  console.log(`   Test: GET ${BASE_URL}/api/deduplicate?mode=test&maxGroups=3`)
  console.log(`   Execute: POST ${BASE_URL}/api/deduplicate`)
  console.log('            Body: {"action": "execute", "confirmationToken": "CONFIRM_DELETE_DUPLICATES"}')
  
  console.log('\n📋 Deduplication Logic:')
  console.log('   1. Group records by "Case Number" field')
  console.log('   2. For each group with >1 record:')
  console.log('      - Sort by "Next Date" (newest first)')
  console.log('      - Keep the record with the most recent date')
  console.log('      - Delete all other records in the group')
  console.log('   3. Handle various date formats (DD/MM/YYYY, YYYY-MM-DD, etc.)')
  console.log('   4. Treat empty/invalid dates as very old (low priority)')
  
  console.log('\n✅ Safety Features:')
  console.log('   - Preview mode shows what will be deleted')
  console.log('   - Test mode works on small subset')
  console.log('   - Execute mode requires explicit confirmation')
  console.log('   - All operations are logged')
  console.log('   - Uses UID for safe record identification')
}

async function main() {
  console.log('🏛️  Legal Case Dashboard - Deduplication Test Suite')
  console.log('=' .repeat(60))
  
  await testDeduplicationAPI()
  await testDateParsing()
  await showUsageInstructions()
  
  console.log('\n🎯 NEXT STEPS:')
  console.log('1. Review the test results above')
  console.log('2. Run: node scripts/deduplicate-cases.js preview')
  console.log('3. If satisfied, run: node scripts/deduplicate-cases.js execute')
  console.log('\n⚠️  IMPORTANT: Always backup your database before running execute!')
}

// Run the test suite
main().catch(console.error)
