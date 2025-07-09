// API utility functions for case management

export interface UpdateCaseFieldRequest {
  field: 'status' | 'received' | 'next_date' | 'case_type'
  value: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  data?: T
}

// Update a specific field of a case
export async function updateCaseField(
  caseNumber: string, 
  field: UpdateCaseFieldRequest['field'], 
  value: string
): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/cases/${encodeURIComponent(caseNumber)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ field, value }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      }
    }

    return {
      success: true,
      message: data.message,
      data: data,
    }
  } catch (error) {
    console.error('Error updating case field:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Get a specific case
export async function getCase(caseNumber: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`/api/cases/${encodeURIComponent(caseNumber)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      }
    }

    return {
      success: true,
      data: data.case,
    }
  } catch (error) {
    console.error('Error fetching case:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Refresh all cases data
export async function refreshCasesData(): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/update-cases', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      }
    }

    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Error refreshing cases data:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
