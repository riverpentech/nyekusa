import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const checkoutRequestId = searchParams.get("checkoutRequestId");

  if (!checkoutRequestId) {
    return NextResponse.json({ error: "Missing checkoutRequestId" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { checkoutRequestID: checkoutRequestId },
    select: { status: true, userId: true }
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  return NextResponse.json({ status: payment.status, userId: payment.userId });
}
