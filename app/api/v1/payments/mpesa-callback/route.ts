import { NextResponse } from "next/server";
import { paymentService } from "@/modules/payments/payments.service";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("M-Pesa Callback Received (v1):", JSON.stringify(body, null, 2));

        const response = await paymentService.handleMpesaCallback(body);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in M-Pesa Callback (v1):", error);
        return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Server Error" }, { status: 500 });
    }
}
