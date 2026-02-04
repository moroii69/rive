import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <main className="flex flex-1 items-center justify-center py-12">
      <article className="w-full max-w-lg space-y-8">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            How Rive works
          </h1>
          <p className="text-sm text-slate-400">
            A quick look at what happens when you share a file.
          </p>
        </header>

        <div className="space-y-6 text-[15px] leading-relaxed text-slate-300">
          <p>
            When you upload a file, it never leaves your browser in its original form. 
            Instead, Rive encrypts it locally using <a href="https://www.npmjs.com/package/aes-256-gcm" target="_blank" rel="noopener noreferrer" className="text-slate-100 underline underline-offset-2 hover:text-white">AES-256-GCM</a>,  the 
            same standard used by banks and governments.
          </p>

          <p>
            The encryption key is derived from a short 6-digit code. Only someone 
            with that code can decrypt the file. We generate one for you, or you 
            can choose your own.
          </p>

          <p>
            Once encrypted, the file is uploaded to our servers. But here's the thing: 
            we only ever see scrambled data. Without the code, it's meaningless noise.
          </p>

          <p>
            On the receiving end, the process reverses. Your recipient enters the code, 
            downloads the encrypted file, and their browser decrypts it locally. 
            The original file is reconstructed without ever touching our servers in plain form.
          </p>

          <p className="text-slate-400">
            No accounts. No logins. No data we can read. Just a simple code shared 
            between you and your recipient.
          </p>

          <p className="text-sm text-slate-500">
            100% free · No limits · No sign-up required
          </p>
        </div>

        <footer className="pt-4">
          <Link
            href="/send"
            className="text-sm text-slate-400 underline underline-offset-4 transition hover:text-slate-200"
          >
            ← Back to sending
          </Link>
        </footer>
      </article>
    </main>
  );
}
