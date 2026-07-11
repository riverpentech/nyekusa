import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { serverAuthService } from "@/modules/auth/auth.service";
import { handleError } from "@/lib/shared/handleErrors";

export const runtime = "nodejs";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await serverAuthService.getUserDashboardData(session.user.id);
        return NextResponse.json(data);
    } catch (err) {
        return handleError(err);
    }
}
