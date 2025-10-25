import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    console.error("GET /api/news failed:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const { title, content, author, published } = body;

    if (!title || !content || !author) {
      console.warn("Missing required fields:", body);
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        author,
        published: published ?? true,
      },
    });

    console.log("Created news:", news);
    return NextResponse.json(news, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/news failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create article" },
      { status: 500 }
    );
  }
}
