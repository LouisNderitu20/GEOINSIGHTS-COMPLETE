import { PrismaClient } from '@prisma/client'
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { name, email, username, password } = await req.json();

    if (!name || !email || !username || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: existingUser.email === email ? "Email already exists." : "Username already exists." 
      }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12); 
    const verificationToken = uuidv4();

    const user = await prisma.user.create({
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

    console.log("User created:", user.id);
    
    return NextResponse.json({ 
      success: true, 
      message: "User registered successfully" 
    });
    
  } catch (error: any) {
    console.error("Registration error details:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "User with this email or username already exists." }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}"export const dynamic = 'force-dynamic';" 
