const INFLYWAY_API_BASE_URL =
  process.env.INFLYWAY_API_BASE_URL || "https://inflyway-api.openaigrowth.com";

const INFLYWAY_API_KEY = process.env.INFLYWAY_API_KEY || "";

export class InflywayRequestError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "InflywayRequestError";
    this.status = status;
    this.body = body;
  }
}

type InflywayApiResponse = {
  success?: boolean;
  error?: string;
};

type InflywayCheckoutPayload = {
  amount: number;
  currency?: string;
  email?: string;
  note?: string;
  orderRef: string;
  productKey?: string;
  raw?: string;
  title: string;
  type?: string;
};

type InflywayCheckoutResponse = InflywayApiResponse & {
  orderId?: string;
  orderUrl?: string;
};

type InflywayOrderSummary = InflywayApiResponse & {
  amount?: string | number | null;
  createdAt?: string | null;
  currency?: string | null;
  orderId?: string | null;
  orderNumber?: string | null;
  orderUrl?: string | null;
  raw?: Record<string, unknown> | null;
  status?: string | null;
};

function getHeaders() {
  return {
    "Content-Type": "application/json",
    ...(INFLYWAY_API_KEY ? { "x-api-key": INFLYWAY_API_KEY } : {}),
  };
}

async function inflywayRequest<T extends InflywayApiResponse>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${INFLYWAY_API_BASE_URL}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok || data?.success === false) {
    throw new InflywayRequestError(
      data?.error || `Inflyway request failed: ${response.status}`,
      response.status,
      data
    );
  }

  return data as T;
}

export async function createInflywayCheckout(payload: InflywayCheckoutPayload) {
  const data = await inflywayRequest<InflywayCheckoutResponse>("/checkout/create", payload);

  if (!data.orderId || !data.orderUrl) {
    throw new InflywayRequestError("Inflyway did not return a payment link", 502, data);
  }

  return {
    orderId: data.orderId,
    orderUrl: data.orderUrl,
  };
}

export async function getInflywayOrder(query: string) {
  return inflywayRequest<InflywayOrderSummary>("/orders/get", { query });
}

function normalize(value: unknown) {
  return String(value ?? "").trim();
}

export function isInflywayOrderPaid(order: Record<string, unknown> | null | undefined) {
  if (!order || typeof order !== "object") return false;

  const paymentStatus = normalize(order.paymentStatus).toUpperCase();
  const orderStatus = normalize(order.orderStatus || order.status).toUpperCase();
  const paymentSuccessTime = order.paymentSuccessTime ?? order.paySuccessTime ?? order.paymentTime ?? null;

  if (paymentSuccessTime) return true;
  if (["10", "20", "SUCCESS", "PAID", "COMPLETED"].includes(paymentStatus)) return true;
  if (["PAID", "SUCCESS", "CONFIRMED", "COMPLETED"].includes(orderStatus)) return true;

  return false;
}
