// What this deployment can do, so the app can hide features that aren't set up.
export function GET() {
  return new Response(JSON.stringify({ generation: Boolean(process.env.FAL_KEY) }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
}
