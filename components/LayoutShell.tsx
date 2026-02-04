"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

export function LayoutShell({ children }: Props) {
  const pathname = usePathname();
  const isSend = pathname === "/send";
  const isReceive = pathname?.startsWith("/receive");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-sm font-mono uppercase tracking-[0.3em] text-slate-300 hover:text-slate-100">
              rive
            </Link>
          </div>
          <nav className="flex items-center gap-1">
            <div className="flex gap-1 rounded-full border border-slate-800 bg-slate-900/70 p-1 text-xs text-slate-300 shadow-sm backdrop-blur">
              <Link
                href="/send"
                className={`rounded-full px-3 py-1 transition ${
                  isSend ? "bg-slate-100 text-slate-900 shadow" : "hover:bg-slate-800/70"
                }`}
              >
                Send
              </Link>
              <Link
                href="/receive"
                className={`rounded-full px-3 py-1 transition ${
                  isReceive ? "bg-slate-100 text-slate-900 shadow" : "hover:bg-slate-800/70"
                }`}
              >
                Receive
              </Link>
            </div>
            <Link
              href="/how-it-works"
              className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              How it works
            </Link>
            <a
              href="https://github.com/moroii69/rive"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              GitHub
            </a>
          </nav>
        </header>
        <main className="flex flex-1 items-center justify-center py-6">{children}</main>
        <footer className="flex flex-col gap-1 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>End‑to‑end encrypted. Files never touch plain text on the server.</p>
          <p className="sm:text-right">
            Backed by <span className="text-slate-300">Cloudflare R2</span> · AES‑256‑GCM ·
            PBKDF2
          </p>
        </footer>
      </div>
    </div>
  );
}

