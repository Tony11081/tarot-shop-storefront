import seedConfig from "../../medusa-site-config.json";

type SeedPrice = {
  amount: number;
  currency_code: string;
};

type SeedVariant = {
  options?: Record<string, string>;
  prices?: SeedPrice[];
  sku?: string;
  title: string;
};

type SeedProduct = {
  categories?: string[];
  description?: string;
  handle: string;
  options?: Array<{
    title: string;
    values: string[];
  }>;
  title: string;
  variants?: SeedVariant[];
};

type SeedCatalog = {
  categories?: string[];
  products?: SeedProduct[];
};

const catalog = seedConfig as SeedCatalog;

export const seededCategoryNames = catalog.categories ?? [];

const seededProducts = catalog.products ?? [];

const seededProductsByHandle = new Map(seededProducts.map((product) => [product.handle, product]));

export function slugifyCategory(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getSeedProduct(handle: string) {
  return seededProductsByHandle.get(handle);
}

export function getSeedCategories(handle: string) {
  return getSeedProduct(handle)?.categories ?? [];
}

export function getSeedVariantPrice(handle: string, variantTitle?: string, sku?: string) {
  const seedProduct = getSeedProduct(handle);
  if (!seedProduct?.variants?.length) return null;

  const exact =
    seedProduct.variants.find((variant) => sku && variant.sku === sku) ??
    seedProduct.variants.find((variant) => variantTitle && variant.title === variantTitle) ??
    seedProduct.variants[0];

  return exact?.prices?.[0] ?? null;
}

export function getSeedProductCategoryIndex(name: string) {
  const index = seededCategoryNames.indexOf(name);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function getSeedProductOptionValues(handle: string) {
  return getSeedProduct(handle)?.options ?? [];
}
