export async function GET() {
  return Response.json({
    status: "ok",
    message: "Voxora backend is running",
  });
}
