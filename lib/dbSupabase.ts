import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Initialize Supabase client using public env vars provided via .env or Vercel settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqxmnrithfjttfvmbsgj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeG1ucml0aGZqdHRmdm1ic2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDAzNTYsImV4cCI6MjA2ODExNjM1Nn0.8d8qxxGHaM6C2eOR-702mNeoR7Gz1AKC5PwncozZOD4'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing')
}

console.log('Supabase config:', { url: supabaseUrl, keyLength: supabaseAnonKey.length })

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export interface CaseRecord {
  id?: number
  "Case Type"?: string
  "Case Number": string
  "Appellant": string
  "Respondent": string
  "Received"?: string
  "Next Date"?: string
  "Taluka": string
  status?: string
  remarks?: string
  created_at?: string
  updated_at?: string
}

// Supabase DB is already provisioned. Skip migrations here.
export async function initializeDatabase() {
  return true
}

// Insert or update cases
export async function upsertCases(cases: CaseRecord[]) {
  if (!cases.length) return { success: true, count: 0, inserted: 0, updated: 0 }
  const { data, error } = await supabase
    .from('legal_cases')
    .upsert(cases, { onConflict: 'case_number' })
    .select()
  if (error) {
    console.error('Error upserting cases:', error)
    return { success: false, error: error.message }
  }
  return { success: true, count: cases.length, inserted: data?.length ?? 0, updated: cases.length - (data?.length ?? 0) }
}

export async function getAllCases(): Promise<CaseRecord[]> {
  console.log('=== getAllCases called ===')
  
  // Get all cases - Supabase has a default limit of 1000, so we need to handle pagination
  let allCases: any[] = []
  let from = 0
  const pageSize = 1000
  
  while (true) {
    const { data, error } = await supabase
      .from('legal_cases')
      .select('*')
      .range(from, from + pageSize - 1)
    
    if (error) {
      console.error('Error fetching cases:', error)
      break
    }
    
    if (!data || data.length === 0) {
      break
    }
    
    allCases = allCases.concat(data)
    console.log(`Fetched ${data.length} cases, total so far: ${allCases.length}`)
    
    // If we got less than pageSize, we've reached the end
    if (data.length < pageSize) {
      break
    }
    
    from += pageSize
  }
  
  console.log('Database query result: Retrieved', allCases.length, 'total cases')
  return allCases as CaseRecord[]
}

export async function getCasesByTaluka(taluka: string): Promise<CaseRecord[]> {
  const { data, error } = await supabase.from('legal_cases').select('*').eq('Taluka', taluka).order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching cases by taluka:', error)
    return []
  }
  return data as CaseRecord[]
}

export async function getCaseStats() {
  const { data, error } = await supabase.from('legal_cases').select('Taluka,Received')
  if (error) {
    console.error('Error fetching stats:', error)
    return { byTaluka: [], total: { total_cases: 0, received_cases: 0, pending_cases: 0 } }
  }
  const byTaluka: any[] = []
  const tally: Record<string, { taluka: string; total_cases: number; received_cases: number; pending_cases: number }> = {}
  let total_cases = 0, received_cases = 0, pending_cases = 0
  for (const row of data!) {
    const t = row.Taluka as string
    if (!tally[t]) tally[t] = { taluka: t, total_cases: 0, received_cases: 0, pending_cases: 0 }
    tally[t].total_cases++
    total_cases++
    if (row.Received === 'प्राप्त') {
      tally[t].received_cases++; received_cases++
    } else if (row.Received !== '----') {
      tally[t].pending_cases++; pending_cases++
    }
  }
  for (const val of Object.values(tally)) byTaluka.push(val)
  return { byTaluka, total: { total_cases, received_cases, pending_cases } }
}

