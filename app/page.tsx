import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex flex-1 items-center">
      <div className="flex w-full flex-col items-start gap-8 md:max-w-2xl">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">
            ENCRYPTED FILE HANDOFF
          </p>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl">
            Fast, one‑time links for{" "}
            <span className="italic underline underline-offset-4 text-slate-200">
              device‑to‑device
            </span>{" "}
            file transfer.
          </h1>
          <p className="max-w-xl text-sm text-slate-400">
            rive encrypts files in your browser with AES‑256‑GCM and wraps the key in a
            short numeric code. Servers and Cloudflare R2 only ever see ciphertext.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/send">
              <Button className="w-full px-6 sm:w-auto">Send a file</Button>
            </Link>
            <Link href="/receive">
              <Button variant="ghost" className="w-full px-6 sm:w-auto">
                Receive a file
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
