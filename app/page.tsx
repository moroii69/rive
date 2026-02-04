import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex flex-1 items-center">
      <div className="flex w-full flex-col items-start gap-8 md:max-w-2xl">
        <div className="space-y-6">
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl">
            Fast, one‑time links for{" "}
            <span className="italic underline underline-offset-4 text-slate-200">
              device‑to‑device
            </span>{" "}
            file transfer.
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Don't want to open your personal email or WhatsApp on a work, university, or public device? Rive lets you transfer files without logging into anything.
          </p>
          <p className="max-w-xl text-sm text-slate-500">
            Just upload, share a 6-digit code, and download on the other side—encrypted end-to-end.
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
          <Link
            href="/how-it-works"
            className="text-sm text-slate-400 underline underline-offset-4 hover:text-slate-200 transition"
          >
            How it works →
          </Link>
        </div>
      </div>
    </main>
  );
}
