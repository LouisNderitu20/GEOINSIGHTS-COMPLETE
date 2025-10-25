import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
