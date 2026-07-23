import Stripe from "stripe";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getStripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const checkoutSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(50),
});

function getCorsHeaders() {
  return {
  "Access-Control-Allow-Origin": process.env.FRONTEND_STORE_URL ?? "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders() });
}

export async function POST(req: Request, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  const parsedBody = checkoutSchema.safeParse(await req.json());

  if (!parsedBody.success) {
    return new NextResponse("Product ids are required", { status: 400 });
  }

  const productIds = [...new Set(parsedBody.data.productIds)];

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
      isArchived: false,
      id: {
        in: productIds
      }
    }
  });

  if (products.length !== productIds.length) {
    return new NextResponse("One or more products are unavailable", { status: 400 });
  }

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  products.forEach((product) => {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: 'USD',
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(product.price.toNumber() * 100)
      }
    });
  });

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      orderItems: {
        create: products.map((product) => ({
          product: {
            connect: {
              id: product.id
            }
          }
        }))
      }
    }
  });

  const session = await getStripe().checkout.sessions.create({
    line_items,
    mode: 'payment',
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id
    },
  });

  return NextResponse.json({ url: session.url }, {
    headers: getCorsHeaders()
  });
};
