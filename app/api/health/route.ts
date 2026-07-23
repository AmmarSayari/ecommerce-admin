import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function GET() {
  try {
    await prismadb.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("HEALTHCHECK_DATABASE_ERROR", error);
    return NextResponse.json(
      { status: "error", database: "unavailable" },
      { status: 503 },
    );
  }
}
