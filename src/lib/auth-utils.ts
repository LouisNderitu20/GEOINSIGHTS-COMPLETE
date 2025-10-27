import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from './prisma'

export interface AuthUser {
  id: string
  email: string
  username: string
  role: string
}

export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {

    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true, role: true }
    })

    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}