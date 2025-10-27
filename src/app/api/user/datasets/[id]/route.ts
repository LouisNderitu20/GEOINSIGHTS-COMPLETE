import { NextRequest, NextResponse } from 'next/server'
import { DatasetService } from '@/lib/datasetService'
import { getUserFromToken } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  
) {
  try {
    const token = request.cookies.get('token')?.value
    const user = await getUserFromToken(token)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: fileId } = await params  

    await DatasetService.deleteUserFile(user.id, fileId)

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete file',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}