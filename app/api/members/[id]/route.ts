import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { memberService } from "@/services/membersService";
import { handleError } from "@/lib/shared/handleErrors";

// GET /api/members/:id
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/members/[id]">) {
    try {
        const { id } = await ctx.params;
        const member = await memberService.getMember(id);
        return NextResponse.json(member);
    } catch (err) {
        return handleError(err);
    }
}

// PATCH /api/members/:id  (partial update — only send the fields you want changed)
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/members/[id]">) {
    try {
        const { id } = await ctx.params;
        const body = await request.json();
        const member = await memberService.updateMember(id, body);
        return NextResponse.json(member);
    } catch (err) {
        return handleError(err);
    }
}

// PUT is treated the same as PATCH here since updateMember only touches
// fields that are present in the body.
export const PUT = PATCH;

// DELETE /api/members/:id
export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/members/[id]">) {
    try {
        const { id } = await ctx.params;
        const result = await memberService.deleteMember(id);
        return NextResponse.json(result);
    } catch (err) {
        return handleError(err);
    }
}
