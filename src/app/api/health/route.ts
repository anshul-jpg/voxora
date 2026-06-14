export async function GET() {
  return Response.json({
    status: "ok",
    message: "VoiceFlow backend is running",
  });
}
