"use strict";
// MX Studio · Inventario Pie de la Cuesta — store computer program.
// Serves the phone app on the store Wi-Fi, keeps one shared inventory on this
// computer, and types counted quantities into Eleventa like a barcode scanner.
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawn, exec } = require("child_process");
const https = require("https");

const VERSION = "1.5.2";
const IS_PKG = !!process.pkg;
const HOME = IS_PKG ? path.dirname(process.execPath) : __dirname;
const PUBLIC = path.join(__dirname, "public");
const DATA_FILE = path.join(HOME, "inventario-datos.json");
const CONFIG_FILE = path.join(HOME, "inventario-config.json");
const MOCK_TYPER = process.platform !== "win32" || process.env.PDC_MOCK_TYPER === "1";

/* ---------------- config ---------------- */
const DEFAULT_CONFIG = {
  port: 8080,
  storeName: "Mercado Pie de la Cuesta",
  ownerPin: "1234",
  eleventa: {
    windowTitle: "eleventa",
    template: "{code}{ENTER}{qty}{ENTER}",
    keyDelayMs: 120,
    rowDelayMs: 700,
    countdownSec: 5
  },
  autoSendTime: "",
  cloud: { enabled: true, url: "", appUrl: "https://go.myjefetech.app/inventario/", key: "", pullSec: 15 },
  tunnel: { enabled: true, relay: "https://ntfy.sh", overrideUrl: "" },
  eleventaDb: { enabled: false, path: "", host: "127.0.0.1", port: 3050, user: "SYSDBA", password: "masterkey", table: "", idCol: "", codeCol: "", qtyCol: "", nameCol: "", lastId: 0, joinCol: "", joinTable: "", joinKey: "", joinCode: "", joinName: "", everySec: 30, prodTable: "", prodCodeCol: "", stockCol: "", lastBackupDay: "" },
  scanner: { enabled: false, channel: "", pageUrl: "https://go.myjefetech.app/escaner/", relay: "https://ntfy.sh", pressEnter: true, maxAgeSec: 20 },
  openBrowser: true,
  autoUpdate: true,
  autoStart: true,
  updateUrl: "https://go.myjefetech.app/pie-de-la-cuesta/version.json",
  lastVersion: ""
};
function deepMerge(a, b) { const o = Array.isArray(a) ? [...a] : { ...a }; for (const k of Object.keys(b || {})) o[k] = (b[k] && typeof b[k] === "object" && !Array.isArray(b[k]) && a[k] && typeof a[k] === "object") ? deepMerge(a[k], b[k]) : b[k]; return o; }
let config = DEFAULT_CONFIG;
try { if (fs.existsSync(CONFIG_FILE)) config = deepMerge(DEFAULT_CONFIG, JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))); } catch (e) { console.log("! No pude leer la configuración, uso la de fábrica:", e.message); }
function saveConfig() { atomicWrite(CONFIG_FILE, JSON.stringify(config, null, 2)); }
if (!config.cloud.key) { config.cloud.key = "mx" + crypto.randomBytes(16).toString("hex"); saveConfig(); }
// the shared inventory now lives on this computer (older versions pointed to an online service)
const LOCAL_API = () => `http://127.0.0.1:${config.port + 1}/api/inventario`;
if (!config.cloud.url || /netlify\.app/i.test(config.cloud.url)) { config.cloud.url = LOCAL_API(); saveConfig(); }
if (!config.scanner.channel) { config.scanner.channel = "mx" + crypto.randomBytes(12).toString("hex"); saveConfig(); }
if (!fs.existsSync(CONFIG_FILE)) saveConfig();

/* ---------------- data ---------------- */
let db = { products: {}, log: [], seenOps: [], setup: { done: {} }, lastImport: null, lastSend: null, people: [] };
try { if (fs.existsSync(DATA_FILE)) db = Object.assign(db, JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))); } catch (e) {
  const bad = DATA_FILE + ".danado-" + Date.now(); try { fs.copyFileSync(DATA_FILE, bad); } catch (_) {}
  console.log("! El archivo de datos estaba dañado. Lo guardé como", bad);
}
let version = 1, saveTimer = null;
function atomicWrite(file, text) { const tmp = file + ".tmp"; fs.writeFileSync(tmp, text); fs.renameSync(tmp, file); }
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { atomicWrite(DATA_FILE, JSON.stringify(db)); } catch (e) { console.log("! Error al guardar:", e.message); } }, 250);
}
function changed() { version++; persist(); broadcast(); }
function nowISO() { return new Date().toISOString(); }
function logIt(type, text, who) { db.log.unshift({ type, text, who: who || "", ts: nowISO() }); db.log = db.log.slice(0, 300); }
function rememberPerson(who) { if (!who) return; db.people = [who, ...db.people.filter(p => p !== who)].slice(0, 20); }
const newId = () => "p" + crypto.randomBytes(5).toString("hex");
function byCode(code) { code = String(code || "").trim(); return Object.entries(db.products).find(([, p]) => String(p.code) === code); }
function pendingList() {
  if (config.cloud.enabled) return cloud.pending.map(p => ({ id: p.code, code: p.code, name: p.name, qty: p.qty, eleQty: p.eleQty ?? null, who: p.by || "", at: p.at || null }));
  return Object.entries(db.products)
    .filter(([, p]) => p.dirty)
    .map(([id, p]) => ({ id, code: p.code, name: p.name, qty: p.qty, eleQty: p.eleQty ?? null, who: p.countedBy || "", at: p.countedAt || null }))
    .sort((a, b) => String(a.at).localeCompare(String(b.at)));
}

/* ---------------- live updates (Server-Sent Events) ---------------- */
const clients = new Set();
function broadcast() { const msg = `data: ${JSON.stringify({ version })}\n\n`; for (const res of clients) { try { res.write(msg); } catch (_) {} } }
setInterval(() => { for (const res of clients) { try { res.write(": ping\n\n"); } catch (_) {} } }, 25000);

