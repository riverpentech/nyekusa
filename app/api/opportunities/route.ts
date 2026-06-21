import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/shared/handleErrors";
import { ValidationError } from "@/lib/shared/errors";

type OpportunityBody = {
    title?: string;
    company?: string;
    description?: string;
    link?: string;
    apply_url?: string;
    deadline?: string | null;
};

function toApiOpportunity(opportunity: {
    id: string;
    title: string;
    company: string;
    description: string;
    link: string | null;
    deadline: Date | null;
    createdAt: Date;
}) {
    return {
        id: opportunity.id,
        title: opportunity.title,
        company: opportunity.company,
        location: "",
        category: "other",
        deadline: opportunity.deadline?.toISOString() ?? opportunity.createdAt.toISOString(),
        description: opportunity.description,
        apply_url: opportunity.link ?? "#",
        created_at: opportunity.createdAt,
    };
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "", 10) || 50, 1), 100);
        const sort = searchParams.get("sort");

        const opportunities = await prisma.opportunity.findMany({
            take: limit,
            orderBy: { createdAt: sort?.startsWith("-") ? "desc" : "asc" },
        });

        return NextResponse.json(opportunities.map(toApiOpportunity));
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as OpportunityBody;

        if (!body.title?.trim() || !body.company?.trim() || !body.description?.trim()) {
            throw new ValidationError("Validation failed", {
                title: "title is required",
                company: "company is required",
                description: "description is required",
            });
        }

        const opportunity = await prisma.opportunity.create({
            data: {
                title: body.title.trim(),
                company: body.company.trim(),
                description: body.description.trim(),
                link: body.link ?? body.apply_url,
                deadline: body.deadline ? new Date(body.deadline) : null,
            },
        });

        return NextResponse.json(toApiOpportunity(opportunity), { status: 201 });
    } catch (err) {
        return handleError(err);
    }
}
