import { medusaServerFetch } from "@/lib/medusa-server";

type CartLike = {
  completed_at?: string | null;
  metadata?: Record<string, unknown> | null;
  payment_collection?: {
    id?: string;
    payment_sessions?: Array<{ status?: string | null }>;
  } | null;
  payment_collections?: Array<{
    id?: string;
    payment_sessions?: Array<{ status?: string | null }>;
  }>;
  shipping_methods?: Array<{ id: string }>;
};

type FinalizeCartMetadata = {
  inflyway_order_id?: string;
  inflyway_order_ref?: string;
  inflyway_paid_at?: string;
  inflyway_payment_status?: string;
  inflyway_payment_url?: string;
};

function getPaymentCollection(cart: CartLike) {
  return cart.payment_collection || cart.payment_collections?.[0] || null;
}

function hasAuthorizedPaymentSession(cart: CartLike) {
  const collection = getPaymentCollection(cart);
  return (collection?.payment_sessions ?? []).some(
    (session) => session.status === "authorized" || session.status === "pending"
  );
}

async function updateCartMetadata(
  cartId: string,
  current: Record<string, unknown> | null | undefined,
  next: FinalizeCartMetadata
) {
  await medusaServerFetch(`/store/carts/${cartId}`, {
    method: "POST",
    body: JSON.stringify({
      metadata: {
        ...(current || {}),
        ...next,
      },
    }),
  });
}

export async function rememberInflywayCheckout(
  cartId: string,
  metadata: {
    inflyway_order_id: string;
    inflyway_order_ref: string;
    inflyway_payment_status: string;
    inflyway_payment_url: string;
  }
) {
  const cartResponse = await medusaServerFetch(`/store/carts/${cartId}`);
  await updateCartMetadata(cartId, cartResponse?.cart?.metadata, metadata);
}

export async function finalizeMedusaCart(cartId: string, metadata: FinalizeCartMetadata) {
  const cartResponse = await medusaServerFetch(`/store/carts/${cartId}`);
  const cart = cartResponse?.cart;

  if (!cart) {
    throw new Error("Cart not found");
  }

  if (!cart.shipping_methods?.length) {
    throw new Error("Cart is missing a shipping method");
  }

  await updateCartMetadata(cartId, cart.metadata, metadata);

  if (cart.completed_at) {
    return {
      alreadyCompleted: true,
      completed: true,
      order: null,
    };
  }

  let paymentCollectionId = getPaymentCollection(cart)?.id;

  if (!paymentCollectionId) {
    const collection = await medusaServerFetch(`/store/payment-collections`, {
      method: "POST",
      body: JSON.stringify({ cart_id: cartId }),
    });
    paymentCollectionId = collection?.payment_collection?.id;
  }

  if (!paymentCollectionId) {
    throw new Error("Could not create a Medusa payment collection");
  }

  if (!hasAuthorizedPaymentSession(cart)) {
    await medusaServerFetch(`/store/payment-collections/${paymentCollectionId}/payment-sessions`, {
      method: "POST",
      body: JSON.stringify({ provider_id: "pp_system_default" }),
    });
  }

  const completed = await medusaServerFetch(`/store/carts/${cartId}/complete`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  return {
    alreadyCompleted: false,
    completed: true,
    order: completed?.order ?? null,
  };
}
