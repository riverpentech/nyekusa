import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const DEFAULT_CATEGORIES = [
    { code: "MEMBERSHIP", name: "Registration Fee", amount: 50.0, isLocked: true, minAmount: 50.0 },
    { code: "CHALLENGE_10_BOB", name: "10 Bob Challenge", amount: 10.0, isLocked: true, minAmount: 10.0 },
    { code: "HIKE", name: "Hike & Social Event", amount: 500.0, isLocked: false, minAmount: 1.0 },
    { code: "CHARITY", name: "Charity & Outreach", amount: 100.0, isLocked: false, minAmount: 1.0 },
    { code: "OTHER", name: "Other Contribution", amount: 50.0, isLocked: false, minAmount: 1.0 },
];

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let categories = await prisma.paymentCategory.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "asc" }
        });

        if (categories.length === 0) {
            // Seed defaults
            await prisma.paymentCategory.createMany({
                data: DEFAULT_CATEGORIES
            });
            categories = await prisma.paymentCategory.findMany({
                where: { isActive: true },
                orderBy: { createdAt: "asc" }
            });
        }

        return NextResponse.json(categories);
    } catch (err) {
        console.error("Failed to load payment categories:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