/* ---------------- Eleventa typer ---------------- */
let job = { state: "idle", total: 0, done: 0, message: "", startedAt: null, at: null };
function sendKeysEscape(text) { return String(text).replace(/[+^%~(){}[\]]/g, c => "{" + c + "}"); }
function buildActions(item) {
  const T = config.eleventa, out = [];
  const delta = item.eleQty == null ? item.qty : item.qty - item.eleQty;
  const vars = { code: item.code, qty: item.qty, delta, name: item.name };
  const re = /\{(code|qty|delta|name|ENTER|TAB|WAIT|ESC|F\d{1,2}|DOWN|UP)\}/g;
  let last = 0, m, buf = "";
  const flush = () => { if (buf) { out.push({ keys: buf }); buf = ""; } };
  while ((m = re.exec(T.template))) {
    buf += sendKeysEscape(T.template.slice(last, m.index)); last = re.lastIndex;
    const k = m[1];
    if (vars[k] !== undefined) buf += sendKeysEscape(vars[k]);
    else if (k === "WAIT") { flush(); out.push({ sleep: 1000 }); }
    else { buf += "{" + k + "}"; flush(); }
  }
  buf += sendKeysEscape(T.template.slice(last)); flush();
  return out;
}
const PS_SCRIPT = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System; using System.Runtime.InteropServices; using System.Text;
public class W { [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n); }
"@
function Title { $sb = New-Object System.Text.StringBuilder 512; [void][W]::GetWindowText([W]::GetForegroundWindow(), $sb, 512); return $sb.ToString() }
$job = Get-Content -Raw -Encoding UTF8 $args[0] | ConvertFrom-Json
foreach ($it in $job.items) {
  $t = Title
  if ($job.title -ne '' -and $t.ToLower().IndexOf($job.title.ToLower()) -lt 0) { Write-Output ("PAUSE|" + $t); exit 2 }
  foreach ($a in $it.actions) {
    if ($a.sleep) { Start-Sleep -Milliseconds $a.sleep }
    else { [System.Windows.Forms.SendKeys]::SendWait($a.keys); Start-Sleep -Milliseconds $job.keyDelay }
  }
  Write-Output ("OK|" + $it.id)
  Start-Sleep -Milliseconds $job.rowDelay
}
Write-Output "DONE"
`;
let sentQty = {};
function markSent(id) {
  if (config.cloud.enabled) { cloud.acks.push({ id: "w" + crypto.randomBytes(6).toString("hex"), code: id, qty: sentQty[id] }); saveAcks(); cloud.pending = cloud.pending.filter(p => p.code !== id); job.done++; version++; broadcast(); return; }
  const p = db.products[id]; if (!p) return;
  const q = sentQty[id] ?? p.qty;
  p.eleQty = q; p.dirty = p.qty !== q; p.sentAt = nowISO();
  job.done++; version++; persist(); broadcast();
}
function runTyper(items, titleCheck, onLine, onExit) {
  if (MOCK_TYPER) {
    // Stand-in for Windows keystrokes so the flow can be tested off Windows.
    const out = path.join(HOME, "tecleado-prueba.txt"); let i = 0;
    const step = () => {
      if (i >= items.length) { onLine("DONE"); return onExit(0); }
      const it = items[i++];
      fs.appendFileSync(out, it.actions.map(a => a.keys || `<espera ${a.sleep}ms>`).join("") + "\n");
      onLine("OK|" + it.id); setTimeout(step, 30);
    };
    return step();
  }
  const tmp = path.join(os.tmpdir(), "pdc-job-" + Date.now() + ".json");
  const ps1 = path.join(os.tmpdir(), "pdc-typer.ps1");
  fs.writeFileSync(ps1, "﻿" + PS_SCRIPT, "utf8");
  fs.writeFileSync(tmp, JSON.stringify({ title: titleCheck, keyDelay: config.eleventa.keyDelayMs, rowDelay: config.eleventa.rowDelayMs, items }), "utf8");
  const ps = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-STA", "-File", ps1, tmp], { windowsHide: true });
  let buf = "";
  ps.stdout.on("data", d => { buf += d.toString(); let n; while ((n = buf.indexOf("\n")) >= 0) { const line = buf.slice(0, n).trim(); buf = buf.slice(n + 1); if (line) onLine(line); } });
  ps.stderr.on("data", d => console.log("! PowerShell:", d.toString().trim()));
  ps.on("close", code => { try { fs.unlinkSync(tmp); } catch (_) {} if (buf.trim()) onLine(buf.trim()); onExit(code); });
}
function startSend({ test = false, delaySec } = {}) {
  if (job.state === "countdown" || job.state === "typing") return { ok: false, error: "busy" };
  const items = test
    ? [{ id: "test", actions: buildActions({ code: "7501000000000", qty: 12, eleQty: 10, name: "PRUEBA" }) }]
    : pendingList().map(it => ({ id: it.id, actions: buildActions(it) }));
  sentQty = {}; if (!test) for (const it of pendingList()) sentQty[it.id] = it.qty;
  if (!items.length) return { ok: false, error: "empty" };
  const wait = Math.max(0, Number(delaySec ?? config.eleventa.countdownSec) || 0);
  job = { state: "countdown", total: items.length, done: 0, message: "", startedAt: nowISO(), at: Date.now() + wait * 1000, test };
  broadcast();
  setTimeout(() => {
    job.state = "typing"; broadcast();
    console.log(`> Tecleando ${items.length} ${test ? "(prueba)" : "producto(s)"} en ${test ? "la ventana al frente" : "Eleventa"}…`);
    runTyper(items, test ? "" : config.eleventa.windowTitle, line => {
      if (line.startsWith("OK|")) { const id = line.slice(3); if (id !== "test") markSent(id); else { job.done++; broadcast(); } }
      else if (line.startsWith("PAUSE|")) { job.state = "paused"; job.message = line.slice(6); }
      else if (line === "DONE") { job.state = "done"; }
    }, code => {
      if (job.state === "typing") job.state = code === 0 ? "done" : "error";
      if (!test && config.cloud.enabled) cloudPull();
      if (job.state === "done" && !test) { db.lastSend = nowISO(); db.setup.done.send = true; logIt("send", `${job.done} → Eleventa`, "PC"); }
      if (job.state === "done" && test) db.setup.done.test = true;
      if (job.state === "paused") logIt("pause", `Pausa: ${job.done}/${job.total}`, "PC");
      console.log(`> Resultado: ${job.state} (${job.done}/${job.total})`);
      changed();
    });
  }, wait * 1000);
  return { ok: true, job };
}
// optional daily automatic send
setInterval(() => {
  const t = (config.autoSendTime || "").trim(); if (!/^\d{1,2}:\d{2}$/.test(t)) return;
  const d = new Date(), hhmm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  const target = t.padStart(5, "0");
  if (hhmm === target && pendingList().length && job.state !== "typing" && job.state !== "countdown" && db._autoDay !== d.toDateString()) {
    db._autoDay = d.toDateString(); startSend({ delaySec: 0 });
  }
}, 20000);

/* ---------------- live register scanner ---------------- */
// Phones scan on an HTTPS page; codes travel through a private relay channel; this computer types them into Eleventa.
const scan = { connected: false, recent: [], seen: new Set(), req: null, retry: null, lastId: "" };
function pairUrl() {
  const S = config.scanner; return `${S.pageUrl}#c=${encodeURIComponent(S.channel)}&n=${encodeURIComponent(config.storeName)}`;
}
function scanRecent(code, status, extra) {
  scan.recent.unshift({ code, status, extra: extra || "", ts: nowISO() }); scan.recent = scan.recent.slice(0, 40); version++; broadcast();
}
// one long-lived PowerShell that types each scanned code (fast: no startup per scan)
let liveTyper = null, liveBuf = "", liveWaiters = [];
const LIVE_PS = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System; using System.Runtime.InteropServices; using System.Text;
public class W2 { [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n); }
"@
[Console]::Out.WriteLine("READY")
while ($true) {
  $line = [Console]::In.ReadLine(); if ($line -eq $null) { break }
  try { $j = $line | ConvertFrom-Json
    $sb = New-Object System.Text.StringBuilder 512; [void][W2]::GetWindowText([W2]::GetForegroundWindow(), $sb, 512); $t = $sb.ToString()
    if ($j.title -ne '' -and $t.ToLower().IndexOf($j.title.ToLower()) -lt 0) { [Console]::Out.WriteLine("PAUSE|" + $t) }
    else { [System.Windows.Forms.SendKeys]::SendWait($j.keys); [Console]::Out.WriteLine("OK") }
  } catch { [Console]::Out.WriteLine("ERR|" + $_.Exception.Message) }
}
`;
function liveType(keys, title) {
  return new Promise(resolve => {
    if (MOCK_TYPER) { fs.appendFileSync(path.join(HOME, "tecleado-prueba.txt"), "[escáner] " + keys + "\n"); return resolve("OK"); }
    if (!liveTyper) {
      const ps1 = path.join(os.tmpdir(), "pdc-live-typer.ps1"); fs.writeFileSync(ps1, "﻿" + LIVE_PS, "utf8");
      liveTyper = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-STA", "-File", ps1], { windowsHide: true });
      liveTyper.stdout.on("data", d => { liveBuf += d.toString(); let n; while ((n = liveBuf.indexOf("\n")) >= 0) { const l = liveBuf.slice(0, n).trim(); liveBuf = liveBuf.slice(n + 1); if (l && l !== "READY") { const w = liveWaiters.shift(); if (w) w(l); } } });
      liveTyper.stderr.on("data", d => console.log("! PowerShell (escáner):", d.toString().trim()));
      liveTyper.on("close", () => { liveTyper = null; while (liveWaiters.length) liveWaiters.shift()("ERR|cerrado"); });
    }
    liveWaiters.push(resolve);
    liveTyper.stdin.write(JSON.stringify({ title, keys }) + "\n");
  });
}
let scanChain = Promise.resolve();
function onScan(code, id, at) {
  code = String(code || "").trim();
  if (!/^[A-Za-z0-9.\-]{3,40}$/.test(code)) return;
  if (id && scan.seen.has(id)) return; if (id) { scan.seen.add(id); if (scan.seen.size > 2000) scan.seen = new Set([...scan.seen].slice(-1000)); }
  if (!config.scanner.enabled) return scanRecent(code, "off");
  if (at && Date.now() - at > config.scanner.maxAgeSec * 1000) return scanRecent(code, "old");
  scanChain = scanChain.then(async () => {
    // never mix with a "Pasar a Eleventa" job that is typing
    for (let i = 0; i < 300 && (job.state === "typing" || job.state === "countdown"); i++) await new Promise(r => setTimeout(r, 200));
    const keys = sendKeysEscape(code) + (config.scanner.pressEnter ? "{ENTER}" : "");
    const r = await liveType(keys, config.eleventa.windowTitle);
    if (r === "OK") { scanRecent(code, "typed"); const hit = byCode(code); if (hit) logIt("scan", `${hit[1].name}`, "Escáner"); }
    else if (r.startsWith("PAUSE|")) scanRecent(code, "blocked", r.slice(6));
    else scanRecent(code, "error", r);
  }).catch(e => console.log("! Escáner:", e.message));
}
function scanConnect(restart) {
  clearTimeout(scan.retry);
  if (scan.req) { try { scan.req.destroy(); } catch (_) {} scan.req = null; }
  if (!config.scanner.enabled || !config.scanner.channel) { scan.connected = false; return; }
  const url = `${config.scanner.relay}/${config.scanner.channel}/json` + (scan.lastId && !restart ? `?since=${scan.lastId}` : "");
  let buf = "";
  const req = (url.startsWith("https:") ? https : http).get(url, { headers: { "User-Agent": "MXStudio-Inventario/" + VERSION } }, res => {
    if (res.statusCode !== 200) { res.resume(); scan.connected = false; broadcast(); scan.retry = setTimeout(scanConnect, 8000); return; }
    scan.connected = true; broadcast(); console.log("> Escáner de caja conectado");
    res.setEncoding("utf8");
    res.on("data", chunk => {
      buf += chunk; let n;
      while ((n = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, n).trim(); buf = buf.slice(n + 1); if (!line) continue;
        try { const ev = JSON.parse(line); if (ev.event !== "message") continue; scan.lastId = ev.id;
          const m = /^MXS1\|([^|]+)\|([^|]+)$/.exec(String(ev.message || "")); if (!m) continue;
          onScan(m[1], m[2], (ev.time || 0) * 1000);
        } catch (_) {}
      }
    });
    res.on("end", () => { scan.connected = false; broadcast(); scan.retry = setTimeout(scanConnect, 2000); });
    res.on("error", () => {});
  });
  req.on("error", () => { scan.connected = false; broadcast(); scan.retry = setTimeout(scanConnect, 8000); });
  req.setTimeout(90000, () => req.destroy());   // the relay sends keepalives; silence means the line dropped
  scan.req = req;
}
scanConnect(true);

/* ---------------- shared inventory, kept on this computer ---------------- */
const invcore = require("./invcore.js");
const SHARED_FILE = path.join(HOME, "inventario-compartido.json");
let shared = {}; try { if (fs.existsSync(SHARED_FILE)) shared = JSON.parse(fs.readFileSync(SHARED_FILE, "utf8")); } catch (e) { console.log("! No pude leer el inventario compartido:", e.message); }
let sharedEtag = 1, sharedTimer = null;
const localStore = {
  async get(key) { return shared[key] ? { data: JSON.parse(JSON.stringify(shared[key])), etag: String(sharedEtag) } : null; },
  async set(key, data, etag) {
    if (etag === null ? !!shared[key] : etag !== String(sharedEtag)) return false;
    shared[key] = data; sharedEtag++;
    clearTimeout(sharedTimer); sharedTimer = setTimeout(() => { try { atomicWrite(SHARED_FILE, JSON.stringify(shared)); } catch (e) { console.log("! Error al guardar el inventario compartido:", e.message); } }, 300);
    return true;
  }
};
async function serveInventario(req, res) {
  try {
    const chunks = []; for await (const c of req) chunks.push(c);
    const hasBody = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    const headers = {}; for (const h of ["content-type", "x-inv-key"]) if (req.headers[h]) headers[h] = req.headers[h];
    const r = await invcore.handle(new Request("http://store" + req.url, { method: req.method, headers, body: hasBody ? Buffer.concat(chunks) : undefined }), localStore);
    const buf = Buffer.from(await r.arrayBuffer());
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(buf);
  } catch (e) { res.writeHead(500, { "content-type": "application/json", "access-control-allow-origin": "*" }); res.end(JSON.stringify({ error: "server" })); }
}
// A second, tiny server that only answers the inventory API. The public link points here, never at the owner screens.
const apiServer = http.createServer((req, res) => {
  const p = (req.url || "").split("?")[0];
  if (p === "/api/inventario" && /[?&]status=1(&|$)/.test(req.url || "")) {
    const k = new URL("http://x" + req.url).searchParams.get("k");
    const ok = k && k === config.cloud.key;
    res.writeHead(ok ? 200 : 401, { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "no-store" });
    return res.end(JSON.stringify(ok ? programStatus() : { error: "key" }));
  }
  if (p === "/api/inventario") return serveInventario(req, res);
  res.writeHead(404, { "content-type": "text/plain" }); res.end("not found");
});
let apiTries = 0;
apiServer.on("error", e => { if (e.code === "EADDRINUSE" && ++apiTries < 20) return setTimeout(() => apiServer.listen(config.port + 1, "127.0.0.1"), 1500); console.log("! No pude abrir el puerto del inventario:", e.message); });
apiServer.listen(config.port + 1, "127.0.0.1");

/* ---------------- free public link so phones reach this computer from anywhere ---------------- */
const tunnel = { url: "", state: "off", error: "", proc: null, publishedAt: 0, fails: 0 };
function relayTopic() { return "mxinv-" + crypto.createHash("sha256").update("mxinv-topic:" + config.cloud.key).digest("hex").slice(0, 24); }
function fetchUrl(url, opts = {}, hops = 0) {
  return new Promise((ok, bad) => {
    const u = new URL(url), lib = u.protocol === "https:" ? https : http;
    const req = lib.request(u, { method: opts.method || "GET", headers: { "user-agent": "MXStudio-Inventario/" + VERSION, ...(opts.body ? { "content-length": Buffer.byteLength(opts.body) } : {}), ...(opts.headers || {}) }, timeout: opts.timeout || 30000 }, res => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && hops < 6) { res.resume(); return ok(fetchUrl(new URL(res.headers.location, url).toString(), opts, hops + 1)); }
      if (opts.file) {
        if (res.statusCode !== 200) { res.resume(); return bad(new Error("http " + res.statusCode)); }
        const out = fs.createWriteStream(opts.file); res.pipe(out); out.on("finish", () => out.close(() => ok({ status: 200 }))); out.on("error", bad); return;
      }
      let b = ""; res.setEncoding("utf8"); res.on("data", c => b += c); res.on("end", () => ok({ status: res.statusCode, body: b }));
    });
    req.on("timeout", () => req.destroy(new Error("sin respuesta"))); req.on("error", bad);
    if (opts.body) req.write(opts.body); req.end();
  });
}
async function publishAddress() {
  if (!tunnel.url) return;
  try {
    const r = await fetchUrl(`${config.tunnel.relay}/${relayTopic()}`, { method: "POST", body: tunnel.url, headers: { "content-type": "text/plain" } });
    if (r.status >= 400) throw new Error("http " + r.status);
    tunnel.publishedAt = Date.now(); tunnel.error = "";
  } catch (e) { tunnel.error = "No pude avisar la dirección a los teléfonos: " + e.message; tunnel.publishedAt = 0; }
  version++; broadcast();
}
function cloudflaredPath() { return path.join(HOME, process.platform === "win32" ? "cloudflared.exe" : "cloudflared"); }
async function ensureCloudflared() {
  const f = cloudflaredPath();
  if (fs.existsSync(f) && fs.statSync(f).size > 1e6) return f;
  tunnel.state = "downloading"; version++; broadcast();
  const asset = process.platform === "win32" ? "cloudflared-windows-amd64.exe" : "cloudflared-linux-amd64";
  await fetchUrl(`https://github.com/cloudflare/cloudflared/releases/latest/download/${asset}`, { file: f + ".part", timeout: 120000 });
  if (fs.statSync(f + ".part").size < 1e6) throw new Error("descarga incompleta");
  fs.renameSync(f + ".part", f); if (process.platform !== "win32") fs.chmodSync(f, 0o755);
  return f;
}
let tunnelTimer = null;
function restartTunnelSoon(ms) { clearTimeout(tunnelTimer); tunnelTimer = setTimeout(startTunnel, ms); }
async function startTunnel() {
  if (!config.tunnel.enabled || !config.cloud.enabled) return;
  if (config.tunnel.overrideUrl) { tunnel.url = config.tunnel.overrideUrl; tunnel.state = "on"; publishAddress(); return; }
  if (tunnel.proc) { try { tunnel.proc.kill(); } catch (_) {} tunnel.proc = null; }
  try {
    const bin = await ensureCloudflared();
    tunnel.state = "starting"; tunnel.url = ""; version++; broadcast();
    const p = spawn(bin, ["tunnel", "--no-autoupdate", "--url", `http://127.0.0.1:${config.port + 1}`], { windowsHide: true });
    tunnel.proc = p;
    const onData = d => {
      const m = String(d).match(/https:\/\/(?!api\.)[a-z0-9-]+\.trycloudflare\.com/);   // not api.trycloudflare.com (cloudflared mentions it while starting)
      if (m && m[0] !== tunnel.url) { tunnel.url = m[0]; tunnel.state = "on"; tunnel.fails = 0; console.log("> Los teléfonos se conectan por:", tunnel.url); setTimeout(publishAddress, 4000); }
    };
    p.stdout.on("data", onData); p.stderr.on("data", onData);
    p.on("error", e => { tunnel.error = "No pude abrir la conexión: " + e.message; });
    p.on("exit", code => { if (tunnel.proc !== p) return; tunnel.proc = null; tunnel.state = "off"; tunnel.url = ""; tunnel.error = "Se cortó la conexión, reconectando…"; version++; broadcast(); restartTunnelSoon(10000); });
  } catch (e) { tunnel.state = "error"; tunnel.error = "No pude preparar la conexión a internet: " + e.message; version++; broadcast(); restartTunnelSoon(60000); }
}
// keep the link healthy: check it every few minutes and re-announce the address
setInterval(async () => {
  if (!tunnel.url || config.tunnel.overrideUrl) return;
  try {
    const r = await fetchUrl(`${tunnel.url}/api/inventario?k=${encodeURIComponent(config.cloud.key)}&pending=1`, { timeout: 20000 });
    if (r.status !== 200) throw new Error("http " + r.status);
    tunnel.fails = 0; if (Date.now() - tunnel.publishedAt > 3 * 3600e3) publishAddress();
  } catch (_) { if (++tunnel.fails >= 3) { console.log("! La conexión no responde, la abro otra vez"); tunnel.fails = 0; startTunnel(); } }
}, 4 * 60000);
const stopTunnel = () => { try { tunnel.proc && tunnel.proc.kill(); } catch (_) {} };
process.on("exit", stopTunnel); process.on("SIGINT", () => { stopTunnel(); process.exit(0); }); process.on("SIGTERM", () => { stopTunnel(); process.exit(0); });
if (process.platform === "win32") exec("taskkill /IM cloudflared.exe /F", () => setTimeout(startTunnel, 1500)); else setTimeout(startTunnel, 500);

