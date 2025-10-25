// src/app/api/admin/users/route.ts - CORRECTED VERSION
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// This file should only handle /api/admin/users (without ID)
// GET /api/admin/users - Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        verified: true,
        createdAt: true,
        lastLogin: true
      }
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user (if needed)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Create user logic here if needed
    return NextResponse.json({ message: "User created" });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

// REMOVE PUT and DELETE functions from this file!
// They belong in /api/admin/users/[id]/route.ts