// app/api/users/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// The PUT function handles requests to update a user.
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // Validate the role field if it exists.
    if (body.role && !["admin", "user"].includes(body.role)) {
      return NextResponse.json(
        { error: "Invalid role provided" },
        { status: 400 }
      );
    }

    // Dynamically build the data object to update,
    // only including fields that are present in the request body.
    const dataToUpdate: Record<string, any> = {};
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.email !== undefined) dataToUpdate.email = body.email;
    if (body.username !== undefined) dataToUpdate.username = body.username;
    if (body.role !== undefined) dataToUpdate.role = body.role;
    if (body.verified !== undefined) dataToUpdate.verified = body.verified;

    // Update the user in the database.
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// The DELETE function handles requests to delete a user.
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Delete the user from the database.
    await prisma.user.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
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