/* ---------------- shared app inventory (phones on go.myjefetech.app) ---------------- */
const cloud = { ok: false, pending: [], acks: Array.isArray(db.cloudAcks) ? db.cloudAcks : [], lastPull: null, error: "", total: 0 };
function saveAcks() { db.cloudAcks = cloud.acks; persist(); }
function cloudPairUrl() { const C = config.cloud; return `${C.appUrl}#k=${encodeURIComponent(C.key)}&u=auto&r=${encodeURIComponent(config.tunnel.relay)}&n=${encodeURIComponent(config.storeName)}`; }
function cloudReq(method, bodyObj, query) {
  return new Promise((resolve, reject) => {
    const u = new URL(config.cloud.url + (query || "")); const data = bodyObj ? JSON.stringify({ k: config.cloud.key, ...bodyObj }) : null;
    const lib = u.protocol === "https:" ? https : http;
    const req = lib.request(u, { method, headers: { "content-type": "application/json", "x-inv-key": config.cloud.key, "user-agent": "MXStudio-Inventario/" + VERSION, ...(data ? { "content-length": Buffer.byteLength(data) } : {}) }, timeout: 20000 }, res => {
      let b = ""; res.setEncoding("utf8"); res.on("data", c => b += c);
      res.on("end", () => { try { const j = JSON.parse(b || "{}"); if (res.statusCode >= 400) reject(new Error(j.error || ("http " + res.statusCode))); else resolve(j); } catch (e) { reject(new Error("respuesta inválida")); } });
    });
    req.on("timeout", () => req.destroy(new Error("sin respuesta"))); req.on("error", reject);
    if (data) req.write(data); req.end();
  });
}
const cloudPost = body => cloudReq("POST", body);
let cloudChainP = Promise.resolve();
function cloudPull() { const run = cloudChainP.then(async () => { await cloudAck(); await syncSales(); await cloudPullRaw(); await writeCounts(); await cloudAck(); }).catch(() => {}); cloudChainP = run; return run; }
async function cloudPullRaw() {
  if (!config.cloud.enabled) return;
  if (job.state === "typing" || job.state === "countdown") return;   // keep the list steady while typing
  try {
    const j = await cloudReq("GET", null, `?k=${encodeURIComponent(config.cloud.key)}&pending=1`);
    cloud.pending = (j.pending || []).sort((a, b) => String(a.at).localeCompare(String(b.at)));
    const was = cloud.ok; cloud.ok = true; cloud.error = ""; cloud.lastPull = nowISO();
    if (!was) console.log("> Conectado con la app de la tienda");
  } catch (e) { if (cloud.ok) console.log("! Sin conexión con la app:", e.message); cloud.ok = false; cloud.error = e.message; }
  version++; broadcast();
}
async function cloudAck() {
  if (!cloud.acks.length) return;
  const items = cloud.acks.splice(0); saveAcks();
  try { await cloudPost({ t: "ack", items }); saveAcks(); } catch (e) { cloud.acks.unshift(...items); saveAcks(); console.log("! No pude avisar a la app:", e.message);  }
}
setInterval(cloudPull, Math.max(10, config.cloud.pullSec) * 1000);
cloudPull();

