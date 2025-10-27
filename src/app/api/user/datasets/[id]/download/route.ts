import { NextRequest, NextResponse } from 'next/server'
import { DatasetService } from '@/lib/datasetService'
import { getCurrentUser } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const fileId = params.id

    console.log('Download API called by user:', user.id, 'for file:', fileId)

    const file = await DatasetService.getUserFile(user.id, fileId)

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    return new NextResponse(file.content, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { 
        error: 'Download failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}