import { NextResponse } from "next/server";
import { paymentService } from "@/modules/payments/payments.service";
import { handleError } from "@/lib/shared/handleErrors";

export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const checkoutRequestId = searchParams.get("checkoutRequestId");

        if (!checkoutRequestId) {
            return NextResponse.json({ error: "Missing checkoutRequestId" }, { status: 400 });
        }

        const statusData = await paymentService.getPaymentStatus(checkoutRequestId);
        return NextResponse.json(statusData);
    } catch (err) {
        return handleError(err);
    }
}
