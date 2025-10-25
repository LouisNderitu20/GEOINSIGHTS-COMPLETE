import { jwtVerify } from 'jose';
import prisma  from '@/lib/prisma';


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'supersecretkey');

export async function getUserFromToken(token?: string) {
  try {
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
    });

    return user;
  } catch (err) {
    console.error('Token verification failed:', err);
    return null;
  }
}
