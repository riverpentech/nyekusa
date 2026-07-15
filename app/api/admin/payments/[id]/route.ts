import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/modules/payments/payments.service";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, amount, purpose, phoneNumber, mpesaReceiptCode } = body;

        const data: any = {};
        if (status !== undefined) data.status = status;
        if (amount !== undefined) data.amount = parseFloat(String(amount));
        if (purpose !== undefined) data.purpose = purpose;
        if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
        if (mpesaReceiptCode !== undefined) data.mpesaReceiptCode = mpesaReceiptCode || null;

        const updated = await paymentService.updatePayment(id, data);
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update payment:", error);
        return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await paymentService.deletePayment(id);
        return NextResponse.json({ message: "Payment deleted successfully" });
    } catch (error) {
        console.error("Failed to delete payment:", error);
        return NextResponse.json({ error: "Failed to delete payment" }, { status: 500 });
    }
}
