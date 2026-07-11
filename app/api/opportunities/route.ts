import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { serverOpportunityService } from "@/modules/opportunities/opportunities.service";
import { handleError } from "@/lib/shared/handleErrors";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "", 10) || 50, 1), 100);
        const sort = searchParams.get("sort");

        const opportunities = await serverOpportunityService.listOpportunities(limit, sort);

        return NextResponse.json(opportunities);
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const opportunity = await serverOpportunityService.createOpportunity(body);

        return NextResponse.json(opportunity, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
}
