import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();

  const contact = await Contact.create(body);

  return Response.json({
    success: true,
    contact,
  });
}
