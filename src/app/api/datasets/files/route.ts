import { NextRequest, NextResponse } from 'next/server'
import { DatasetService } from '@/lib/datasetService'
import { getCurrentUser } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userFiles = await DatasetService.getUserFiles(user.id)
    
    return NextResponse.json({
      success: true,
      files: userFiles
    })

  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get files',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}