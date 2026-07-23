import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { getStripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return new NextResponse("Webhook is not configured", { status: 503 });
    }

    let event: Stripe.Event

    try {
        event = getStripe().webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        )
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Invalid webhook";
        return new NextResponse(`Webhook Error: ${message}`, { status: 400 })
      }


    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.customer_details?.address;

    const addressComponents = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country
      ];
      const addressString = addressComponents.filter(Boolean).join(', ');


      if (event.type === "checkout.session.completed") {
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          return new NextResponse("Missing order metadata", { status: 400 });
        }

        const order = await prismadb.order.update({
          where: {
            id: orderId,
          },
          data: {
            isPaid: true,
            address: addressString,
            phone: session?.customer_details?.phone || '',
          },
          include: {
            orderItems: true,
          }
        });
    
        const productIds = order.orderItems.map((orderItem) => orderItem.productId);
    
        await prismadb.product.updateMany({
          where: {
            id: {
              in: [...productIds],
            },
          },
          data: {
            isArchived: true
          }
        });
      }
    
      return new NextResponse(null, { status: 200 });
    };
