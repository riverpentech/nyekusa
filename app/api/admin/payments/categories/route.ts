import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const categories = await prisma.paymentCategory.findMany({
            orderBy: { createdAt: "asc" }
        });

        return NextResponse.json(categories);
    } catch (err) {
        console.error("Failed to load payment categories for admin:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { code, name, amount, isLocked, minAmount, isActive } = body;

        if (!code || !name) {
            return NextResponse.json({ error: "Code and Name are required" }, { status: 400 });
        }

        const category = await prisma.paymentCategory.create({
            data: {
                code: code.trim().toUpperCase(),
                name: name.trim(),
                amount: parseFloat(amount),
                isLocked: Boolean(isLocked),
                minAmount: parseFloat(minAmount || 0),
                isActive: isActive !== undefined ? Boolean(isActive) : true,
            }
        });

        return NextResponse.json(category);
    } catch (err) {
        console.error("Failed to create payment category:", err);
        return NextResponse.json({ error: "Failed to create payment category" }, { status: 500 });
    }
}
