"use client";

import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

type LeadCaptureFormProps = {
  accent?: "dark" | "light";
  buttonLabel?: string;
  description: string;
  eyebrow: string;
  placement: string;
  title: string;
};

const intentOptions = [
  { value: "first-deck", label: "I'm buying my first deck" },
  { value: "gift", label: "I'm shopping for a gift" },
  { value: "collector", label: "Show me collector picks" },
];

export function LeadCaptureForm({
  accent = "light",
  buttonLabel = "Send my tarot guide",
  description,
  eyebrow,
  placement,
  title,
}: LeadCaptureFormProps) {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState(intentOptions[0].value);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const isDark = accent === "dark";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          intent,
          placement,
          sourcePath: pathname,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Could not save your request");
      }

      setStatus("success");
      setMessage(data?.message || "Your tarot guide request is in.");
      setEmail("");
      trackEvent("lead_capture", {
        intent,
        placement,
        source_path: pathname,
      });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not save your request");
    }
  }

  return (
    <section
      className={`rounded-[2rem] border p-6 md:p-8 ${
        isDark
          ? "border-white/12 bg-[color:var(--foreground)] text-[color:var(--background)]"
          : "border-[color:var(--border)] bg-[color:var(--panel)]"
      }`}
    >
      <div
        className={`font-mono text-[0.68rem] uppercase tracking-[0.3em] ${
          isDark ? "text-[color:rgba(243,234,216,0.62)]" : "text-[color:var(--muted)]"
        }`}
      >
        {eyebrow}
      </div>
      <h2
        className={`font-display mt-4 text-4xl leading-none md:text-5xl ${
          isDark ? "text-[color:var(--background)]" : "text-[color:var(--foreground)]"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-4 max-w-2xl text-sm leading-8 ${
          isDark ? "text-[color:rgba(243,234,216,0.82)]" : "text-ink-soft"
        }`}
      >
        {description}
      </p>

      <form className="mt-6 grid gap-3 md:grid-cols-[1.1fr_0.9fr_auto]" onSubmit={handleSubmit}>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className={`rounded-[1.2rem] border px-4 py-3 text-sm outline-none ${
            isDark
              ? "border-white/12 bg-white/10 text-[color:var(--background)] placeholder:text-[color:rgba(243,234,216,0.55)]"
              : "border-[color:var(--border)] bg-white/75 text-[color:var(--foreground)] placeholder:text-[color:var(--muted)]"
          }`}
        />
        <select
          value={intent}
          onChange={(event) => setIntent(event.target.value)}
          className={`rounded-[1.2rem] border px-4 py-3 text-sm outline-none ${
            isDark
              ? "border-white/12 bg-white/10 text-[color:var(--background)]"
              : "border-[color:var(--border)] bg-white/75 text-[color:var(--foreground)]"
          }`}
        >
          {intentOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className={isDark ? "text-[color:var(--foreground)]" : undefined}
            >
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={status === "loading"}
          className={`rounded-full px-6 py-3 text-sm font-semibold transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60 ${
            isDark
              ? "bg-[color:var(--background)] text-[color:var(--foreground)]"
              : "bg-[color:var(--foreground)] text-[color:var(--background)]"
          }`}
        >
          {status === "loading" ? "Sending..." : buttonLabel}
        </button>
      </form>

      <p
        className={`mt-4 text-xs leading-6 ${
          isDark ? "text-[color:rgba(243,234,216,0.68)]" : "text-[color:var(--muted)]"
        }`}
      >
        Expect beginner picks, giftable deck ideas, and the occasional collector drop. No inbox clutter.
      </p>

      {message ? (
        <p
          className={`mt-4 text-sm ${
            status === "success"
              ? isDark
                ? "text-emerald-200"
                : "text-emerald-700"
              : isDark
                ? "text-rose-200"
                : "text-rose-700"
          }`}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
