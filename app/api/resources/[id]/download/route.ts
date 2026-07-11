import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resourceService } from "@/modules/resources/resources.service";
import { handleError } from "@/lib/shared/handleErrors";

// GET /api/resources/:id/download
// Point download links/buttons at this route instead of file_url directly —
// it bumps download_count then 302s to the actual file.
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/resources/[id]/download">) {
    try {
        const { id } = await ctx.params;
        const fileUrl = await resourceService.registerDownload(id);
        return NextResponse.redirect(fileUrl);
    } catch (err) {
        return handleError(err);
    }
}
