import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
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

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword)
}

export async function validateResetToken(token: string): Promise<boolean> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date()
        }
      }
    })
    return !!user
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}