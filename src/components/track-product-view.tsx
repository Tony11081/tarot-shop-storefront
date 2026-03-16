"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

type TrackProductViewProps = {
  category: string;
  handle: string;
  priceLabel: string;
  title: string;
};

export function TrackProductView({ category, handle, priceLabel, title }: TrackProductViewProps) {
  useEffect(() => {
    trackEvent("product_view", {
      category,
      handle,
      price_label: priceLabel,
      title,
    });
  }, [category, handle, priceLabel, title]);

  return null;
}
