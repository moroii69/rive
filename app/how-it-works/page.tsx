import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Choose a file",
    description:
      "Select any file up to 30 MB from your device.",
  },
  {
    number: "02",
    title: "Encrypt in your browser",
    description:
      "Your file is encrypted locally before anything is uploaded.",
  },
  {
    number: "03",
    title: "Upload securely",
    description:
      "Only encrypted data is sent to the cloud. We never see your files.",
  },
  {
    number: "04",
    title: "Share the code",
    description:
      "Send the 6-digit code to your recipient however you like.",
  },
  {
    number: "05",
    title: "Decrypt & download",
    description:
      "They enter the code and decrypt the file in their browser.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="flex flex-1 items-center justify-center">
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-12 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">
            HOW IT WORKS
          </p>
          <h1 className="text-balance text-2xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-3xl">
            Secure file sharing in five simple steps
          </h1>
        </div>

        <ol className="mb-12 w-full space-y-8">
          {steps.map((step) => (
            <li key={step.number} className="flex items-start gap-6 text-left">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800/50 font-mono text-sm text-slate-400">
                {step.number}
              </span>
              <div className="space-y-1 pt-1.5">
                <h2 className="text-base font-medium text-slate-100">{step.title}</h2>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href="/send"
          className="rounded-full border border-slate-700/50 bg-slate-800/40 px-6 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800/70 hover:text-slate-100"
        >
          ← Start sending
        </Link>
      </div>
    </main>
  );
}
