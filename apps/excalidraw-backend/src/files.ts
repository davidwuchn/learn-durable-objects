import { Hono } from "hono";
import { z } from "zod";

const files = new Hono<{ Bindings: CloudflareBindings }>();

files.post("/upload", async (c) => {
  const body = await c.req.json();
  const { id, dataURL, mimeType } = body;
  await c.env.R2_BUCKET.put(id, dataURL, {
    httpMetadata: {
      contentType: mimeType,
    },
  });
  return c.json({ id });
});

files.get("/:fileId", async (c) => {
  const { fileId } = c.req.param();
  const file = await c.env.R2_BUCKET.get(fileId);
  if (!file) {
    return c.notFound();
  }
  const headers = new Headers();
  file.writeHttpMetadata(headers);
  headers.set("etag", file.httpEtag);
  return new Response(file.body, {
    headers,
  });
});

export default files;
