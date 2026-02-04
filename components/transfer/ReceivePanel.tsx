"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  decryptFileClientSide,
} from "@/lib/crypto-client";

const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024;

type Phase = "idle" | "fetching" | "downloading" | "decrypting" | "preview" | "error";

type MetaResponse = {
  fileName: string;
  fileType: string;
  fileSize: number;
  expiresAt: string;
};

export function ReceivePanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get("code") ?? "";

  const [code, setCode] = useState(initialCode);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "pdf" | "text" | "binary">(
    "binary"
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (initialCode && initialCode.length === 6) {
      handleLookup(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const expiryCountdown = useMemo(() => {
    if (!meta) return null;
    const expiry = new Date(meta.expiresAt).getTime();
    const now = Date.now();
    const diffMs = expiry - now;
    if (diffMs <= 0) return "expired";
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [meta, phase]);

  const estimatedRemaining = useMemo(() => {
    if (!startedAt || progress <= 0 || progress >= 100) return null;
    const elapsed = (Date.now() - startedAt) / 1000;
    const rate = progress / elapsed;
    if (rate <= 0) return null;
    const remainingProgress = 100 - progress;
    const remainingSeconds = Math.round(remainingProgress / rate);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [progress, startedAt]);

  async function handleLookup(nextCode?: string) {
    const effectiveCode = (nextCode ?? code).trim();
    if (!effectiveCode || effectiveCode.length < 4) return;

    setError(null);
    setPhase("fetching");
    setProgress(0);
    setMeta(null);

    try {
      const res = await fetch(`/api/transfers/${effectiveCode}`, {
        method: "GET",
      });
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("No transfer found for this code.");
        }
        if (res.status === 410) {
          throw new Error("This transfer has expired.");
        }
        throw new Error("Unable to load transfer.");
      }
      const data = (await res.json()) as MetaResponse;
      if (data.fileSize > MAX_FILE_SIZE_BYTES) {
        throw new Error("File exceeds 30 MB limit.");
      }
      setMeta(data);
      setPhase("idle");
      router.replace(`/receive?code=${effectiveCode}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to fetch transfer.");
      setPhase("error");
    }
  }

  async function handleDownloadAndDecrypt() {
    if (!meta || !code) return;
    setError(null);
    setPhase("downloading");
    setProgress(0);
    setStartedAt(Date.now());

    try {
      const res = await fetch(`/api/transfers/${code}?includeKey=1`, {
        method: "POST",
      });
      if (!res.ok || !res.body) {
        throw new Error("Failed to start download.");
      }

      const total = Number(res.headers.get("Content-Length") ?? meta.fileSize);
      const encryptedFileKeyBase64 = res.headers.get("X-Encrypted-File-Key") ?? "";
      const fileIvBase64 = res.headers.get("X-File-IV") ?? "";
      const keyIvBase64 = res.headers.get("X-Key-IV") ?? "";
      const saltBase64 = res.headers.get("X-Salt") ?? "";

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      // Real streaming progress
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          loaded += value.length;
          if (total) {
            setProgress((loaded / total) * 100);
          }
        }
      }

      const encryptedBytes = new Uint8Array(loaded);
      let offset = 0;
      for (const chunk of chunks) {
        encryptedBytes.set(chunk, offset);
        offset += chunk.length;
      }
      setProgress(100);

      setPhase("decrypting");

      const material = {
        code,
        encryptedFile: encryptedBytes.buffer,
        encryptedFileKey: base64ToArrayBuffer(encryptedFileKeyBase64),
        fileIv: new Uint8Array(base64ToArrayBuffer(fileIvBase64)),
        keyIv: new Uint8Array(base64ToArrayBuffer(keyIvBase64)),
        salt: new Uint8Array(base64ToArrayBuffer(saltBase64)),
      };

      const { blob } = await decryptFileClientSide(material);

      const type = inferPreviewType(meta.fileType, meta.fileName);
      setPreviewType(type);

      const url = URL.createObjectURL(
        new Blob([blob], { type: meta.fileType || "application/octet-stream" })
      );
      setPreviewUrl(url);
      setPhase("preview");
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to download or decrypt.");
      setPhase("error");
    }
  }

  function inferPreviewType(fileType: string, fileName: string): typeof previewType {
    if (fileType.startsWith("image/")) return "image";
    if (fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
      return "pdf";
    }
    if (
      fileType.startsWith("text/") ||
      [".txt", ".md", ".json", ".log"].some((ext) => fileName.toLowerCase().endsWith(ext))
    ) {
      return "text";
    }
    return "binary";
  }

  function handleConfirmDownload() {
    if (!previewUrl || !meta) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = meta.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <section className="flex flex-1 flex-col rounded-3xl border border-slate-800/70 bg-transparent p-5 sm:p-7">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Receive a file
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Type the 6‑digit code or scan the QR from the sending device.
          </p>
        </div>
        {meta && (
          <div className="rounded-full border border-neutral-800 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-300">
            Expires in{" "}
            <span className="tabular-nums text-neutral-100">
              {expiryCountdown ?? "…"}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-300">
              Code
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup();
              }}
            >
              <Input
                ref={inputRef}
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(value);
                  setError(null);
                  if (value.length === 6) {
                    handleLookup(value);
                  }
                }}
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                className="w-36 tabular-nums text-center text-lg tracking-[0.2em]"
                placeholder="••••••"
                autoComplete="one-time-code"
              />
            </form>
          </div>

          {meta && (
            <div className="space-y-3 rounded-2xl border border-neutral-800/80 bg-neutral-950/80 p-4 text-xs text-neutral-200">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Incoming file
                  </p>
                  <p className="line-clamp-1 truncate text-sm font-medium">
                    {meta.fileName}
                  </p>
                </div>
                <div className="flex flex-none flex-col items-end text-right text-[11px] text-neutral-400">
                  <p>{(meta.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                  <p className="mt-0.5 max-w-[9rem] truncate">
                    {meta.fileType || "Unknown type"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(phase === "downloading" || phase === "decrypting" || phase === "preview") && (
            <div className="space-y-2">
              <ProgressBar value={phase === "decrypting" ? 95 : progress} />
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>
                  {phase === "downloading"
                    ? `Downloading… ${progress.toFixed(0)}%`
                    : phase === "decrypting"
                    ? "Decrypting locally…"
                    : "Ready to preview"}
                </span>
                {estimatedRemaining && phase === "downloading" && (
                  <span>~{estimatedRemaining} remaining</span>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <Button
            type="button"
            onClick={handleDownloadAndDecrypt}
            disabled={!meta || phase === "downloading" || phase === "decrypting"}
            className="w-full justify-center"
          >
            {phase === "idle" && "Decrypt & preview"}
            {phase === "downloading" && "Downloading…"}
            {phase === "decrypting" && "Decrypting…"}
            {phase === "preview" && "Re-download & preview"}
            {phase === "error" && "Retry"}
          </Button>
        </div>

        <div className="flex flex-col rounded-2xl border border-neutral-800/80 bg-neutral-950/80 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
            Preview & confirm
          </p>
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-800 bg-neutral-950/80 p-3">
            {!previewUrl && (
              <p className="max-w-xs text-center text-xs text-neutral-500">
                Decrypted previews for images, PDFs, and text will appear here.
              </p>
            )}
            {previewUrl && previewType === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Decrypted preview"
                className="max-h-72 max-w-full rounded-lg border border-neutral-800 object-contain"
              />
            )}
            {previewUrl && previewType === "pdf" && (
              <iframe
                src={previewUrl}
                className="h-72 w-full rounded-lg border border-neutral-800 bg-white"
              />
            )}
            {previewUrl && previewType === "text" && (
              <iframe
                src={previewUrl}
                className="h-72 w-full rounded-lg border border-neutral-800 bg-neutral-950"
              />
            )}
            {previewUrl && previewType === "binary" && (
              <p className="max-w-xs text-center text-xs text-neutral-400">
                This file type can&apos;t be previewed, but you can still download it
                securely.
              </p>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              disabled={!previewUrl || !meta}
              onClick={handleConfirmDownload}
              className="h-8 px-4 text-[11px]"
            >
              Save to this device
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

