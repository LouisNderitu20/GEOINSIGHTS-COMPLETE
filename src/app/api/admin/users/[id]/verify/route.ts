import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // your prisma client

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { verified: true },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify user' }, { status: 500 });
  }
}
