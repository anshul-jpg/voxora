import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return Response.json({ user: null }, { status: 401 });
    }

    const decoded = verifyToken(token);

    return Response.json({ user: decoded });
  } catch {
    return Response.json({ user: null }, { status: 401 });
  }
}
