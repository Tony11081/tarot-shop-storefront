"use client";

import { track } from "@vercel/analytics";

type AnalyticsValue = boolean | null | number | string | undefined;

export function trackEvent(name: string, properties?: Record<string, AnalyticsValue>) {
  const payload = Object.fromEntries(
    Object.entries(properties ?? {}).filter(([, value]) => value !== undefined && value !== null)
  );

  track(name, payload);
}
