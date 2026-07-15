import { NextRequest, NextResponse } from "next/server";
import { opportunityService } from "@/modules/opportunities/opportunities.service";
import { handleError } from "@/lib/shared/handleErrors";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const opportunity = await opportunityService.getOpportunity(id);
        if (!opportunity) {
            return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
        }
        return NextResponse.json(opportunity);
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const opportunity = await opportunityService.updateOpportunity(id, body);
        return NextResponse.json(opportunity);
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await opportunityService.deleteOpportunity(id);
        return NextResponse.json(result);
    } catch (err) {
        return handleError(err);
    }
}
