import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});

const bucket = process.env.R2_BUCKET_NAME as string;

export async function putBinaryObject(key: string, body: Uint8Array, contentType: string) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function putJsonObject(key: string, data: unknown) {
  const body = Buffer.from(JSON.stringify(data), "utf-8");
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "application/json",
    })
  );
}

export async function getBinaryObject(key: string) {
  const res = await r2Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!res.Body) {
    throw new Error("Object body is empty");
  }

  const body = await res.Body.transformToWebStream();
  const length = typeof res.ContentLength === "number" ? res.ContentLength : undefined;

  return { body, length, contentType: res.ContentType ?? "application/octet-stream" };
}

export async function getJsonObject<T>(key: string): Promise<T | null> {
  try {
    const res = await r2Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    if (!res.Body) return null;
    const text = await res.Body.transformToString();
    return JSON.parse(text) as T;
  } catch (err: any) {
    if (err?.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw err;
  }
}

export async function deleteObject(key: string) {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export async function listObjects(prefix: string) {
  const res = await r2Client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    })
  );
  return res.Contents ?? [];
}