/* ---------------- Eleventa ↔ app: register sales → app, phone counts → Eleventa stock ---------------- */
let Firebird = null; try { Firebird = require("node-firebird"); } catch (_) {}
const salesState = { lastRun: null, lastCount: 0, error: "", report: null, running: false };
function fbQuery(dbPath, sql, params) {
  const E = config.eleventaDb;
  return new Promise((resolve, reject) => {
    if (!Firebird) return reject(new Error("lector de Firebird no disponible"));
    Firebird.attach({ host: E.host, port: E.port, database: dbPath, user: E.user, password: E.password, lowercase_keys: false, pageSize: 4096 }, (err, conn) => {
      if (err) return reject(err);
      conn.query(sql, params || [], (e2, rows) => { try { conn.detach(); } catch (_) {} if (e2) reject(e2); else resolve(rows || []); });
    });
  });
}
function findFdbFiles() {
  const out = [], seen = new Set();
  const roots = process.platform === "win32"
    ? ["C:\\Program Files (x86)", "C:\\Program Files", "C:\\ProgramData", "C:\\", "D:\\"]
    : [HOME];
  const walk = (dir, depth, inside) => {
    if (depth < 0 || out.length > 20) return; let list = [];
    try { list = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
    for (const d of list) {
      const p = path.join(dir, d.name);
      if (d.isFile() && /\.fdb$/i.test(d.name) && !seen.has(p)) { seen.add(p); out.push(p); }
      else if (d.isDirectory() && !/^(windows|\$recycle|system volume)/i.test(d.name)) {
        const hit = inside || /eleventa|abarrotes|pdv|punto de venta/i.test(d.name);
        if (hit || depth > 2) walk(p, hit ? Math.min(depth - 1, 4) : depth - 1, hit);
      }
    }
  };
  for (const r of roots) walk(r, 3, false);
  return out.sort((a, b) => (/pdvdata/i.test(b) - /pdvdata/i.test(a)));
}
function salesSql(c, first, where, order) {
  if (c.joinCol) return `SELECT ${first} a."${c.idCol}" AS ID, p."${c.joinCode}" AS CODE, a."${c.qtyCol}" AS QTY${c.joinName ? `, p."${c.joinName}" AS NAME` : ""} FROM "${c.table}" a LEFT JOIN "${c.joinTable}" p ON p."${c.joinKey}" = a."${c.joinCol}" ${where} ${order}`;
  return `SELECT ${first} a."${c.idCol}" AS ID, a."${c.codeCol}" AS CODE, a."${c.qtyCol}" AS QTY${c.nameCol ? `, a."${c.nameCol}" AS NAME` : ""} FROM "${c.table}" a ${where} ${order}`;
}
async function eleventaDiagnose() {
  const E = config.eleventaDb, report = { time: nowISO(), files: [], db: "", tables: [], salesTable: "", columns: [], sample: [], ok: false, error: "" };
  try {
    report.files = E.path ? [E.path] : findFdbFiles();
    if (!report.files.length) throw new Error("No encontré la base de datos de Eleventa (archivo .FDB) en esta computadora.");
    let lastErr = null;
    for (const f of report.files) {
      try {
        const t = await fbQuery(f, "SELECT TRIM(RDB$RELATION_NAME) AS N FROM RDB$RELATIONS WHERE RDB$SYSTEM_FLAG = 0 ORDER BY 1");
        report.db = f; report.tables = t.map(r => String(r.N).trim()); break;
      } catch (e) { lastErr = e; }
    }
    if (!report.db) throw new Error("Encontré el archivo pero no pude abrirlo: " + (lastErr ? lastErr.message : ""));
    // products table first: sales lines may only carry the product's internal ID
    const ptab = report.tables.find(n => /^PRODUCTOS$/i.test(n)) || report.tables.find(n => /PRODUCT/i.test(n) && !/VENTA|COMPRA|MOVIM|HIST|IMPUEST|PROVEED|KIT|LOTE|PROMO|INVENTARIO/i.test(n)) || "";
    const pcols = ptab ? (await fbQuery(report.db, "SELECT TRIM(RDB$FIELD_NAME) AS C FROM RDB$RELATION_FIELDS WHERE RDB$RELATION_NAME = ? ORDER BY RDB$FIELD_POSITION", [ptab])).map(r => String(r.C).trim()) : [];
    const pFind = (...names) => names.map(n => pcols.find(c => c.toUpperCase() === n)).find(Boolean) || "";
    const pKey = pFind("ID", "PRODUCTO_ID"), pCode = pFind("CODIGO", "CODIGO_BARRAS") || pcols.find(c => /COD/i.test(c)) || "", pName = pFind("DESCRIPCION", "NOMBRE") || pcols.find(c => /DESCRIP|NOMBRE/i.test(c)) || "";
    // sales lines table: Eleventa's is VENTATICKETS_ARTICULOS; never INVENTARIO_* (that is receiving stock)
    const isSales = n => { const x = n.toUpperCase().replace(/INVENTARIO/g, ""); return /VENTA/.test(x) && /(ARTIC|DETALLE|PRODUC|PARTIDA)/.test(x) && !/DEVOL|CANCEL|COTIZ|PEDIDO|APARTADO|COMPRA|RECIB|PENDIENTE|TEMP/.test(x); };
    const cands = [...report.tables.filter(n => /^VENTATICKETS_ARTICULOS$/i.test(n)), ...report.tables.filter(n => isSales(n) && !/^VENTATICKETS_ARTICULOS$/i.test(n))];
    report.candidates = cands;
    for (const tname of cands) {
      const cols = (await fbQuery(report.db, "SELECT TRIM(RDB$FIELD_NAME) AS C FROM RDB$RELATION_FIELDS WHERE RDB$RELATION_NAME = ? ORDER BY RDB$FIELD_POSITION", [tname])).map(r => String(r.C).trim());
      const ex = (...names) => names.map(n => cols.find(c => c.toUpperCase() === n)).find(Boolean) || "";
      const idCol = ex("ID");
      const codeCol = ex("PRODUCTO_CODIGO", "CODIGO", "CODIGO_PRODUCTO") || cols.find(c => /COD/i.test(c) && !/_ID$/i.test(c)) || "";
      const joinCol = codeCol ? "" : (ex("PRODUCTO_ID", "ID_PRODUCTO") || "");
      const qtyCol = ex("CANTIDAD") || cols.find(c => /CANTIDAD|CANT/i.test(c) && !/DEVUEL|ANTERIOR|EXISTEN|RECIBID/i.test(c)) || "";
      const nameCol = codeCol ? (ex("PRODUCTO_NOMBRE", "DESCRIPCION", "NOMBRE") || cols.find(c => /DESCRIP|NOMBRE/i.test(c)) || "") : "";
      report.salesTable = tname; report.columns = cols;
      Object.assign(report, { idCol, codeCol, qtyCol, nameCol, joinCol });
      const canJoin = joinCol && ptab && pKey && pCode;
      if (!(idCol && qtyCol && (codeCol || canJoin))) continue;
      const cfg = { table: tname, idCol, codeCol, qtyCol, nameCol, joinCol: canJoin ? joinCol : "", joinTable: canJoin ? ptab : "", joinKey: canJoin ? pKey : "", joinCode: canJoin ? pCode : "", joinName: canJoin ? pName : "" };
      const rows = await fbQuery(report.db, salesSql(cfg, "FIRST 5", "", `ORDER BY a."${idCol}" DESC`));
      report.sample = rows.map(r => ({ id: r.ID, code: String(r.CODE ?? "").trim(), qty: Number(r.QTY), name: r.NAME != null ? String(r.NAME).trim() : "" }));
      report.ok = true;
      Object.assign(E, { path: report.db, ...cfg });
      if (!E.lastId || E.lastTableSeen !== tname) E.lastId = Math.max(0, ...report.sample.map(r => Number(r.id) || 0));   // start from now: old sales are not replayed
      E.lastTableSeen = tname;
      saveConfig(); break;
    }
    if (!report.ok) report.error = cands.length ? "Encontré la tabla de ventas pero no reconocí sus columnas." : "No encontré la tabla de ventas por producto.";
    // products table + stock column (for writing phone counts straight into Eleventa)
    const pt = report.tables.find(n => /^PRODUCTOS$/i.test(n)) || report.tables.find(n => /PRODUCT/i.test(n) && !/VENTA|COMPRA|MOVIM|HIST|IMPUEST|PROVEED|KIT|LOTE|PROMO/i.test(n)) || "";
    report.prodTable = pt;
    report.invTables = report.tables.filter(n => /INVENT|EXIST|ALMAC|KARDEX|MOVIM/i.test(n));
    if (pt) {
      const pc = (await fbQuery(report.db, "SELECT TRIM(RDB$FIELD_NAME) AS C FROM RDB$RELATION_FIELDS WHERE RDB$RELATION_NAME = ? ORDER BY RDB$FIELD_POSITION", [pt])).map(r => String(r.C).trim());
      report.prodColumns = pc;
      const exact = (...names) => names.map(n => pc.find(c => c.toUpperCase() === n)).find(Boolean) || "";
      const prodCodeCol = exact("CODIGO", "CODIGO_BARRAS", "CODE") || pc.find(c => /COD/i.test(c)) || "";
      const stockCol = exact("DINVENTARIO", "EXISTENCIA", "EXISTENCIAS", "INVENTARIO", "STOCK") || pc.find(c => /INVENTARIO|EXISTEN/i.test(c) && !/MIN|MAX|USA|TIPO|FECHA|ULTIM/i.test(c)) || "";
      Object.assign(report, { prodCodeCol, stockCol });
      if (prodCodeCol && stockCol) {
        const sm = await fbQuery(report.db, `SELECT FIRST 3 "${prodCodeCol}" AS CODE, "${stockCol}" AS QTY FROM "${pt}" WHERE "${stockCol}" > 0`);
        report.stockSample = sm.map(r => ({ code: String(r.CODE ?? "").trim(), qty: Number(r.QTY) }));
        report.writeOk = true;
        Object.assign(E, { path: report.db, prodTable: pt, prodCodeCol, stockCol }); saveConfig();
      } else report.writeError = "Encontré la tabla de productos pero no su columna de existencia.";
    } else report.writeError = "No encontré la tabla de productos.";
  } catch (e) { report.error = e.message || String(e); }
  salesState.report = report; version++; broadcast();
  return report;
}
async function syncSales() {
  const E = config.eleventaDb;
  if (!E.enabled || !config.cloud.enabled || !E.path || !E.table || salesState.running) return;
  salesState.running = true;
  try {
    const rows = await fbQuery(E.path, salesSql(E, "FIRST 500", `WHERE a."${E.idCol}" > ?`, `ORDER BY a."${E.idCol}"`), [E.lastId]);
    if (rows.length) {
      const ops = rows.map(r => ({ opId: "venta-" + r.ID, t: "sale", code: String(r.CODE ?? "").trim(), val: Math.max(0, Math.round(Number(r.QTY) || 0)), name: r.NAME != null ? String(r.NAME).trim() : "", who: "Caja" })).filter(o => o.code && o.val > 0);
      if (ops.length) await cloudPost({ ops });
      E.lastId = Math.max(E.lastId, ...rows.map(r => Number(r.ID) || 0)); saveConfig();
      salesState.lastCount = ops.length; logIt("sale", `Caja → app: ${ops.length}`, "Caja");
    }
    salesState.lastRun = nowISO(); salesState.error = "";
  } catch (e) { salesState.error = e.message || String(e); }
  finally { salesState.running = false; version++; broadcast(); }
}
// register sales are read inside the sync step (cloudPull), right before counts are written

// Phone counts → Eleventa's own stock, straight into its database (no typing, the register keeps selling).
// The app's number already has every register sale subtracted, so it is written as is. Register sales are read just
// before, and if a new sale lands in Eleventa before writing, the write waits for the next step.
const writeState = { lastRun: null, lastCount: 0, error: "", running: false, notFound: [], backup: "", recent: Array.isArray(db.eleWrites) ? db.eleWrites.slice(0, 30) : [] };
const BACKUP_DIR = path.join(HOME, "respaldos-eleventa");
function fbAttach() {
  const E = config.eleventaDb;
  return new Promise((ok, bad) => { if (!Firebird) return bad(new Error("lector de Firebird no disponible"));
    Firebird.attach({ host: E.host, port: E.port, database: E.path, user: E.user, password: E.password, lowercase_keys: false, pageSize: 4096 }, (e, c) => e ? bad(e) : ok(c)); });
}
const fbq = (conn, sql, params) => new Promise((ok, bad) => conn.query(sql, params || [], (e, r) => e ? bad(e) : ok(r || [])));
function findGbak() {
  if (process.platform !== "win32") return "";
  const roots = ["C:\\Program Files\\Firebird", "C:\\Program Files (x86)\\Firebird", path.dirname(config.eleventaDb.path || "C:\\"), path.dirname(path.dirname(config.eleventaDb.path || "C:\\"))];
  for (const r of roots) { let list = []; try { list = fs.readdirSync(r); } catch (_) { continue; }
    for (const d of ["", ...list]) for (const sub of ["bin", ""]) { const f = path.join(r, d, sub, "gbak.exe"); if (fs.existsSync(f)) return f; } }
  return "";
}
async function backupEleventa() {   // once a day, before the first change; keeps the last 7
  const E = config.eleventaDb, day = new Date().toISOString().slice(0, 10);
  if (E.lastBackupDay === day) return;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const base = path.join(BACKUP_DIR, "eleventa-" + day.replace(/-/g, "") + "-" + String(Date.now()).slice(-6));
  const gbak = findGbak(); let out = "";
  if (gbak) {
    out = base + ".fbk";
    await new Promise((ok, bad) => exec(`"${gbak}" -b -g -user ${E.user} -password "${E.password}" "${E.host}/${E.port}:${E.path}" "${out}"`, { timeout: 600000 }, e => e ? bad(e) : ok()));
  } else { out = base + ".fdb"; fs.copyFileSync(E.path, out); }
  if (!fs.existsSync(out) || fs.statSync(out).size < 1024) throw new Error("no pude hacer la copia de seguridad");
  const old = fs.readdirSync(BACKUP_DIR).filter(f => /^eleventa-/.test(f)).sort().reverse().slice(7);
  for (const f of old) { try { fs.unlinkSync(path.join(BACKUP_DIR, f)); } catch (_) {} }
  E.lastBackupDay = day; saveConfig(); writeState.backup = out; console.log("> Copia de seguridad de Eleventa:", out);
}
function ackedEleQty(code, eleQty) {   // what Eleventa holds once the confirmations still on their way are counted
  let q = eleQty;
  for (const a of cloud.acks) if (a.code === code) q = (a.delta !== undefined) ? (q ?? 0) + a.delta : a.qty;
  return q;
}
async function writeCounts() {
  const E = config.eleventaDb;
  if (!E.enabled || !config.cloud.enabled || !E.path || !E.prodTable || !E.stockCol || writeState.running) return;
  if (job.state === "typing" || job.state === "countdown") return;
  const todo = [];
  for (const p of cloud.pending) {
    const ele = ackedEleQty(p.code, p.eleQty ?? null), qty = Number(p.qty) || 0;
    if (ele === qty) continue;
    todo.push({ code: p.code, name: p.name, qty, who: p.by || "" });
  }
  if (!todo.length) return;
  writeState.running = true; let conn = null, n = 0; const missing = [];
  try {
    await backupEleventa();
    conn = await fbAttach();
    if (E.table && E.idCol) {   // a sale rung up since we last read the register: let the next step pick it up first
      const m = await fbq(conn, `SELECT MAX("${E.idCol}") AS M FROM "${E.table}"`);
      if (m.length && Number(m[0].M) > Number(E.lastId || 0)) { writeState.running = false; try { conn.detach(); } catch (_) {} conn = null; return; }
    }
    for (const t of todo) {
      const rows = await fbq(conn, `SELECT "${E.stockCol}" AS Q FROM "${E.prodTable}" WHERE "${E.prodCodeCol}" = ?`, [t.code]);
      if (!rows.length) { missing.push(t.code); continue; }
      const old = Number(rows[0].Q) || 0;
      const nw = t.qty;
      await fbq(conn, `UPDATE "${E.prodTable}" SET "${E.stockCol}" = ? WHERE "${E.prodCodeCol}" = ?`, [nw, t.code]);
      cloud.acks.push({ id: "w" + crypto.randomBytes(6).toString("hex"), code: t.code, qty: t.qty }); saveAcks();
      cloud.pending = cloud.pending.filter(p => p.code !== t.code);
      const rec = { ts: nowISO(), code: t.code, name: t.name, old, new: nw, who: t.who };
      writeState.recent.unshift(rec); writeState.recent = writeState.recent.slice(0, 30); db.eleWrites = writeState.recent;
      logIt("ele", `${t.name || t.code}: ${old} → ${nw}`, t.who); n++;
    }
    writeState.notFound = missing; writeState.lastCount = n; writeState.lastRun = nowISO(); writeState.error = "";
    if (n) console.log(`> Conteos del teléfono → Eleventa: ${n}`);
  } catch (e) { writeState.error = e.message || String(e); console.log("! No pude pasar conteos a Eleventa:", writeState.error); }
  finally { try { conn && conn.detach(); } catch (_) {} writeState.running = false; persist(); version++; broadcast(); }
}

/* ---------------- http ---------------- */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml" };
function send(res, code, body, type = "application/json") { res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" }); res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body)); }
function readBody(req, limit = 8e6) { return new Promise((ok, bad) => { let n = 0; const ch = []; req.on("data", c => { n += c.length; if (n > limit) { bad(new Error("too_large")); req.destroy(); } else ch.push(c); }); req.on("end", () => { try { ok(ch.length ? JSON.parse(Buffer.concat(ch).toString("utf8")) : {}); } catch (e) { bad(e); } }); }); }
const isLocal = req => { const a = req.socket.remoteAddress || ""; return a === "127.0.0.1" || a === "::1" || a === "::ffff:127.0.0.1"; };
const isOwner = req => isLocal(req) || req.headers["x-pin"] === String(config.ownerPin);
function lanAddresses() {
  const out = []; for (const list of Object.values(os.networkInterfaces())) for (const n of list || []) if (n.family === "IPv4" && !n.internal) out.push(n.address);
  return out.sort((a, b) => (b.startsWith("192.168.") - a.startsWith("192.168.")));
}
function publicState(req) {
  const owner = isOwner(req);
  const products = {};
  for (const [id, p] of Object.entries(db.products)) { const c = { ...p }; if (!owner) delete c.cost; products[id] = c; }
  return { version, storeName: config.storeName, products, log: db.log.slice(0, 40), pending: pendingList(), setup: db.setup, people: db.people,
    lastImport: db.lastImport, lastSend: db.lastSend, job, owner, local: isLocal(req),
    addresses: lanAddresses().map(a => `http://${a}:${config.port}`),
    eleventa: owner ? config.eleventa : undefined, autoSendTime: owner ? config.autoSendTime : undefined, appVersion: VERSION, mock: MOCK_TYPER,
    cloud: { enabled: config.cloud.enabled, ok: cloud.ok, error: cloud.error, lastPull: cloud.lastPull, pairUrl: owner ? cloudPairUrl() : undefined, link: { state: tunnel.state, url: owner ? tunnel.url : undefined, error: tunnel.error, published: !!tunnel.publishedAt } },
    sales: owner ? { enabled: config.eleventaDb.enabled, ready: !!(config.eleventaDb.path && config.eleventaDb.table), lastRun: salesState.lastRun, lastCount: salesState.lastCount, error: salesState.error, report: salesState.report, available: !!Firebird, write: { ready: !!(config.eleventaDb.prodTable && config.eleventaDb.stockCol), lastRun: writeState.lastRun, lastCount: writeState.lastCount, error: writeState.error, notFound: writeState.notFound, recent: writeState.recent.slice(0, 10), backupDir: BACKUP_DIR } } : undefined,
    scanner: { enabled: config.scanner.enabled, connected: scan.connected, recent: scan.recent.slice(0, 15), pairUrl: owner ? pairUrl() : undefined, pressEnter: config.scanner.pressEnter } };
}
function applyCount(b) {
  const p = db.products[b.id]; if (!p) return { error: "not_found" };
  if (b.opId) { if (db.seenOps.includes(b.opId)) return { ok: true, dup: true, qty: p.qty }; db.seenOps.unshift(b.opId); db.seenOps = db.seenOps.slice(0, 3000); }
  const n = Math.max(0, parseInt(b.val, 10) || 0), cur = p.qty || 0;
  const next = b.mode === "add" ? cur + n : b.mode === "sub" ? Math.max(0, cur - n) : n;
  p.qty = next; p.dirty = next !== (p.eleQty ?? -1) ? true : false; p.countedBy = b.who || ""; p.countedAt = b.ts || nowISO();
  rememberPerson(b.who);
  logIt(b.mode === "add" ? "in" : b.mode === "sub" ? "out" : "set", `${p.name}: ${cur} → ${next}`, b.who);
  if (!db.setup.done.count) db.setup.done.count = true;
  return { ok: true, qty: next };
}
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x"); const P = url.pathname;
  try {
    if (P === "/api/state" && req.method === "GET") return send(res, 200, publicState(req));
    if (P === "/api/events") {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
      res.write(`data: ${JSON.stringify({ version })}\n\n`); clients.add(res); req.on("close", () => clients.delete(res)); return;
    }
    if (P === "/api/count" && req.method === "POST") { const b = await readBody(req); const r = applyCount(b); if (r.error) return send(res, 404, r); if (!r.dup) changed(); return send(res, 200, r); }
    if (P === "/api/counts" && req.method === "POST") { const b = await readBody(req); const out = (b.ops || []).map(applyCount); changed(); return send(res, 200, { ok: true, results: out }); }
    if (P === "/api/product" && req.method === "POST") {
      const b = await readBody(req); const code = String(b.code || "").trim(), name = String(b.name || "").trim();
      if (!name) return send(res, 400, { error: "name" });
      if (code && byCode(code)) return send(res, 409, { error: "exists" });
      const id = newId(); const q = Math.max(0, parseInt(b.qty, 10) || 0);
      db.products[id] = { code, name, cat: b.cat || "despensa", dept: b.dept || "", price: Number(b.price) || 0, cost: 0, min: 5, qty: q, eleQty: null, dirty: true, isNew: true, countedBy: b.who || "", countedAt: nowISO(), exp: null };
      rememberPerson(b.who); logIt("new", `${name} (${q})`, b.who); changed(); return send(res, 200, { ok: true, id });
    }
    if (P === "/api/setup" && req.method === "POST") { const b = await readBody(req); if (b.reset) db.setup.done = {}; else db.setup.done[String(b.step)] = !!b.done; if (b.prog) db.setup.prog = b.prog; changed(); return send(res, 200, { ok: true }); }
    if (P === "/api/unlock" && req.method === "POST") { const b = await readBody(req); return send(res, String(b.pin) === String(config.ownerPin) ? 200 : 403, { ok: String(b.pin) === String(config.ownerPin) }); }

    // owner / store-computer only
    if (P.startsWith("/api/admin/")) {
      if (!isOwner(req)) return send(res, 403, { error: "owner_only" });
      if (P === "/api/admin/import" && req.method === "POST") {
        const b = await readBody(req, 30e6); let nNew = 0, nUpd = 0;
        for (const r of b.rows || []) {
          const code = String(r.code || "").trim(), name = String(r.name || "").trim(); if (!code || !name) continue;
          let hit = byCode(code), p;
          if (!hit) { const id = newId(); db.products[id] = { code, name, cat: r.cat || "despensa", dept: r.dept || "", price: 0, cost: 0, min: 5, qty: 0, eleQty: 0, dirty: false, exp: null }; p = db.products[id]; nNew++; }
          else { p = hit[1]; nUpd++; }
          p.name = name; if (r.price != null) p.price = Number(r.price) || 0; if (r.cost != null) p.cost = Number(r.cost) || 0;
          if (r.dept) p.dept = r.dept; if (r.cat) p.cat = r.cat; if (r.min != null) p.min = Number(r.min) || 0;
          if (r.qty != null) { p.qty = Number(r.qty) || 0; p.eleQty = p.qty; p.dirty = false; }
        }
        db.lastImport = nowISO(); db.setup.done.imp = true; logIt("imp", `Eleventa → ${nNew} nuevos, ${nUpd} actualizados`, "PC"); changed();
        let cloudRes = null;
        if (config.cloud.enabled) { try { cloudRes = await cloudPost({ t: "import", rows: (b.rows || []).map(r => ({ code: r.code, name: r.name, cat: r.cat, qty: r.qty })) }); cloudPull(); } catch (e) { cloudRes = { error: e.message }; } }
        return send(res, 200, { ok: true, nNew, nUpd, cloud: cloudRes });
      }
      if (P === "/api/admin/sample" && req.method === "POST") {
        const seed = JSON.parse(fs.readFileSync(path.join(PUBLIC, "sample.json"), "utf8"));
        db.products = {}; for (const [id, p] of Object.entries(seed)) db.products[id] = { ...p, eleQty: p.qty, dirty: false };
        db.log = []; db.lastImport = null; db.lastSend = null; logIt("imp", "Productos de ejemplo", "PC"); changed(); return send(res, 200, { ok: true });
      }
      if (P === "/api/admin/send" && req.method === "POST") { const b = await readBody(req); return send(res, 200, startSend({ test: !!b.test })); }
      if (P === "/api/admin/clear-pending" && req.method === "POST") { for (const p of Object.values(db.products)) if (p.dirty) { p.dirty = false; p.eleQty = p.qty; } logIt("clear", "Pendientes marcados como pasados", "PC"); changed(); return send(res, 200, { ok: true }); }
      if (P === "/api/admin/eleventa-test" && req.method === "POST") { const r = await eleventaDiagnose(); return send(res, 200, r); }
      if (P === "/api/admin/sales" && req.method === "POST") {
        const b = await readBody(req);
        if (typeof b.enabled === "boolean") config.eleventaDb.enabled = b.enabled && !!config.eleventaDb.table;
        if (typeof b.path === "string") config.eleventaDb.path = b.path.trim();
        if (typeof b.password === "string" && b.password) config.eleventaDb.password = b.password;
        saveConfig(); if (config.eleventaDb.enabled) { syncSales(); cloudPull(); } changed(); return send(res, 200, { ok: true, enabled: config.eleventaDb.enabled });
      }
      if (P === "/api/admin/cloud-refresh" && req.method === "POST") { await cloudPull(); return send(res, 200, { ok: cloud.ok, error: cloud.error }); }
      if (P === "/api/admin/scanner" && req.method === "POST") {
        const b = await readBody(req);
        if (typeof b.enabled === "boolean") config.scanner.enabled = b.enabled;
        if (typeof b.pressEnter === "boolean") config.scanner.pressEnter = b.pressEnter;
        if (b.newChannel) config.scanner.channel = "mx" + crypto.randomBytes(12).toString("hex");
        saveConfig(); scanConnect(true); changed(); return send(res, 200, { ok: true });
      }
      if (P === "/api/admin/scan-test" && req.method === "POST") { const b = await readBody(req); setTimeout(() => onScan(String(b.code || "7501000524457"), "test-" + Date.now(), Date.now()), (Number(b.delaySec) || 0) * 1000); return send(res, 200, { ok: true }); }
      if (P === "/api/admin/job-reset" && req.method === "POST") { if (job.state !== "typing" && job.state !== "countdown") { job = { state: "idle", total: 0, done: 0, message: "" }; broadcast(); } return send(res, 200, { ok: true }); }
      if (P === "/api/admin/config" && req.method === "POST") {
        const b = await readBody(req); const e = b.eleventa || {};
        for (const k of ["windowTitle", "template"]) if (typeof e[k] === "string") config.eleventa[k] = e[k];
        for (const k of ["keyDelayMs", "rowDelayMs", "countdownSec"]) if (e[k] != null && !isNaN(+e[k])) config.eleventa[k] = Math.max(0, Math.min(60000, +e[k]));
        if (typeof b.autoSendTime === "string") config.autoSendTime = b.autoSendTime.trim();
        if (typeof b.ownerPin === "string" && /^\d{4,8}$/.test(b.ownerPin)) config.ownerPin = b.ownerPin;
        if (typeof b.storeName === "string" && b.storeName.trim()) config.storeName = b.storeName.trim();
        saveConfig(); changed(); return send(res, 200, { ok: true });
      }
      if (P === "/api/admin/product" && req.method === "POST") {
        const b = await readBody(req); const p = db.products[b.id]; if (!p) return send(res, 404, { error: "not_found" });
        if (b.delete) { delete db.products[b.id]; logIt("del", p.name, "PC"); } else for (const k of ["name", "code", "price", "cost", "min", "dept", "cat"]) if (b[k] !== undefined) p[k] = ["price", "cost", "min"].includes(k) ? Number(b[k]) || 0 : String(b[k]);
        changed(); return send(res, 200, { ok: true });
      }
      if (P === "/api/admin/backup" && req.method === "GET") { res.writeHead(200, { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="respaldo-inventario-${new Date().toISOString().slice(0, 10)}.json"` }); return res.end(JSON.stringify(db, null, 1)); }
      return send(res, 404, { error: "not_found" });
    }

    // static files
    let f = P === "/" ? "app.html" : P === "/pc" || P === "/pc/" ? "pc.html" : P.replace(/^\/+/, "");
    if (f.includes("..")) return send(res, 400, "bad", "text/plain");
    if (P === "/pc" && !isLocal(req) && url.searchParams.get("pin") !== String(config.ownerPin)) {
      return send(res, 403, "<meta name=viewport content='width=device-width'><p style='font:16px system-ui;padding:24px'>Esta pantalla solo abre en la computadora de la tienda. / This screen only opens on the store computer.</p>", "text/html; charset=utf-8");
    }
    const file = path.join(PUBLIC, f);
    if (!file.startsWith(PUBLIC) || !fs.existsSync(file)) return send(res, 404, "No encontrado", "text/plain; charset=utf-8");
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": f.startsWith("libs/") ? "max-age=86400" : "no-cache" });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    console.log("! Error:", e.message); send(res, 500, { error: "server", message: e.message });
  }
});
let mainTries = 0;
server.on("error", e => {
  if (e.code === "EADDRINUSE" && ++mainTries < 20) return setTimeout(() => server.listen(config.port, "0.0.0.0"), 1500);
  if (e.code === "EADDRINUSE") { console.log(`\n! El puerto ${config.port} ya está en uso. ¿El programa ya está abierto en otra ventana?\n`); }
  else console.log("! Error del servidor:", e.message);
  setTimeout(() => process.exit(1), 15000);
});
function programStatus() {
  const E = config.eleventaDb, r = salesState.report || {};
  return { version: VERSION, now: nowISO(), latest: updState.latest, updateError: updState.error,
    eleventa: { on: !!E.enabled, ok: !!(E.table && E.idCol), salesTable: E.table || "", stock: E.prodTable && E.stockCol ? E.prodTable + "." + E.stockCol : "", error: E.enabled ? (salesState.error || "") : (r.error || ""),
      lastRead: salesState.lastRun, lastCount: salesState.lastCount },
    writes: { lastRun: writeState.lastRun, lastCount: writeState.lastCount, error: writeState.error, notFound: writeState.notFound.slice(0, 20), recent: writeState.recent.slice(0, 6).map(r => ({ name: r.name || r.code, old: r.old, new: r.new, ts: r.ts, who: r.who })) } };
}
/* ---------------- runs by itself: self-update, start with Windows, Eleventa setup ---------------- */
const vnum = v => String(v || "0").split(".").map(n => parseInt(n, 10) || 0);
const newer = (a, b) => { const x = vnum(a), y = vnum(b); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
const updState = { checkedAt: null, latest: "", error: "", updating: false };
async function checkUpdate() {
  if (!config.autoUpdate || !IS_PKG || (process.platform !== "win32" && !process.env.PDC_UPDATE_TEST) || updState.updating) return;
  if (job.state === "typing" || job.state === "countdown" || writeState.running) return;
  try {
    const r = await fetchUrl(config.updateUrl + "?t=" + Date.now(), { timeout: 20000 });
    if (r.status !== 200) throw new Error("http " + r.status);
    const m = JSON.parse(r.body); updState.checkedAt = nowISO(); updState.latest = m.version || ""; updState.error = "";
    if (!m.url || !newer(m.version, VERSION)) return;
    updState.updating = true; console.log(`> Hay una versión nueva (${m.version}). Descargando…`);
    const exe = process.execPath, tmp = exe + ".new";
    try { fs.unlinkSync(tmp); } catch (_) {}
    await fetchUrl(m.url + "?v=" + encodeURIComponent(m.version), { file: tmp, timeout: 600000 });
    const sum = crypto.createHash("sha256").update(fs.readFileSync(tmp)).digest("hex");
    if (m.sha256 && sum !== String(m.sha256).toLowerCase()) throw new Error("la descarga no coincide, lo intento más tarde");
    try { fs.unlinkSync(exe + ".old"); } catch (_) {}
    fs.renameSync(exe, exe + ".old"); fs.renameSync(tmp, exe);
    console.log(`> Actualizado a ${m.version}. Reiniciando…`);
    if (process.platform !== "win32") fs.chmodSync(exe, 0o755);
    try { atomicWrite(DATA_FILE, JSON.stringify(db)); } catch (_) {}
    const rollback = why => {   // the new copy didn't start: put the old one back and keep running
      try { fs.renameSync(exe, exe + ".fallo"); fs.renameSync(exe + ".old", exe); } catch (_) {}
      updState.updating = false; updState.error = "No pude abrir la versión nueva: " + why; console.log("! " + updState.error);
    };
    let child;
    try { child = spawn(exe, [], { cwd: path.dirname(exe), detached: true, stdio: "ignore", env: { ...process.env, PDC_NO_BROWSER: "1" } }); }
    catch (e) { return rollback(e.message); }
    child.on("error", e => rollback(e.message));
    child.on("spawn", () => { child.unref(); stopTunnel(); setTimeout(() => process.exit(0), 800); });
  } catch (e) { updState.error = e.message || String(e); updState.updating = false; console.log("! No pude actualizar:", updState.error); }
}
setTimeout(checkUpdate, process.env.PDC_UPDATE_TEST ? 5000 : 90 * 1000); setInterval(checkUpdate, 30 * 60 * 1000);
function ensureAutoStart() {
  if (!config.autoStart || !IS_PKG || process.platform !== "win32" || !process.env.APPDATA) return;
  try {
    const dir = path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup");
    const f = path.join(dir, "MX Studio Inventario.cmd");
    const body = `@echo off\r\ncd /d "${path.dirname(process.execPath)}"\r\nstart "" "${process.execPath}"\r\n`;
    if (!fs.existsSync(f) || fs.readFileSync(f, "utf8") !== body) { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, body); console.log("> Se abrirá solo cuando prendan la computadora."); }
  } catch (e) { console.log("! No pude ponerlo al inicio de Windows:", e.message); }
}
ensureAutoStart();
// Eleventa: test and turn on sync by itself the first time, and again after every update (detection fixes apply remotely)
async function autoSetupEleventa() {
  const E = config.eleventaDb, firstTime = !E.autoDone, upgraded = config.lastVersion !== VERSION;
  if (!firstTime && !upgraded && E.table && E.prodTable) return;
  const r = await eleventaDiagnose();
  if (r.ok && (firstTime || E.enabled || E.autoDone)) { E.enabled = true; console.log("> Eleventa conectado: ventas y conteos se sincronizan solos."); }
  else if (!r.ok) console.log("! Eleventa:", r.error || "no pude conectarme");
  E.autoDone = true; config.lastVersion = VERSION; saveConfig(); version++; broadcast();
  if (E.enabled) cloudPull();
}
setTimeout(() => { autoSetupEleventa().catch(e => console.log("! Eleventa:", e.message)); }, 8000);

server.listen(config.port, "0.0.0.0", () => {
  const addrs = lanAddresses();
  console.log("\n  MX Studio · Inventario " + VERSION);
  console.log("  " + config.storeName + "\n");
  console.log("  Esta computadora:      http://localhost:" + config.port + "/pc");
  for (const a of addrs) console.log("  Teléfonos (Wi-Fi):     http://" + a + ":" + config.port);
  console.log("\n  Deja esta ventana abierta mientras usan la app. / Keep this window open.\n");
  if (MOCK_TYPER) console.log("  (Modo prueba: el tecleo se guarda en tecleado-prueba.txt)\n");
  if (config.openBrowser && process.platform === "win32" && !process.env.PDC_NO_BROWSER) exec(`start "" "http://localhost:${config.port}/pc"`);
});
process.on("SIGINT", () => { try { atomicWrite(DATA_FILE, JSON.stringify(db)); } catch (_) {} process.exit(0); });
