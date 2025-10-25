import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    // 1) Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    // 2) Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid username/email or password" },
        { status: 401 }
      );
    }

    // 3) Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 4) Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // 5) Set cookie + return response
    const response = NextResponse.json({
      success: true,
      token, // keep this if your frontend still expects it
    });

    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict; Secure`
    );

    return response;
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
