// ✝️ MX Studio · shared inventory for store apps (Mercado Pie de la Cuesta and future stores).
// One JSON document per store, addressed by the store's secret key. Phones send counts,
// the store computer pulls what still has to go into Eleventa and acknowledges it.
// Storage is passed in so the same logic runs on Netlify Blobs and in local tests.

const KEY_RE = /^[A-Za-z0-9_-]{20,64}$/;
const CODE_RE = /^[^\u0000-\u001f]{1,40}$/;   // Eleventa codes can have spaces and accents (e.g. "BOLSA DE KILO")
const MAX_PRODUCTS = 6000;

export const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type,x-inv-key",
  "access-control-max-age": "86400",
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS } });
}
async function docKey(k) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("mxinv:" + k));
  return "inv/" + [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}
const clean = (v, n) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const num = v => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(0, Math.min(1e7, n)) : 0; };
const empty = () => ({ rev: 0, products: {}, ops: [], created: Date.now() });

function applyOp(doc, op, rev) {
  if (!op || typeof op !== "object") return { ok: false, error: "bad" };
  const code = clean(op.code, 40);
  if (!CODE_RE.test(code)) return { ok: false, error: "code" };
  if (op.opId) { const id = clean(op.opId, 40); if (doc.ops.includes(id)) return { ok: true, dup: true }; doc.ops.push(id); }
  const who = clean(op.who, 30), at = clean(op.ts, 40) || new Date().toISOString();
  let p = doc.products[code];
  if (op.t === "delete") { if (p) { p.del = true; p.rev = rev; p.by = who; p.at = at; } return { ok: true }; }
  if (!p || p.del) {
    if (op.t !== "upsert" && op.t !== "sale" && !p) return { ok: false, error: "unknown" };
    if (!p && Object.keys(doc.products).length >= MAX_PRODUCTS) return { ok: false, error: "full" };
    p = doc.products[code] = { code, name: code, cat: "otros", qty: 0, eleQty: op.t === "sale" ? 0 : null, min: 0 };
  }
  if (op.t === "upsert") {
    if (op.name) p.name = clean(op.name, 90);
    if (op.cat) p.cat = clean(op.cat, 20);
    if (op.qty !== undefined && op.qty !== null && op.qty !== "") p.qty = num(op.qty);
  } else if (op.t === "count") {
    const n = num(op.val), cur = p.qty || 0;
    p.qty = op.mode === "add" ? cur + n : op.mode === "sub" ? Math.max(0, cur - n) : n;
  } else if (op.t === "sale") {   // sold at the register: Eleventa already lowered its own stock
    const n = num(op.val);
    p.qty = Math.max(0, (p.qty || 0) - n);
    if (p.eleQty !== null && p.eleQty !== undefined) p.eleQty = Math.max(0, p.eleQty - n);
    if (op.name && p.name === code) p.name = clean(op.name, 90);
  } else return { ok: false, error: "type" };
  delete p.del; p.by = who; p.at = at; p.rev = rev;
  return { ok: true, qty: p.qty };
}

// store: { get(key) -> {data, etag} | null, set(key, data, etag|null) -> boolean (false = someone else wrote first) }
async function mutate(store, key, fn) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const cur = await store.get(key);
    const doc = cur && cur.data ? cur.data : empty();
    doc.ops = doc.ops || []; doc.products = doc.products || {};
    const rev = (doc.rev || 0) + 1;
    const out = fn(doc, rev);
    doc.rev = rev; if (doc.ops.length > 4000) doc.ops = doc.ops.slice(-3000);
    if (await store.set(key, doc, cur ? cur.etag : null)) return { doc, out };
    await new Promise(r => setTimeout(r, 40 + Math.random() * 120 * (attempt + 1)));
  }
  throw new Error("busy");
}
const pub = p => ({ code: p.code, name: p.name, cat: p.cat, qty: p.qty || 0, eleQty: p.eleQty ?? null, by: p.by || "", at: p.at || null, rev: p.rev || 0, ...(p.del ? { del: true } : {}) });

export async function handle(req, store) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  const url = new URL(req.url);
  let body = {};
  if (req.method === "POST") {
    const text = await req.text();
    if (text.length > 3_000_000) return json({ error: "too_large" }, 413);
    try { body = text ? JSON.parse(text) : {}; } catch { return json({ error: "bad_json" }, 400); }
  }
  const k = String(req.headers.get("x-inv-key") || body.k || url.searchParams.get("k") || "");
  if (!KEY_RE.test(k)) return json({ error: "key" }, 401);
  const key = await docKey(k);

  if (req.method === "GET") {
    const cur = await store.get(key); const doc = cur && cur.data ? cur.data : empty();
    const list = Object.values(doc.products || {});
    if (url.searchParams.get("pending") === "1")
      return json({ rev: doc.rev || 0, pending: list.filter(p => !p.del && (p.qty || 0) !== p.eleQty).map(pub) });
    const since = Number(url.searchParams.get("since") || 0);
    return json({ rev: doc.rev || 0, full: !since, products: list.filter(p => !since || (p.rev || 0) > since).filter(p => since || !p.del).map(pub) });
  }
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const t = body.t || "ops";
  try {
    if (t === "ops") {
      const ops = Array.isArray(body.ops) ? body.ops.slice(0, 500) : [];
      const { doc, out } = await mutate(store, key, (doc, rev) => ops.map(op => applyOp(doc, op, rev)));
      return json({ ok: true, rev: doc.rev, results: out });
    }
    if (t === "import") {   // from Eleventa's Excel: Eleventa is the truth for name and stock
      const rows = Array.isArray(body.rows) ? body.rows.slice(0, MAX_PRODUCTS) : [];
      const { doc, out } = await mutate(store, key, (doc, rev) => {
        let nNew = 0, nUpd = 0;
        for (const r of rows) {
          const code = clean(r.code, 40); if (!CODE_RE.test(code)) continue;
          let p = doc.products[code];
          if (!p || p.del) { p = doc.products[code] = { code, name: code, cat: "otros", qty: 0, eleQty: null, min: 0 }; nNew++; } else nUpd++;
          if (r.name) p.name = clean(r.name, 90); if (r.cat) p.cat = clean(r.cat, 20);
          if (r.qty !== undefined && r.qty !== null && r.qty !== "") { p.qty = num(r.qty); p.eleQty = p.qty; }
          delete p.del; p.by = "Eleventa"; p.at = new Date().toISOString(); p.rev = rev;
        }
        return { nNew, nUpd };
      });
      return json({ ok: true, rev: doc.rev, ...out });
    }
    if (t === "ack") {      // the store computer typed these quantities into Eleventa
      const items = Array.isArray(body.items) ? body.items.slice(0, MAX_PRODUCTS) : [];
      const { doc } = await mutate(store, key, (doc, rev) => {
        for (const it of items) { const p = doc.products[clean(it.code, 40)]; if (p) { p.eleQty = num(it.qty); p.rev = rev; } }
      });
      return json({ ok: true, rev: doc.rev });
    }
    if (t === "reset") {
      const { doc } = await mutate(store, key, (doc, rev) => { for (const p of Object.values(doc.products)) { p.del = true; p.rev = rev; } });
      return json({ ok: true, rev: doc.rev });
    }
  } catch (e) {
    return json({ error: e.message === "busy" ? "busy" : "server" }, e.message === "busy" ? 503 : 500);
  }
  return json({ error: "type" }, 400);
}
