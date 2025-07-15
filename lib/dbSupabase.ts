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
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  
  const { data, error } = await supabase.from('legal_cases').select('*').order('created_at', { ascending: false })
  
  console.log('Database query result:')
  console.log('- Error:', error)
  console.log('- Data length:', data?.length || 0)
  
  if (error) {
    console.error('Error fetching cases:', error)
    return []
  }
  
  console.log('Returning', data?.length || 0, 'cases')
  return data as CaseRecord[]
}

export async function getCasesByTaluka(taluka: string): Promise<CaseRecord[]> {
  const { data, error } = await supabase.from('legal_cases').select('*').eq('taluka', taluka).order('created_at', { ascending: false })
  if (error) {
    console.error('Error fetching cases by taluka:', error)
    return []
  }
  return data as CaseRecord[]
}

export async function getCaseStats() {
  const { data, error } = await supabase.from('legal_cases').select('taluka,status')
  if (error) {
    console.error('Error fetching stats:', error)
    return { byTaluka: [], total: { total_cases: 0, received_cases: 0, pending_cases: 0 } }
  }
  const byTaluka: any[] = []
  const tally: Record<string, { taluka: string; total_cases: number; received_cases: number; pending_cases: number }> = {}
  let total_cases = 0, received_cases = 0, pending_cases = 0
  for (const row of data!) {
    const t = row.taluka as string
    if (!tally[t]) tally[t] = { taluka: t, total_cases: 0, received_cases: 0, pending_cases: 0 }
    tally[t].total_cases++
    total_cases++
    if (row.status === 'प्राप्त') {
      tally[t].received_cases++; received_cases++
    } else if (row.status !== '----') {
      tally[t].pending_cases++; pending_cases++
    }
  }
  for (const val of Object.values(tally)) byTaluka.push(val)
  return { byTaluka, total: { total_cases, received_cases, pending_cases } }
}

export async function updateCaseField(caseNumber: string, field: string, value: string) {
  const payload: Record<string, any> = { updated_at: new Date().toISOString() }
  payload[field] = value
  const { error } = await supabase.from('legal_cases').update(payload).eq('case_number', caseNumber)
  if (error) return { success: false, error: error.message }
  return { success: true, updated: 1 }
}

export async function getCaseByNumber(caseNumber: string): Promise<CaseRecord | null> {
  const { data, error } = await supabase.from('legal_cases').select('*').eq('case_number', caseNumber).maybeSingle<CaseRecord>()
  if (error) {
    console.error('Error fetching case by number:', error)
    return null
  }
  return data ?? null
}
