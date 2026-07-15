import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { code, name, amount, isLocked, minAmount, isActive } = body;

        const data: any = {};
        if (code !== undefined) data.code = code.trim().toUpperCase();
        if (name !== undefined) data.name = name.trim();
        if (amount !== undefined) data.amount = parseFloat(amount);
        if (isLocked !== undefined) data.isLocked = Boolean(isLocked);
        if (minAmount !== undefined) data.minAmount = parseFloat(minAmount);
        if (isActive !== undefined) data.isActive = Boolean(isActive);

        const category = await prisma.paymentCategory.update({
            where: { id },
            data
        });

        return NextResponse.json(category);
    } catch (err) {
        console.error("Failed to update payment category:", err);
        return NextResponse.json({ error: "Failed to update payment category" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await prisma.paymentCategory.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (err) {
        console.error("Failed to delete payment category:", err);
        return NextResponse.json({ error: "Failed to delete payment category" }, { status: 500 });
    }
}
