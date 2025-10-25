import  prisma  from '@/lib/prisma';
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { name, email, username, password } = await req.json();

    if (!name || !email || !username || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        verificationToken,
        verified: false,
        role: "user",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
