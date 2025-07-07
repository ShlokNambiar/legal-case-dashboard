import { neon } from '@neondatabase/serverless'

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!)

export interface CaseRecord {
  id?: number
  sr_no: string
  case_number: string
  applicant_name: string
  respondent_name: string
  status: string
  remarks: string
  taluka: string
  created_at?: string
  updated_at?: string
}

// Create tables if they don't exist
export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS legal_cases (
        id SERIAL PRIMARY KEY,
        sr_no VARCHAR(50),
        case_number VARCHAR(100) NOT NULL,
        applicant_name VARCHAR(255) NOT NULL,
        respondent_name VARCHAR(255) NOT NULL,
        status VARCHAR(100),
        remarks TEXT,
        taluka VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
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
    // Clear existing cases (for now - in production you might want to do incremental updates)
    await sql`DELETE FROM legal_cases`
    
    // Insert new cases
    for (const case_ of cases) {
      await sql`
        INSERT INTO legal_cases (
          sr_no, case_number, applicant_name, respondent_name, 
          status, remarks, taluka
        ) VALUES (
          ${case_.sr_no}, ${case_.case_number}, ${case_.applicant_name}, 
          ${case_.respondent_name}, ${case_.status}, ${case_.remarks}, ${case_.taluka}
        )
      `
    }
    
    console.log(`Successfully inserted ${cases.length} cases`)
    return { success: true, count: cases.length }
  } catch (error) {
    console.error('Error upserting cases:', error)
    return { success: false, error: error.message }
  }
}

// Get all cases
export async function getAllCases(): Promise<CaseRecord[]> {
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
