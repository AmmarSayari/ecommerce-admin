import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET() {
  const frontendStoreUrl = process.env.FRONTEND_STORE_URL?.trim();
  const integrations = {
    cloudinary: {
      cloudNameConfigured: Boolean(
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      ),
      uploadPresetConfigured: Boolean(
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      ),
    },
    clerk: {
      publishableKeyConfigured: Boolean(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      ),
      secretKeyConfigured: Boolean(process.env.CLERK_SECRET_KEY),
    },
    stripe: {
      apiKeyConfigured: Boolean(process.env.STRIPE_API_KEY),
      webhookSecretConfigured:
        process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_") ?? false,
    },
    storefront: {
      urlConfigured: Boolean(frontendStoreUrl),
      hasTrailingSlash: frontendStoreUrl?.endsWith("/") ?? false,
    },
  };

  try {
    await prismadb.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      node: process.version,
      database: "connected",
      integrations,
    });
  } catch (error) {
    console.error("HEALTHCHECK_DATABASE_ERROR", error);
    return NextResponse.json(
      {
        status: "error",
        node: process.version,
        database: "unavailable",
        integrations,
      },
      { status: 503 },
    );
  }
}
