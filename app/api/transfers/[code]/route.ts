import { NextRequest } from "next/server";
import { getBinaryObject, getJsonObject } from "@/lib/r2";

type TransferMeta = {
  objectId: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  expiresAt: string;
  encryptedFileKeyBase64: string;
  fileIvBase64: string;
  keyIvBase64: string;
  saltBase64: string;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const metaKey = `meta/${code}.json`;

  const meta = await getJsonObject<TransferMeta>(metaKey);
  if (!meta) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  const now = Date.now();
  const expires = new Date(meta.expiresAt).getTime();
  if (!expires || expires <= now) {
    return new Response(JSON.stringify({ error: "Expired" }), { status: 410 });
  }

  const { fileName, fileType, fileSize, expiresAt } = meta;

  return new Response(
    JSON.stringify({
      fileName,
      fileType,
      fileSize,
      expiresAt,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const metaKey = `meta/${code}.json`;

  const meta = await getJsonObject<TransferMeta>(metaKey);
  if (!meta) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  const now = Date.now();
  const expires = new Date(meta.expiresAt).getTime();
  if (!expires || expires <= now) {
    return new Response(JSON.stringify({ error: "Expired" }), { status: 410 });
  }

  const { searchParams } = new URL(req.url);
  const includeKey = searchParams.get("includeKey") === "1";

  const { body, length, contentType } = await getBinaryObject(meta.fileKey);

  const headers: HeadersInit = {
    "Content-Type": contentType,
  };
  if (typeof length === "number") {
    headers["Content-Length"] = length.toString();
  }

  if (includeKey) {
    headers["X-Encrypted-File-Key"] = meta.encryptedFileKeyBase64;
    headers["X-File-IV"] = meta.fileIvBase64;
    headers["X-Key-IV"] = meta.keyIvBase64;
    headers["X-Salt"] = meta.saltBase64;
  }

  return new Response(body, {
    status: 200,
    headers,
  });
}

