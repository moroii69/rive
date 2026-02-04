import { NextRequest } from "next/server";
import { putBinaryObject, putJsonObject } from "@/lib/r2";

const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      code,
      fileName,
      fileType,
      fileSize,
      expiresAt,
      encryptedFileBase64,
      encryptedFileKeyBase64,
      fileIvBase64,
      keyIvBase64,
      saltBase64,
    } = body;

    if (!code || typeof code !== "string" || code.length < 4 || code.length > 8) {
      return new Response(JSON.stringify({ error: "Invalid code" }), { status: 400 });
    }

    if (!fileName || !encryptedFileBase64 || !encryptedFileKeyBase64) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }

    if (typeof fileSize !== "number" || fileSize <= 0 || fileSize > MAX_FILE_SIZE_BYTES) {
      return new Response(JSON.stringify({ error: "File too large" }), { status: 400 });
    }

    const now = Date.now();
    const expiresTime = new Date(expiresAt).getTime();
    if (!expiresTime || expiresTime <= now) {
      return new Response(JSON.stringify({ error: "Invalid expiry" }), { status: 400 });
    }

    const encryptedFileBytes = Buffer.from(encryptedFileBase64, "base64");

    const objectId = crypto.randomUUID();
    const fileKey = `files/${objectId}`;
    const metaKey = `meta/${code}.json`;

    await putBinaryObject(fileKey, encryptedFileBytes, "application/octet-stream");

    await putJsonObject(metaKey, {
      objectId,
      fileKey,
      fileName,
      fileType,
      fileSize,
      expiresAt,
      encryptedFileKeyBase64,
      fileIvBase64,
      keyIvBase64,
      saltBase64,
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
}

