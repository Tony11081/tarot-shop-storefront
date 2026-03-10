const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://medusa-store-ga7di9-4e3642-23-94-38-181.traefik.me";

const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  "pk_09366c13946417ef754c5f686e295be2dc1df6d2c3532dc2942d185772ed9698";

export type Product = {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  thumbnail: string | null;
  variants?: Array<{
    id: string;
    title: string;
    calculated_price?: {
      calculated_amount?: number;
      original_amount?: number;
      currency_code?: string;
    };
    prices?: Array<{
      amount: number;
      currency_code: string;
    }>;
    options?: Array<{
      id: string;
      value: string;
      option?: {
        title: string;
      };
    }>;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    handle: string;
  }>;
  options?: Array<{
    id: string;
    title: string;
    values: Array<{
      id: string;
      value: string;
    }>;
  }>;
};

export type Category = {
  id: string;
  name: string;
  handle: string;
};

async function medusaFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    headers: {
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Medusa request failed: ${response.status}`);
  }

  return response.json();
}

export async function getProducts(): Promise<Product[]> {
  const data = await medusaFetch<{ products: Product[] }>("/store/products?limit=12");
  return data.products ?? [];
}

export async function getProduct(handle: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.handle === handle) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const products = await getProducts();
  const categoryMap = new Map<string, Category>();

  for (const product of products) {
    for (const category of product.categories ?? []) {
      categoryMap.set(category.id, category);
    }
  }

  return Array.from(categoryMap.values());
}

export function formatPrice(product: Product): string {
  const variant = product.variants?.[0];
  const calculated = variant?.calculated_price;
  const rawAmount =
    calculated?.calculated_amount ??
    calculated?.original_amount ??
    variant?.prices?.[0]?.amount ??
    0;
  const currency =
    calculated?.currency_code ?? variant?.prices?.[0]?.currency_code ?? "usd";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(rawAmount / 100);
}
