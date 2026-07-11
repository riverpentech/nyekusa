import { NextResponse } from "next/server";
import { paymentService } from "@/modules/payments/payments.service";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("M-Pesa Callback Received (root):", JSON.stringify(body, null, 2));

        const response = await paymentService.handleMpesaCallback(body);
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in M-Pesa Callback (root):", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
