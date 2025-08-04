import { supabase } from './dbSupabase'
import { CaseRecord } from './dbSupabase'

/**
 * Comprehensive deduplication system for legal case records
 * Removes duplicate case records while preserving the most recent version
 */

interface DuplicateGroup {
  caseNumber: string
  records: CaseRecord[]
  recordsToKeep: CaseRecord[]
  recordsToDelete: CaseRecord[]
}

interface DeduplicationResult {
  success: boolean
  totalDuplicateGroups: number
  totalRecordsProcessed: number
  totalRecordsDeleted: number
  totalRecordsKept: number
  duplicateGroups: DuplicateGroup[]
  error?: string
}

/**
 * Parse various date formats and return a Date object for comparison
 * Handles: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, and other formats
 */
function parseDate(dateString: string | null | undefined): Date {
  if (!dateString || dateString.trim() === '' || dateString === '----' || dateString === '-') {
    // Return a very old date for empty/invalid dates so they get deprioritized
    return new Date('1900-01-01')
  }

  const cleanDate = dateString.trim()
  
  // Try different date formats
  const formats = [
    // DD/MM/YYYY or DD-MM-YYYY
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
    // YYYY-MM-DD
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
    // DD/MM/YY or DD-MM-YY
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/
  ]

  for (const format of formats) {
    const match = cleanDate.match(format)
    if (match) {
      if (format === formats[0] || format === formats[2]) {
        // DD/MM/YYYY or DD/MM/YY format
        const day = parseInt(match[1])
        const month = parseInt(match[2]) - 1 // JavaScript months are 0-indexed
        let year = parseInt(match[3])
        
        // Handle 2-digit years
        if (year < 100) {
          year += year < 50 ? 2000 : 1900
        }
        
        const date = new Date(year, month, day)
        if (!isNaN(date.getTime())) {
          return date
        }
      } else if (format === formats[1]) {
        // YYYY-MM-DD format
        const year = parseInt(match[1])
        const month = parseInt(match[2]) - 1
        const day = parseInt(match[3])
        
        const date = new Date(year, month, day)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }
  }

  // Try parsing as-is
  const directParse = new Date(cleanDate)
  if (!isNaN(directParse.getTime())) {
    return directParse
  }

  // If all else fails, return a very old date
  console.warn(`⚠️ Could not parse date: "${dateString}", treating as very old date`)
  return new Date('1900-01-01')
}

/**
 * Identify duplicate case records grouped by case number
 */
export async function identifyDuplicates(): Promise<{ success: boolean; duplicateGroups: DuplicateGroup[]; error?: string }> {
  console.log('🔍 Identifying duplicate case records...')
  
  try {
    // Fetch all cases with required fields
    const { data: allCases, error } = await supabase
      .from('CaseData')
      .select('uid, "Case Number", "Appellant", "Respondent", "Received", "Next Date", "Taluka", "Case Type"')
    
    if (error) {
      console.error('❌ Error fetching cases:', error)
      return { success: false, duplicateGroups: [], error: error.message }
    }

    if (!allCases || allCases.length === 0) {
      console.log('📊 No cases found in database')
      return { success: true, duplicateGroups: [] }
    }

    console.log(`📊 Analyzing ${allCases.length} total cases for duplicates...`)

    // Group cases by case number
    const caseGroups: Record<string, CaseRecord[]> = {}
    
    allCases.forEach(caseRecord => {
      const caseNumber = caseRecord['Case Number']
      if (!caseNumber) {
        console.warn('⚠️ Found case without case number:', caseRecord)
        return
      }
      
      if (!caseGroups[caseNumber]) {
        caseGroups[caseNumber] = []
      }
      caseGroups[caseNumber].push(caseRecord as CaseRecord)
    })

    // Find groups with duplicates (more than 1 record)
    const duplicateGroups: DuplicateGroup[] = []
    
    Object.entries(caseGroups).forEach(([caseNumber, records]) => {
      if (records.length > 1) {
        // Sort records by Next Date (most recent first)
        const sortedRecords = [...records].sort((a, b) => {
          const dateA = parseDate(a['Next Date'])
          const dateB = parseDate(b['Next Date'])
          return dateB.getTime() - dateA.getTime() // Descending order (newest first)
        })

        // Keep the first record (most recent), delete the rest
        const recordsToKeep = [sortedRecords[0]]
        const recordsToDelete = sortedRecords.slice(1)

        duplicateGroups.push({
          caseNumber,
          records: sortedRecords,
          recordsToKeep,
          recordsToDelete
        })
      }
    })

    console.log(`✅ Found ${duplicateGroups.length} case numbers with duplicates`)
    
    // Log summary
    let totalRecordsToDelete = 0
    duplicateGroups.forEach(group => {
      totalRecordsToDelete += group.recordsToDelete.length
      console.log(`📋 "${group.caseNumber}": ${group.records.length} records, keeping 1, deleting ${group.recordsToDelete.length}`)
    })

    console.log(`📊 Summary: ${totalRecordsToDelete} duplicate records will be deleted`)

    return { success: true, duplicateGroups }
    
  } catch (error) {
    console.error('❌ Error identifying duplicates:', error)
    return { 
      success: false, 
      duplicateGroups: [], 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Preview deduplication without actually deleting records
 */
export async function previewDeduplication(): Promise<DeduplicationResult> {
  console.log('👀 Previewing deduplication (no actual deletions)...')
  
  const { success, duplicateGroups, error } = await identifyDuplicates()
  
  if (!success) {
    return {
      success: false,
      totalDuplicateGroups: 0,
      totalRecordsProcessed: 0,
      totalRecordsDeleted: 0,
      totalRecordsKept: 0,
      duplicateGroups: [],
      error
    }
  }

  const totalRecordsProcessed = duplicateGroups.reduce((sum, group) => sum + group.records.length, 0)
  const totalRecordsDeleted = duplicateGroups.reduce((sum, group) => sum + group.recordsToDelete.length, 0)
  const totalRecordsKept = duplicateGroups.reduce((sum, group) => sum + group.recordsToKeep.length, 0)

  return {
    success: true,
    totalDuplicateGroups: duplicateGroups.length,
    totalRecordsProcessed,
    totalRecordsDeleted,
    totalRecordsKept,
    duplicateGroups
  }
}

/**
 * Execute deduplication by deleting duplicate records
 * DANGER: This actually deletes data from the database
 */
export async function executeDeduplication(confirmationToken: string): Promise<DeduplicationResult> {
  // Safety check - require explicit confirmation
  if (confirmationToken !== 'CONFIRM_DELETE_DUPLICATES') {
    return {
      success: false,
      totalDuplicateGroups: 0,
      totalRecordsProcessed: 0,
      totalRecordsDeleted: 0,
      totalRecordsKept: 0,
      duplicateGroups: [],
      error: 'Invalid confirmation token. Use "CONFIRM_DELETE_DUPLICATES" to proceed.'
    }
  }

  console.log('🚨 EXECUTING DEDUPLICATION - DELETING DUPLICATE RECORDS!')

  const { success, duplicateGroups, error } = await identifyDuplicates()

  if (!success) {
    return {
      success: false,
      totalDuplicateGroups: 0,
      totalRecordsProcessed: 0,
      totalRecordsDeleted: 0,
      totalRecordsKept: 0,
      duplicateGroups: [],
      error
    }
  }

  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicates found - nothing to delete')
    return {
      success: true,
      totalDuplicateGroups: 0,
      totalRecordsProcessed: 0,
      totalRecordsDeleted: 0,
      totalRecordsKept: 0,
      duplicateGroups: []
    }
  }

  let totalDeleted = 0
  let totalKept = 0
  const processedGroups: DuplicateGroup[] = []

  // Process each duplicate group
  for (const group of duplicateGroups) {
    console.log(`\n🔄 Processing case: "${group.caseNumber}"`)
    console.log(`   Total records: ${group.records.length}`)
    console.log(`   Keeping: 1 record (Next Date: ${group.recordsToKeep[0]['Next Date']})`)
    console.log(`   Deleting: ${group.recordsToDelete.length} records`)

    // Log records to be deleted
    group.recordsToDelete.forEach((record, index) => {
      console.log(`   🗑️  Delete ${index + 1}: UID ${record.uid}, Next Date: ${record['Next Date']}, Taluka: ${record.Taluka}`)
    })

    // Delete duplicate records by UID
    const uidsToDelete = group.recordsToDelete
      .filter(record => record.uid)
      .map(record => record.uid!)

    if (uidsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('CaseData')
        .delete()
        .in('uid', uidsToDelete)

      if (deleteError) {
        console.error(`❌ Error deleting duplicates for case "${group.caseNumber}":`, deleteError)
        // Continue with other groups even if one fails
      } else {
        console.log(`✅ Successfully deleted ${uidsToDelete.length} duplicate records`)
        totalDeleted += uidsToDelete.length
        totalKept += group.recordsToKeep.length
        processedGroups.push(group)
      }
    }
  }

  const totalRecordsProcessed = duplicateGroups.reduce((sum, group) => sum + group.records.length, 0)

  console.log(`\n🎉 Deduplication completed!`)
  console.log(`   Duplicate groups processed: ${processedGroups.length}`)
  console.log(`   Total records processed: ${totalRecordsProcessed}`)
  console.log(`   Records deleted: ${totalDeleted}`)
  console.log(`   Records kept: ${totalKept}`)

  return {
    success: true,
    totalDuplicateGroups: processedGroups.length,
    totalRecordsProcessed,
    totalRecordsDeleted: totalDeleted,
    totalRecordsKept: totalKept,
    duplicateGroups: processedGroups
  }
}

/**
 * Test deduplication on a small subset of data
 */
export async function testDeduplicationOnSubset(maxGroups: number = 3): Promise<DeduplicationResult> {
  console.log(`🧪 Testing deduplication on subset (max ${maxGroups} groups)...`)

  const { success, duplicateGroups, error } = await identifyDuplicates()

  if (!success) {
    return {
      success: false,
      totalDuplicateGroups: 0,
      totalRecordsProcessed: 0,
      totalRecordsDeleted: 0,
      totalRecordsKept: 0,
      duplicateGroups: [],
      error
    }
  }

  // Take only the first few groups for testing
  const testGroups = duplicateGroups.slice(0, maxGroups)

  if (testGroups.length === 0) {
    console.log('✅ No duplicates found for testing')
    return {
      success: true,
      totalDuplicateGroups: 0,
      totalRecordsProcessed: 0,
      totalRecordsDeleted: 0,
      totalRecordsKept: 0,
      duplicateGroups: []
    }
  }

  console.log(`🔍 Testing with ${testGroups.length} duplicate groups:`)
  testGroups.forEach(group => {
    console.log(`   "${group.caseNumber}": ${group.records.length} records`)
  })

  // For testing, we'll just preview without actually deleting
  const totalRecordsProcessed = testGroups.reduce((sum, group) => sum + group.records.length, 0)
  const totalRecordsDeleted = testGroups.reduce((sum, group) => sum + group.recordsToDelete.length, 0)
  const totalRecordsKept = testGroups.reduce((sum, group) => sum + group.recordsToKeep.length, 0)

  return {
    success: true,
    totalDuplicateGroups: testGroups.length,
    totalRecordsProcessed,
    totalRecordsDeleted,
    totalRecordsKept,
    duplicateGroups: testGroups
  }
}
