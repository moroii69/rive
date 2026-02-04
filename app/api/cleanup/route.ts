import { NextRequest } from "next/server";
import { listObjects, getJsonObject, deleteObject } from "@/lib/r2";

type TransferMeta = {
  objectId: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  expiresAt: string;
};

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CLEANUP_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const metaObjects = await listObjects("meta/");
    const now = Date.now();
    let deleted = 0;
    let failed = 0;

    for (const obj of metaObjects) {
      if (!obj.Key) continue;

      try {
        const meta = await getJsonObject<TransferMeta>(obj.Key);
        if (!meta) continue;

        const expiresAt = new Date(meta.expiresAt).getTime();
        if (expiresAt && expiresAt <= now) {
          await deleteObject(meta.fileKey);
          await deleteObject(obj.Key);
          deleted++;
        }
      } catch (err) {
        console.error(`Failed to process ${obj.Key}:`, err);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        deleted,
        failed,
        checked: metaObjects.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Cleanup failed:", err);
    return new Response(JSON.stringify({ error: "Cleanup failed" }), { status: 500 });
  }
}