export async function updateCaseField(caseNumber: string, field: string, value: string) {
  console.log(`🔍 CHECKING: Updating case ${caseNumber}, field: ${field}, value: ${value}`)
  
  // First, check how many rows have this case number
  const { data: existingCases, error: checkError } = await supabase
    .from('legal_cases')
    .select('"Case Number", "Appellant", "Respondent"')
    .eq('Case Number', caseNumber)
  
  if (checkError) {
    console.error('❌ Error checking existing cases:', checkError)
    return { success: false, error: checkError.message }
  }
  
  console.log(`🔍 Found ${existingCases?.length || 0} cases with case number "${caseNumber}":`, existingCases)
  
  if (!existingCases || existingCases.length === 0) {
    console.error('❌ No case found with case number:', caseNumber)
    return { success: false, error: 'Case not found' }
  }
  
  if (existingCases.length > 1) {
    console.error('⚠️ DANGER: Multiple cases found with same case number! This will cause data corruption:', existingCases)
    return { success: false, error: `Multiple cases found with case number "${caseNumber}". Cannot safely update.` }
  }
  
  // Don't add updated_at since the column doesn't exist in your table
  const payload: Record<string, any> = {}
  
  // Map frontend field names to your exact database column names
  const fieldMapping: Record<string, string> = {
    'status': 'Received',      // Maps to "Received" column
    'received': 'Received',    // Maps to "Received" column  
    'next_date': 'Next Date',  // Maps to "Next Date" column
    'case_type': 'Case Type'   // Maps to "Case Type" column
  }
  
  const dbField = fieldMapping[field] || field
  payload[dbField] = value
  
  console.log(`📝 Mapped field "${field}" to database field "${dbField}"`)
  console.log(`📝 Update payload:`, payload)
  console.log(`📝 Updating case: ${caseNumber}`)
  
  // Since there's only one case with this number (we checked above), it's safe to update by case number
  const { error, data } = await supabase
    .from('legal_cases')
    .update(payload)
    .eq('Case Number', caseNumber)
    .select()
  
  if (error) {
    console.error('❌ Database update error:', error)
    return { success: false, error: error.message }
  }
  
  console.log(`✅ Successfully updated case ${caseNumber}`)
  console.log(`✅ Updated data:`, data)
  return { success: true, updated: 1 }
}

export async function getCaseByNumber(caseNumber: string): Promise<CaseRecord | null> {
  console.log(`🔍 Looking for case: ${caseNumber}`)
  
  const { data, error } = await supabase.from('legal_cases').select('*').eq('Case Number', caseNumber)
  
  if (error) {
    console.error('❌ Error fetching case by number:', error)
    return null
  }
  
  if (!data || data.length === 0) {
    console.log(`❌ No case found with case number: ${caseNumber}`)
    return null
  }
  
  if (data.length > 1) {
    console.error(`⚠️ DANGER: Multiple cases found with case number "${caseNumber}":`, data)
    // Return the first one but log the issue
    return data[0] as CaseRecord
  }
  
  console.log(`✅ Found unique case: ${caseNumber}`)
  return data[0] as CaseRecord
}

// Function to check for duplicate case numbers in the database
export async function checkForDuplicateCaseNumbers() {
  console.log('🔍 Checking for duplicate case numbers...')
  
  const { data, error } = await supabase
    .from('legal_cases')
    .select('"Case Number", "Appellant", "Respondent"')
  
  if (error) {
    console.error('❌ Error checking for duplicates:', error)
    return { success: false, error: error.message }
  }
  
  // Group by case number
  const caseGroups: Record<string, any[]> = {}
  data?.forEach(case_ => {
    const caseNumber = case_['Case Number']
    if (!caseGroups[caseNumber]) {
      caseGroups[caseNumber] = []
    }
    caseGroups[caseNumber].push(case_)
  })
  
  // Find duplicates
  const duplicates = Object.entries(caseGroups).filter(([_, cases]) => cases.length > 1)
  
  if (duplicates.length > 0) {
    console.error('⚠️ FOUND DUPLICATE CASE NUMBERS:', duplicates)
    return { 
      success: true, 
      hasDuplicates: true, 
      duplicates: duplicates.map(([caseNumber, cases]) => ({
        caseNumber,
        count: cases.length,
        cases
      }))
    }
  }
  
  console.log('✅ No duplicate case numbers found')
  return { success: true, hasDuplicates: false, duplicates: [] }
}
