import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type CallbackItem = {
  Name: string;
  Value?: string | number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("M-Pesa Callback Received:", JSON.stringify(body, null, 2));

    const { Body } = body;
    if (!Body || !Body.stkCallback) {
        return NextResponse.json({ message: "Invalid callback body" }, { status: 400 });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = Body.stkCallback;

    if (ResultCode === 0) {
      // Payment successful
      const items = CallbackMetadata.Item as CallbackItem[];
      const amount = items.find((item) => item.Name === "Amount")?.Value;
      const mpesaReceiptCode = items.find((item) => item.Name === "MpesaReceiptNumber")?.Value;

      await prisma.payment.update({
        where: { checkoutRequestID: CheckoutRequestID },
        data: {
          status: "COMPLETED",
          mpesaReceiptCode: mpesaReceiptCode?.toString(),
          amount: amount ? parseFloat(amount.toString()) : 50.0,
        },
      });

      console.log(`Payment confirmed for CheckoutRequestID: ${CheckoutRequestID}`);
    } else {
      // Payment failed
      await prisma.payment.update({
        where: { checkoutRequestID: CheckoutRequestID },
        data: {
          status: "FAILED",
        },
      });
      console.log(`Payment failed for CheckoutRequestID: ${CheckoutRequestID}. Reason: ${ResultDesc}`);
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("M-Pesa Callback Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
