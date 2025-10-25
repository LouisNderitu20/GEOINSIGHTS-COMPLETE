import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    if (body.role && !["admin", "user"].includes(body.role)) {
      return NextResponse.json(
        { error: "Invalid role provided" },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, any> = {};
    if (body.name !== undefined) dataToUpdate.name = body.name;
    if (body.email !== undefined) dataToUpdate.email = body.email;
    if (body.username !== undefined) dataToUpdate.username = body.username;
    if (body.role !== undefined) dataToUpdate.role = body.role;
    if (body.verified !== undefined) dataToUpdate.verified = body.verified;

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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
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
