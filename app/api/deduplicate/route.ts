import { NextRequest, NextResponse } from 'next/server'
import { identifyDuplicates, previewDeduplication, executeDeduplication, testDeduplicationOnSubset } from '@/lib/deduplication'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') || 'preview'
  const maxGroups = parseInt(searchParams.get('maxGroups') || '10')

  try {
    let result

    switch (mode) {
      case 'preview':
        console.log('=== API: Preview deduplication ===')
        result = await previewDeduplication()
        break

      case 'test':
        console.log(`=== API: Test deduplication (max ${maxGroups} groups) ===`)
        result = await testDeduplicationOnSubset(maxGroups)
        break

      case 'identify':
        console.log('=== API: Identify duplicates ===')
        const identifyResult = await identifyDuplicates()
        result = {
          success: identifyResult.success,
          totalDuplicateGroups: identifyResult.duplicateGroups.length,
          totalRecordsProcessed: identifyResult.duplicateGroups.reduce((sum, group) => sum + group.records.length, 0),
          totalRecordsDeleted: identifyResult.duplicateGroups.reduce((sum, group) => sum + group.recordsToDelete.length, 0),
          totalRecordsKept: identifyResult.duplicateGroups.reduce((sum, group) => sum + group.recordsToKeep.length, 0),
          duplicateGroups: identifyResult.duplicateGroups,
          error: identifyResult.error
        }
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid mode. Use: preview, test, or identify'
        }, { status: 400 })
    }

    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('Error in deduplication API:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process deduplication request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, confirmationToken } = body

    if (action !== 'execute') {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Only "execute" is supported for POST requests.'
      }, { status: 400 })
    }

    console.log('=== API: Execute deduplication ===')
    console.log('⚠️ WARNING: This will delete duplicate records!')

    const result = await executeDeduplication(confirmationToken)

    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error) {
    console.error('Error executing deduplication:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to execute deduplication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
