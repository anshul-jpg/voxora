import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return Response.json({ success: true });
}
