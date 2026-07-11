import { opportunityRepository } from "@/modules/opportunities/opportunities.repository";
import { ValidationError } from "@/lib/shared/errors";

type OpportunityInput = {
    title: string;
    company: string;
    category?: string;
    description: string;
    link?: string;
    apply_url?: string;
    deadline?: string | null;
};

function toApiOpportunity(opp: {
    id: string;
    title: string;
    company: string;
    description: string;
    category: string;
    link: string | null;
    deadline: Date | null;
    createdAt: Date;
}) {
    return {
        id: opp.id,
        title: opp.title,
        company: opp.company,
        location: "",
        category: opp.category ?? "other",
        deadline: opp.deadline?.toISOString() ?? opp.createdAt.toISOString(),
        description: opp.description,
        apply_url: opp.link ?? "#",
        created_at: opp.createdAt,
    };
}

export const serverOpportunityService = {
    async listOpportunities(limit: number = 50, sort?: string | null) {
        const opportunities = await opportunityRepository.findMany({
            take: limit,
            orderBy: { createdAt: sort?.startsWith("-") ? "desc" : "asc" }
        });
        return opportunities.map(toApiOpportunity);
    },

    async createOpportunity(body: OpportunityInput) {
        if (!body.title?.trim() || !body.company?.trim() || !body.description?.trim()) {
            throw new ValidationError("Validation failed", {
                title: "title is required",
                company: "company is required",
                description: "description is required",
            });
        }

        const opportunity = await opportunityRepository.create({
            title: body.title.trim(),
            company: body.company.trim(),
            category: body.category?.trim() || "other",
            description: body.description.trim(),
            link: body.link ?? body.apply_url,
            deadline: body.deadline ? new Date(body.deadline) : null,
        });

        return toApiOpportunity(opportunity);
    }
};
export const opportunityService = serverOpportunityService;
