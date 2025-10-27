import { NextRequest, NextResponse } from 'next/server'
import { DatasetService } from '@/lib/datasetService'
import { getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    const user = await getUserFromToken(token)
    
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
    console.error('Get user files error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get files',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}