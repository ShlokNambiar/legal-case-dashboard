import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Initialize Supabase client (public anon key is sufficient for our operations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export interface CaseRecord {
  id?: number
  sr_no: string
  case_number: string
  case_type?: string
  applicant_name: string
  respondent_name: string
  received?: string
  next_date?: string
  status: string
  remarks: string
  taluka: string
  created_at?: string
  updated_at?: string
}

// Supabase projects are provisioned with Postgres already. We assume the table `legal_cases` exists and has the correct schema.
// If you need to create or migrate the table, do it once in the Supabase dashboard with SQL editor / migration scripts.
export async function initializeDatabase() {
  return true // no-op for Supabase
}
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS legal_cases (
        id SERIAL PRIMARY KEY,
        sr_no VARCHAR(50),
        case_number VARCHAR(100) NOT NULL,
        case_type VARCHAR(100),
        applicant_name VARCHAR(255) NOT NULL,
        respondent_name VARCHAR(255) NOT NULL,
        received VARCHAR(100),
        next_date DATE,
        status TEXT,
        remarks TEXT,
        taluka VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Add missing columns if they don't exist
    try {
      await sql`ALTER TABLE legal_cases ADD COLUMN IF NOT EXISTS case_type VARCHAR(100)`
      await sql`ALTER TABLE legal_cases ADD COLUMN IF NOT EXISTS next_date DATE`
      await sql`ALTER TABLE legal_cases ADD COLUMN IF NOT EXISTS received VARCHAR(100)`
      // Change status to TEXT to allow longer status messages
      await sql`ALTER TABLE legal_cases ALTER COLUMN status TYPE TEXT`
    } catch (alterError) {
      console.log('Some columns may already exist:', alterError.message)
    }

    // Create index for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_legal_cases_taluka ON legal_cases(taluka)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_legal_cases_case_number ON legal_cases(case_number)
    `

    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
}

// Insert or update cases
export async function upsertCases(cases: CaseRecord[]) {
  try {
    if (cases.length === 0) {
      return { success: true, count: 0, inserted: 0, updated: 0 }
    }

    // Supabase upsert will insert new rows or update existing rows that conflict on `case_number`
    const { data, error } = await supabase
      .from('legal_cases')
      .upsert(cases, { onConflict: 'case_number' })
      .select()

    if (error) throw error

    return { success: true, count: cases.length, inserted: data?.length ?? 0, updated: cases.length - (data?.length ?? 0) }
  } catch (error: any) {
    console.error('Error upserting cases:', error)
    return { success: false, error: error.message }
  }
}
  try {
    let insertedCount = 0
    let updatedCount = 0

    // Process each case individually with proper UPSERT
    for (const case_ of cases) {
      // Check if case already exists
      const existingCase = await sql`
        SELECT id, status, received, next_date FROM legal_cases
        WHERE case_number = ${case_.case_number}
      `

      if (existingCase.length > 0) {
        // Update existing case (preserve user edits for status, received, next_date)
        await sql`
          UPDATE legal_cases SET
            sr_no = ${case_.sr_no},
            case_type = ${case_.case_type || 'अपील'},
            applicant_name = ${case_.applicant_name},
            respondent_name = ${case_.respondent_name},
            remarks = ${case_.remarks || ''},
            taluka = ${case_.taluka},
            updated_at = CURRENT_TIMESTAMP
          WHERE case_number = ${case_.case_number}
        `
        updatedCount++
      } else {
        // Insert new case
        await sql`
          INSERT INTO legal_cases (
            sr_no, case_number, case_type, applicant_name, respondent_name,
            received, next_date, status, remarks, taluka
          ) VALUES (
            ${case_.sr_no}, ${case_.case_number}, ${case_.case_type || 'अपील'},
            ${case_.applicant_name}, ${case_.respondent_name},
            ${case_.received || 'प्राप्त'}, ${case_.next_date || '2025-07-17'},
            ${case_.status || ''}, ${case_.remarks || ''}, ${case_.taluka}
          )
        `
        insertedCount++
      }
    }

    console.log(`Successfully processed ${cases.length} cases: ${insertedCount} inserted, ${updatedCount} updated`)
    return { success: true, count: cases.length, inserted: insertedCount, updated: updatedCount }
  } catch (error) {
    console.error('Error upserting cases:', error)
    return { success: false, error: error.message }
  }
}

// Get all cases
export async function getAllCases(): Promise<CaseRecord[]> {
  const { data, error } = await supabase
    .from('legal_cases')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching cases:', error)
    return []
  }
  return (data ?? []) as CaseRecord[]
}
  try {
    const cases = await sql`
      SELECT * FROM legal_cases
      ORDER BY created_at DESC
    `
    return cases as CaseRecord[]
  } catch (error) {
    console.error('Error fetching cases:', error)
    return []
  }
}

// Get cases by taluka
export async function getCasesByTaluka(taluka: string): Promise<CaseRecord[]> {
  const { data, error } = await supabase
    .from('legal_cases')
    .select('*')
    .eq('taluka', taluka)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching cases by taluka:', error)
    return []
  }
  return (data ?? []) as CaseRecord[]
}
  try {
    const cases = await sql`
      SELECT * FROM legal_cases
      WHERE taluka = ${taluka}
      ORDER BY created_at DESC
    `
    return cases as CaseRecord[]
  } catch (error) {
    console.error('Error fetching cases by taluka:', error)
    return []
  }
}

// Get case statistics
export async function getCaseStats() {
  const { data, error } = await supabase.from('legal_cases').select('taluka,status')
  if (error) {
    console.error('Error fetching case stats:', error)
    return { byTaluka: [], total: { total_cases: 0, received_cases: 0, pending_cases: 0 } }
  }
  // compute stats in JS
  const byTaluka: any[] = []
  const talukaMap: Record<string, { taluka: string; total_cases: number; received_cases: number; pending_cases: number }> = {}
  let total_cases = 0,
    received_cases = 0,
    pending_cases = 0
  for (const row of data!) {
    const t = row.taluka as string
    if (!talukaMap[t]) {
      talukaMap[t] = { taluka: t, total_cases: 0, received_cases: 0, pending_cases: 0 }
    }
    talukaMap[t].total_cases++
    total_cases++
    if (row.status === 'प्राप्त') {
      talukaMap[t].received_cases++
      received_cases++
    } else if (row.status !== '----') {
      talukaMap[t].pending_cases++
      pending_cases++
    }
  }
  for (const k of Object.keys(talukaMap)) {
    byTaluka.push(talukaMap[k])
  }
  return { byTaluka, total: { total_cases, received_cases, pending_cases } }
}
  try {
    const stats = await sql`
      SELECT
        taluka,
        COUNT(*) as total_cases,
        COUNT(CASE WHEN status = 'प्राप्त' THEN 1 END) as received_cases,
        COUNT(CASE WHEN status != 'प्राप्त' AND status != '----' THEN 1 END) as pending_cases
      FROM legal_cases
      GROUP BY taluka
    `

    const totalStats = await sql`
      SELECT
        COUNT(*) as total_cases,
        COUNT(CASE WHEN status = 'प्राप्त' THEN 1 END) as received_cases,
        COUNT(CASE WHEN status != 'प्राप्त' AND status != '----' THEN 1 END) as pending_cases
      FROM legal_cases
    `

    return {
      byTaluka: stats,
      total: totalStats[0]
    }
  } catch (error) {
    console.error('Error fetching case stats:', error)
    return { byTaluka: [], total: { total_cases: 0, received_cases: 0, pending_cases: 0 } }
  }
}

// Update individual case fields
export async function updateCaseField(caseNumber: string, field: string, value: string) {
  try {
    const updatePayload: Record<string, any> = { updated_at: new Date().toISOString() }
    updatePayload[field] = value

    const { error } = await supabase
      .from('legal_cases')
      .update(updatePayload)
      .eq('case_number', caseNumber)

    if (error) throw error
    return { success: true, updated: 1 }
  } catch (error: any) {
    console.error(`Error updating case ${caseNumber} field ${field}:`, error)
    return { success: false, error: error.message }
  }
}
  try {
    let query
    switch (field) {
      case 'status':
        query = sql`
          UPDATE legal_cases
          SET status = ${value}, updated_at = CURRENT_TIMESTAMP
          WHERE case_number = ${caseNumber}
        `
        break
      case 'received':
        query = sql`
          UPDATE legal_cases
          SET received = ${value}, updated_at = CURRENT_TIMESTAMP
          WHERE case_number = ${caseNumber}
        `
        break
      case 'next_date':
        query = sql`
          UPDATE legal_cases
          SET next_date = ${value}, updated_at = CURRENT_TIMESTAMP
          WHERE case_number = ${caseNumber}
        `
        break
      case 'case_type':
        query = sql`
          UPDATE legal_cases
          SET case_type = ${value}, updated_at = CURRENT_TIMESTAMP
          WHERE case_number = ${caseNumber}
        `
        break
      default:
        throw new Error(`Invalid field: ${field}`)
    }

    const result = await query
    console.log(`Updated case ${caseNumber} field ${field} to ${value}`)
    return { success: true, updated: result.count || 0 }
  } catch (error) {
    console.error(`Error updating case ${caseNumber} field ${field}:`, error)
    return { success: false, error: error.message }
  }
}

// Get a specific case by case number
export async function getCaseByNumber(caseNumber: string): Promise<CaseRecord | null> {
  const { data, error } = await supabase
    .from('legal_cases')
    .select('*')
    .eq('case_number', caseNumber)
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error('Error fetching case by number:', error)
    return null
  }
  return data as CaseRecord | null
}
  try {
    const cases = await sql`
      SELECT * FROM legal_cases
      WHERE case_number = ${caseNumber}
      LIMIT 1
    `
    return cases.length > 0 ? cases[0] as CaseRecord : null
  } catch (error) {
    console.error('Error fetching case by number:', error)
    return null
  }
}
