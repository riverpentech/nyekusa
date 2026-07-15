import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/modules/payments/payments.service";
import { prisma } from "@/lib/prisma";
import { PaymentStatus, PaymentPurpose } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limitStr = searchParams.get('limit');
        const limit = limitStr ? parseInt(limitStr) : 100;

        const payments = await paymentService.listAllPayments(limit);
        return NextResponse.json(payments);
    } catch (error) {
        console.error("Failed to list all payments:", error);
        return NextResponse.json({ error: "Failed to list payments" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, amount, purpose, phoneNumber, status, mpesaReceiptCode } = body;

        if (!userId || !amount || !purpose || !phoneNumber) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let paymentPurpose: PaymentPurpose = PaymentPurpose.OTHER;
        if (Object.values(PaymentPurpose).includes(purpose.toUpperCase() as PaymentPurpose)) {
            paymentPurpose = purpose.toUpperCase() as PaymentPurpose;
        }

        let paymentStatus: PaymentStatus = PaymentStatus.COMPLETED;
        if (status && Object.values(PaymentStatus).includes(status.toUpperCase() as PaymentStatus)) {
            paymentStatus = status.toUpperCase() as PaymentStatus;
        }

        const payment = await prisma.payment.create({
            data: {
                userId,
                amount: parseFloat(String(amount)),
                purpose: paymentPurpose,
                phoneNumber,
                status: paymentStatus,
                checkoutRequestID: `MANUAL_${userId}_${Date.now()}`,
                mpesaReceiptCode: mpesaReceiptCode || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });

        return NextResponse.json(payment, { status: 201 });
    } catch (error) {
        console.error("Failed to record manual payment:", error);
        return NextResponse.json({ error: "Failed to record manual payment" }, { status: 500 });
    }
}
