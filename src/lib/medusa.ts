import {
  getSeedCategories,
  getSeedProduct,
  getSeedProductCategoryIndex,
  getSeedProductOptionValues,
  getSeedVariantPrice,
  seededCategoryNames,
  slugifyCategory,
} from "@/lib/catalog";

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
  variants?: ProductVariant[];
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

export type ProductVariant = {
  id: string;
  title: string;
  sku?: string | null;
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

function mergeSeedCatalogData(product: Product): Product {
  const seedProduct = getSeedProduct(product.handle);
  if (!seedProduct) return product;

  const categories =
    product.categories?.length
      ? product.categories
      : (getSeedCategories(product.handle) ?? []).map((name) => ({
          id: `seed-cat:${slugifyCategory(name)}`,
          name,
          handle: slugifyCategory(name),
        }));

  const options =
    product.options?.length
      ? product.options
      : getSeedProductOptionValues(product.handle).map((option, index) => ({
          id: `seed-opt:${product.handle}:${index}`,
          title: option.title,
          values: option.values.map((value, valueIndex) => ({
            id: `seed-optval:${product.handle}:${index}:${valueIndex}`,
            value,
          })),
        }));

  const variants = (product.variants ?? []).map((variant) => {
    const seedPrice = getSeedVariantPrice(product.handle, variant.title, variant.sku ?? undefined);
    const prices = variant.prices?.length ? variant.prices : seedPrice ? [seedPrice] : [];

    return {
      ...variant,
      prices,
      calculated_price:
        variant.calculated_price?.calculated_amount || variant.calculated_price?.original_amount
          ? variant.calculated_price
          : seedPrice
            ? {
                calculated_amount: seedPrice.amount,
                original_amount: seedPrice.amount,
                currency_code: seedPrice.currency_code,
              }
            : variant.calculated_price,
    };
  });

  return {
    ...product,
    description: product.description || seedProduct.description || null,
    categories,
    options,
    variants,
  };
}

export async function getProducts(): Promise<Product[]> {
  const data = await medusaFetch<{ products: Product[] }>("/store/products?limit=12");
  return (data.products ?? []).map(mergeSeedCatalogData);
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

  if (!categoryMap.size) {
    return seededCategoryNames.map((name) => ({
      id: `seed-cat:${slugifyCategory(name)}`,
      name,
      handle: slugifyCategory(name),
    }));
  }

  return Array.from(categoryMap.values()).sort((left, right) => {
    const orderDelta = getSeedProductCategoryIndex(left.name) - getSeedProductCategoryIndex(right.name);
    return orderDelta || left.name.localeCompare(right.name);
  });
}

function formatCurrency(amount = 0, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function getVariantPrice(variant?: ProductVariant | null, productHandle?: string) {
  if (!variant) return null;

  const calculatedAmount = variant.calculated_price?.calculated_amount ?? variant.calculated_price?.original_amount;
  const calculatedCurrency = variant.calculated_price?.currency_code;
  if (typeof calculatedAmount === "number" && calculatedAmount > 0) {
    return {
      amount: calculatedAmount,
      currency_code: calculatedCurrency || "usd",
    };
  }

  const listedPrice = variant.prices?.find((price) => typeof price.amount === "number" && price.amount > 0);
  if (listedPrice) {
    return listedPrice;
  }

  if (productHandle) {
    return getSeedVariantPrice(productHandle, variant.title, variant.sku ?? undefined);
  }

  return null;
}

export function getProductPriceRange(product: Product) {
  const prices = (product.variants ?? [])
    .map((variant) => getVariantPrice(variant, product.handle))
    .filter((price): price is NonNullable<typeof price> => Boolean(price));

  if (!prices.length) {
    const seedProduct = getSeedProduct(product.handle);
    const seededPrices = (seedProduct?.variants ?? [])
      .map((variant) => variant.prices?.[0])
      .filter((price): price is NonNullable<typeof price> => Boolean(price));

    if (!seededPrices.length) {
      return null;
    }

    const amounts = seededPrices.map((price) => price.amount);
    return {
      currency_code: seededPrices[0].currency_code,
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    };
  }

  const amounts = prices.map((price) => price.amount);
  return {
    currency_code: prices[0].currency_code,
    min: Math.min(...amounts),
    max: Math.max(...amounts),
  };
}

export function formatPrice(product: Product): string {
  const range = getProductPriceRange(product);
  if (!range) return "See options";
  if (range.min === range.max) {
    return formatCurrency(range.min, range.currency_code);
  }

  return `From ${formatCurrency(range.min, range.currency_code)}`;
}
