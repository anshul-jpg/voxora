import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    // 🔐 Get token from HTTP-only cookie
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔐 Verify token
    verifyToken(token);

    await connectDB();

    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({
      contacts,
    });
  } catch (error) {
    return Response.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}
