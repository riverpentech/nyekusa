import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/shared/handleErrors";

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
        const { isRead } = body;

        const message = await prisma.contactMessage.update({
            where: { id },
            data: { isRead: Boolean(isRead) }
        });

        return NextResponse.json(message);
    } catch (err) {
        return handleError(err);
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
        await prisma.contactMessage.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Message deleted successfully" });
    } catch (err) {
        return handleError(err);
    }
}
