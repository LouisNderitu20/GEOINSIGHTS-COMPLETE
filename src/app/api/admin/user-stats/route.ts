import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {

    const usersWithStats = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        verified: true,
        createdAt: true,
        lastLogin: true,
        datasets: {
          select: {
            id: true,
            fileSize: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedUsers = usersWithStats.map(user => {
      const fileCount = user.datasets.length;
      const totalStorage = user.datasets.reduce((sum, file) => sum + file.fileSize, 0);
      
      const lastUpload = fileCount > 0 
        ? user.datasets[0].createdAt 
        : null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        verified: user.verified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        fileCount: fileCount,
        totalStorage: totalStorage,
        lastUpload: lastUpload
      }
    })

    return NextResponse.json({
      success: true,
      users: formattedUsers
    })

  } catch (error) {
    console.error('Admin user stats error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get user stats',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      },
      { status: 500 }
    )
  }
}