import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
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

    // Parse URL pagination & search query params
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const query = escapedSearch
      ? {
          $or: [
            { name: { $regex: escapedSearch, $options: "i" } },
            { email: { $regex: escapedSearch, $options: "i" } },
            { company: { $regex: escapedSearch, $options: "i" } },
            { phone: { $regex: escapedSearch, $options: "i" } },
          ],
        }
      : {};

    await connectDB();

    // Query contacts with skip/limit pagination, and fetch total count
    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Contact.countDocuments(query),
    ]);

    return Response.json({
      contacts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch {
    return Response.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }
}
