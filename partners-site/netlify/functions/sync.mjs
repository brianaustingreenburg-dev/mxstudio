// ✝️ MX Studio live sync: one shared store for Brian's dashboard and the Partner pages.
import { getStore, getDeployStore } from "@netlify/blobs";

function store() {
  const prod = Netlify.context?.deploy?.context === "production";
  return prod ? getStore({ name: "mxsync", consistency: "strong" }) : getDeployStore("mxsync");
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

// Who is calling? Brian's key can touch everything; each Partner key only its own space.
function who(req) {
  const key = req.headers.get("x-mx-key") || "";
  if (!key) return null;
  if (key === Netlify.env.get("MX_BRIAN_KEY")) return { brian: true };
  let partners = {};
  try { partners = JSON.parse(Netlify.env.get("MX_PARTNER_KEYS") || "{}"); } catch {}
  for (const [id, k] of Object.entries(partners)) if (k === key) return { brian: false, id };
  return null;
}

function allowed(user, space) {
  if (!user) return false;
  if (user.brian) return /^(brian|partner-[a-z0-9]+)$/.test(space);
  return space === "partner-" + user.id;
}

const SUMMARY = /(^|-)(calls|closes|reset|mc|mcloses|mcalls)$/;

export default async (req) => {
  const user = who(req);
  if (!user) return json({ error: "not allowed" }, 401);
  const url = new URL(req.url);
  const s = store();

  // Brian only: live activity for every Partner
  if (req.method === "GET" && url.searchParams.get("partners") === "1") {
    if (!user.brian) return json({ error: "not allowed" }, 403);
    const { blobs } = await s.list({ prefix: "space/partner-" });
    const out = {};
    for (const b of blobs) {
      const data = (await s.get(b.key, { type: "json" })) || { items: {} };
      const id = b.key.replace("space/partner-", "");
      const items = {};
      let last = 0;
      for (const [k, it] of Object.entries(data.items || {})) {
        if (it.t > last) last = it.t;
        if (SUMMARY.test(k)) items[k] = it.v;
      }
      out[id] = { items, last };
    }
    return json({ partners: out, now: Date.now() });
  }

  const space = url.searchParams.get("space") || "";
  if (!allowed(user, space)) return json({ error: "not allowed" }, 403);
  const key = "space/" + space;

  if (req.method === "GET") {
    const since = Number(url.searchParams.get("since") || 0);
    const data = (await s.get(key, { type: "json" })) || { items: {}, rev: 0 };
    const items = {};
    for (const [k, it] of Object.entries(data.items || {})) if (it.t > since) items[k] = it;
    return json({ items, rev: data.rev || 0 });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "bad body" }, 400); }
    const set = body && typeof body.set === "object" ? body.set : {};
    const dev = String((body && body.dev) || "").slice(0, 40);
    const data = (await s.get(key, { type: "json" })) || { items: {}, rev: 0 };
    let t = Math.max(Date.now(), (data.rev || 0) + 1);
    for (const [k, v] of Object.entries(set)) {
      if (k.length > 200) continue;
      if (v !== null && typeof v !== "string") continue;
      if (typeof v === "string" && v.length > 400000) continue;
      data.items[k] = { v, t, d: dev };
    }
    data.rev = t;
    await s.setJSON(key, data);
    return json({ ok: true, rev: t });
  }

  return json({ error: "method" }, 405);
};

export const config = { path: "/api/sync" };
