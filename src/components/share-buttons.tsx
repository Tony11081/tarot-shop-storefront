"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type ShareButtonsProps = {
  imageUrl?: string;
  placement: string;
  text: string;
  title: string;
  tone?: "dark" | "light";
  url: string;
};

type ShareDestination = {
  href: string;
  label: string;
  network: string;
};

function buildShareDestinations({ imageUrl, text, url }: Pick<ShareButtonsProps, "imageUrl" | "text" | "url">) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const encodedImage = imageUrl ? encodeURIComponent(imageUrl) : encodedUrl;

  return [
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: "Facebook",
      network: "facebook",
    },
    {
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      label: "X",
      network: "x",
    },
    {
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      label: "WhatsApp",
      network: "whatsapp",
    },
    {
      href: `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedText}`,
      label: "Pinterest",
      network: "pinterest",
    },
  ] satisfies ShareDestination[];
}

export function ShareButtons({ imageUrl, placement, text, title, tone = "light", url }: ShareButtonsProps) {
  const [copyState, setCopyState] = useState<"error" | "idle" | "success">("idle");

  useEffect(() => {
    if (copyState === "idle") return;

    const timeoutId = window.setTimeout(() => setCopyState("idle"), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  const buttonClassName =
    tone === "dark"
      ? "rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-[#f6ecd9] transition hover:bg-white/16"
      : "rounded-full border border-[color:var(--border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-white";

  const hintClassName =
    tone === "dark" ? "text-xs text-[#f6ecd9]/60" : "text-xs text-[color:var(--muted)]";

  const destinations = buildShareDestinations({ imageUrl, text, url });

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("success");
      trackEvent("share_click", { network: "copy_link", placement, title, url });
    } catch {
      setCopyState("error");
    }
  }

  async function handleNativeShare() {
    if (!navigator.share) {
      await handleCopyLink();
      return;
    }

    try {
      await navigator.share({ text, title, url });
      trackEvent("share_click", { network: "native", placement, title, url });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setCopyState("error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleNativeShare} className={buttonClassName}>
          Share
        </button>

        {destinations.map((destination) => (
          <a
            key={destination.network}
            href={destination.href}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackEvent("share_click", {
                network: destination.network,
                placement,
                title,
                url,
              })
            }
            className={buttonClassName}
          >
            {destination.label}
          </a>
        ))}

        <button type="button" onClick={handleCopyLink} className={buttonClassName}>
          {copyState === "success" ? "Copied" : "Copy link"}
        </button>
      </div>

      <p className={`mt-3 ${hintClassName}`} aria-live="polite">
        {copyState === "success"
          ? "Link copied. You can paste it anywhere."
          : copyState === "error"
            ? "Copy failed. Please use the address bar link instead."
            : "Share this page with a friend, gift buyer, or reading partner."}
      </p>
    </div>
  );
}
