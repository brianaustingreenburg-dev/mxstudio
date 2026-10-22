// ✝️ MX Studio · shared store inventory API (phones + store computer). Logic lives in ../inv-core.mjs.
import { getStore } from "@netlify/blobs";
import { handle } from "../inv-core.mjs";

function blobStore() {
  const s = getStore({ name: "mxinventario", consistency: "strong" });
  return {
    async get(key) {
      const r = await s.getWithMetadata(key, { type: "json" });
      return r ? { data: r.data, etag: r.etag } : null;
    },
    async set(key, data, etag) {
      const r = await s.setJSON(key, data, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
      return !r || r.modified !== false;
    },
  };
}

export default async (req) => handle(req, blobStore());

export const config = { path: "/api/inventario" };
