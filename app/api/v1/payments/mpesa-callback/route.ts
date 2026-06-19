import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("M-Pesa Callback Received:", JSON.stringify(body, null, 2));

  const { Body } = body;
  const { stkCallback } = Body;
  const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

  if (ResultCode === 0) {
    // Success
    const amount = CallbackMetadata.Item.find((i: any) => i.Name === "Amount")?.Value;
    const mpesaReceiptCode = CallbackMetadata.Item.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
    const phoneNumber = CallbackMetadata.Item.find((i: any) => i.Name === "PhoneNumber")?.Value;

    try {
        await prisma.payment.update({
            where: { checkoutRequestID: CheckoutRequestID },
            data: {
                status: "COMPLETED",
                mpesaReceiptCode,
                phoneNumber: phoneNumber?.toString()
            }
        });
        console.log(`Payment updated for CheckoutRequestID: ${CheckoutRequestID}`);
    } catch (error) {
        console.error("Error updating payment status", error);
    }
  } else {
    // Failed
    try {
        await prisma.payment.update({
            where: { checkoutRequestID: CheckoutRequestID },
            data: {
                status: "FAILED"
            }
        });
        console.log(`Payment failed for CheckoutRequestID: ${CheckoutRequestID}`);
    } catch (error) {
        console.error("Error updating failed payment status", error);
    }
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
