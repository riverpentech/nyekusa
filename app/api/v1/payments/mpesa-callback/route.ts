import { NextResponse } from "next/server";
import { paymentService } from "@/modules/payments/payments.service";

export async function POST(req: Request) {
    try {
        const bodyText = await req.text();
        const signature = req.headers.get("x-riverpen-signature");

        if (signature) {
            console.log("RiverPen Webhook Received (v1)");
            const response = await paymentService.handleRiverpenWebhook(req.headers, bodyText);
            return NextResponse.json(response);
        } else {
            const body = JSON.parse(bodyText);
            console.log("M-Pesa Sandbox Callback Received (v1):", JSON.stringify(body, null, 2));
            const response = await paymentService.handleMpesaCallback(body);
            return NextResponse.json(response);
        }
    } catch (error: any) {
        console.error("Error in Callback (v1):", error);
        return NextResponse.json({ ResultCode: 1, ResultDesc: error.message || "Internal Server Error" }, { status: 500 });
    }
}
