import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

type JwtPayload = {
  id: string;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
};

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookieToken = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    const authHeader = req.headers.get("authorization") || "";
    const headerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : undefined;

    const token = cookieToken || headerToken;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    return NextResponse.json({
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    });
  } catch (err) {
    console.error("AUTH /me error:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
