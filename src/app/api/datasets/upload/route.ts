import { NextRequest, NextResponse } from 'next/server'
import { DatasetService } from '@/lib/datasetService'
import { getCurrentUser } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    console.log('Upload API called by user:', user.id)
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV' },
        { status: 400 }
      )
    }

    const savedFile = await DatasetService.saveUserFile(
      user.id,
      file,
      name || file.name.replace('.csv', '')
    )

    const { content, ...fileInfo } = savedFile

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully!',
      file: fileInfo
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}