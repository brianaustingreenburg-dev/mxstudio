// Temporary check: storage connections on this Vercel project (names only, never values).
export function GET() {
  const names = Object.keys(process.env).filter(k => /BLOB|KV_|REDIS|UPSTASH|EDGE_CONFIG|POSTGRES|DATABASE|SUPABASE|MONGO|NEON|TURSO/i.test(k)).sort();
  return new Response(JSON.stringify({ ok: true, where: "ROOT", node: process.version, storage: names }), { headers: { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "no-store" } });
}
