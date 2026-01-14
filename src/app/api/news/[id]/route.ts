import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  
) {
  try {
    const { id } = await params;  
    
    const news = await prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  
) {
  try {
    const { id } = await params;  
    const body = await req.json();
    const { title, content, author, published } = body;

    const updated = await prisma.news.update({
      where: { id },
      data: { title, content, author, published },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  
) {
  try {
    const { id } = await params;  
    
    await prisma.news.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Article deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 });
  }
}