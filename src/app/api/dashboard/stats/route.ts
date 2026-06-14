import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ IMPORTANT: capture result
    const decoded = verifyToken(token);

    if (!decoded) {
      return Response.json({ message: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const totalLeads = await Contact.countDocuments();

    return Response.json({ totalLeads });
  } catch (err) {
    console.error("Stats API error:", err);

    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
}
