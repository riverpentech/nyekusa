import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resourceService } from "@/modules/resources/resources.service";
import { handleError } from "@/lib/shared/handleErrors";

// GET /api/resources/:id
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/resources/[id]">) {
    try {
        const { id } = await ctx.params;
        const resource = await resourceService.getResource(id);
        return NextResponse.json(resource);
    } catch (err) {
        return handleError(err);
    }
}

// PATCH /api/resources/:id  (partial update)
export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/resources/[id]">) {
    try {
        const { id } = await ctx.params;
        const body = await request.json();
        const resource = await resourceService.updateResource(id, body);
        return NextResponse.json(resource);
    } catch (err) {
        return handleError(err);
    }
}

export const PUT = PATCH;

// DELETE /api/resources/:id
export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/resources/[id]">) {
    try {
        const { id } = await ctx.params;
        const result = await resourceService.deleteResource(id);
        return NextResponse.json(result);
    } catch (err) {
        return handleError(err);
    }
}
