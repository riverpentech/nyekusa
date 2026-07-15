import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/shared/handleErrors";

export const runtime = "nodejs";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const messages = await prisma.contactMessage.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ messages });
    } catch (err) {
        return handleError(err);
    }
}
