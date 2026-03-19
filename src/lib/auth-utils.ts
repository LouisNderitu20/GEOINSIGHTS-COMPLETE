import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth"
import prisma from './prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export interface AuthUser {
  id: string
  email: string
  username: string
  role: string
}

export async function getCurrentUser(request?: any): Promise<AuthUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return null
    }

    return session.user as AuthUser
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