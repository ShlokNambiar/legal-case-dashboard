#!/usr/bin/env node

/**
 * Safe deduplication script for legal case records
 * 
 * Usage:
 *   node scripts/deduplicate-cases.js preview    # Preview duplicates without deleting
 *   node scripts/deduplicate-cases.js test      # Test on small subset
 *   node scripts/deduplicate-cases.js execute   # Execute deduplication (requires confirmation)
 */

const readline = require('readline')

// Import the deduplication functions
async function importDeduplicationModule() {
  try {
    // Try to import the TypeScript module using ts-node or compiled version
    const { identifyDuplicates, previewDeduplication, executeDeduplication, testDeduplicationOnSubset } = 
      await import('../lib/deduplication.js').catch(async () => {
        // If compiled version doesn't exist, try to use ts-node
        require('ts-node/register')
        return await import('../lib/deduplication.ts')
      })
    
    return { identifyDuplicates, previewDeduplication, executeDeduplication, testDeduplicationOnSubset }
  } catch (error) {
    console.error('❌ Error importing deduplication module:', error.message)
    console.log('💡 Make sure to run: npm install ts-node typescript')
    process.exit(1)
  }
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

function formatDate(dateString) {
  if (!dateString || dateString === '----' || dateString === '-') {
    return 'No date'
  }
  return dateString
}

function displayDuplicateGroup(group, index) {
  console.log(`\n📋 Group ${index + 1}: Case Number "${group.caseNumber}"`)
  console.log(`   Total records: ${group.records.length}`)
  
  console.log(`   ✅ KEEPING (Most Recent):`)
  group.recordsToKeep.forEach(record => {
    console.log(`      • UID: ${record.uid}`)
    console.log(`        Next Date: ${formatDate(record['Next Date'])}`)
    console.log(`        Taluka: ${record.Taluka}`)
    console.log(`        Appellant: ${record.Appellant}`)
  })
  
  console.log(`   🗑️  DELETING (${group.recordsToDelete.length} older records):`)
  group.recordsToDelete.forEach((record, idx) => {
    console.log(`      ${idx + 1}. UID: ${record.uid}`)
    console.log(`         Next Date: ${formatDate(record['Next Date'])}`)
    console.log(`         Taluka: ${record.Taluka}`)
    console.log(`         Appellant: ${record.Appellant}`)
  })
}

async function previewMode() {
  console.log('👀 PREVIEW MODE - No data will be deleted')
  console.log('=' .repeat(60))
  
  const { previewDeduplication } = await importDeduplicationModule()
  const result = await previewDeduplication()
  
  if (!result.success) {
    console.error('❌ Error during preview:', result.error)
    return
  }
  
  if (result.totalDuplicateGroups === 0) {
    console.log('✅ No duplicate records found!')
    return
  }
  
  console.log(`📊 DEDUPLICATION PREVIEW SUMMARY:`)
  console.log(`   Duplicate groups found: ${result.totalDuplicateGroups}`)
  console.log(`   Total records involved: ${result.totalRecordsProcessed}`)
  console.log(`   Records to be deleted: ${result.totalRecordsDeleted}`)
  console.log(`   Records to be kept: ${result.totalRecordsKept}`)
  
  // Show first 5 groups in detail
  const groupsToShow = Math.min(5, result.duplicateGroups.length)
  console.log(`\n📋 Showing first ${groupsToShow} duplicate groups:`)
  
  for (let i = 0; i < groupsToShow; i++) {
    displayDuplicateGroup(result.duplicateGroups[i], i)
  }
  
  if (result.duplicateGroups.length > 5) {
    console.log(`\n... and ${result.duplicateGroups.length - 5} more groups`)
  }
  
  console.log(`\n💡 To execute deduplication, run: node scripts/deduplicate-cases.js execute`)
}

async function testMode() {
  console.log('🧪 TEST MODE - Testing on small subset')
  console.log('=' .repeat(60))
  
  const { testDeduplicationOnSubset } = await importDeduplicationModule()
  const result = await testDeduplicationOnSubset(3)
  
  if (!result.success) {
    console.error('❌ Error during test:', result.error)
    return
  }
  
  if (result.totalDuplicateGroups === 0) {
    console.log('✅ No duplicate records found for testing!')
    return
  }
  
  console.log(`📊 TEST RESULTS:`)
  console.log(`   Test groups: ${result.totalDuplicateGroups}`)
  console.log(`   Records involved: ${result.totalRecordsProcessed}`)
  console.log(`   Would delete: ${result.totalRecordsDeleted}`)
  console.log(`   Would keep: ${result.totalRecordsKept}`)
  
  result.duplicateGroups.forEach((group, index) => {
    displayDuplicateGroup(group, index)
  })
  
  console.log(`\n✅ Test completed successfully!`)
  console.log(`💡 The deduplication logic is working correctly.`)
}

async function executeMode() {
  console.log('🚨 EXECUTE MODE - This will DELETE duplicate records!')
  console.log('=' .repeat(60))
  
  const rl = createReadlineInterface()
  
  try {
    // First show preview
    console.log('📊 First, let\'s preview what will be deleted...\n')
    await previewMode()
    
    console.log('\n' + '⚠️ '.repeat(20))
    console.log('🚨 WARNING: This operation will PERMANENTLY DELETE duplicate records!')
    console.log('⚠️ '.repeat(20))
    
    const confirm1 = await askQuestion(rl, '\n❓ Do you want to proceed with deletion? (type "yes" to continue): ')
    
    if (confirm1.toLowerCase() !== 'yes') {
      console.log('✅ Operation cancelled by user')
      return
    }
    
    const confirm2 = await askQuestion(rl, '❓ Are you absolutely sure? This cannot be undone! (type "DELETE_DUPLICATES" to confirm): ')
    
    if (confirm2 !== 'DELETE_DUPLICATES') {
      console.log('✅ Operation cancelled - confirmation phrase not matched')
      return
    }
    
    console.log('\n🚀 Executing deduplication...')
    
    const { executeDeduplication } = await importDeduplicationModule()
    const result = await executeDeduplication('CONFIRM_DELETE_DUPLICATES')
    
    if (!result.success) {
      console.error('❌ Deduplication failed:', result.error)
      return
    }
    
    console.log('\n🎉 DEDUPLICATION COMPLETED SUCCESSFULLY!')
    console.log('=' .repeat(60))
    console.log(`📊 FINAL RESULTS:`)
    console.log(`   Duplicate groups processed: ${result.totalDuplicateGroups}`)
    console.log(`   Total records processed: ${result.totalRecordsProcessed}`)
    console.log(`   Records deleted: ${result.totalRecordsDeleted}`)
    console.log(`   Records kept: ${result.totalRecordsKept}`)
    
    if (result.totalRecordsDeleted > 0) {
      console.log(`\n✅ Successfully removed ${result.totalRecordsDeleted} duplicate records!`)
      console.log(`✅ Database now has unique case records only.`)
    }
    
  } finally {
    rl.close()
  }
}

async function main() {
  const mode = process.argv[2]
  
  console.log('🏛️  Legal Case Dashboard - Deduplication Tool')
  console.log('=' .repeat(60))
  
  switch (mode) {
    case 'preview':
      await previewMode()
      break
      
    case 'test':
      await testMode()
      break
      
    case 'execute':
      await executeMode()
      break
      
    default:
      console.log('❓ Usage:')
      console.log('   node scripts/deduplicate-cases.js preview    # Preview duplicates')
      console.log('   node scripts/deduplicate-cases.js test      # Test on small subset')
      console.log('   node scripts/deduplicate-cases.js execute   # Execute deduplication')
      console.log('')
      console.log('💡 Start with "preview" to see what duplicates exist.')
      process.exit(1)
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})

// Run the script
main().catch(console.error)
