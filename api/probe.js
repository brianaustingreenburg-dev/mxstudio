// Temporary check: which storage connections this Vercel project has (names only, never values).
export default function handler(req, res) {
  const names = Object.keys(process.env).filter(k => /BLOB|KV_|REDIS|UPSTASH|EDGE_CONFIG|POSTGRES|DATABASE|SUPABASE|MONGO|NEON|TURSO/i.test(k)).sort();
  res.setHeader("access-control-allow-origin", "*"); res.setHeader("cache-control", "no-store");
  res.status(200).json({ ok: true, where: "ROOT", node: process.version, vercelEnv: process.env.VERCEL_ENV || "", storage: names });
}
