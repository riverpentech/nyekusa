import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { paymentRepository } from "@/modules/payments/payments.repository";
import { paymentService } from "@/modules/payments/payments.service";
import { handleError } from "@/lib/shared/handleErrors";

export const runtime = "nodejs";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payments = await paymentRepository.findManyByUserId(session.user.id);
        return NextResponse.json(payments);
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { phoneNumber, amount, purpose } = body;

        const result = await paymentService.initiatePayment(
            session.user.id,
            phoneNumber,
            parseFloat(amount),
            purpose
        );

        return NextResponse.json(result);
    } catch (err) {
        return handleError(err);
    }
}
