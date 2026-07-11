import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const opportunityRepository = {
    async findMany({
        where = {},
        skip = 0,
        take = 50,
        orderBy = { createdAt: "desc" },
    }: {
        where?: Prisma.OpportunityWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.OpportunityOrderByWithRelationInput;
    } = {}) {
        return prisma.opportunity.findMany({ where, skip, take, orderBy });
    },

    async count(where: Prisma.OpportunityWhereInput = {}) {
        return prisma.opportunity.count({ where });
    },

    async findById(id: string) {
        return prisma.opportunity.findUnique({ where: { id } });
    },

    async existsById(id: string) {
        const count = await prisma.opportunity.count({ where: { id } });
        return count > 0;
    },

    async create(data: Prisma.OpportunityCreateInput) {
        return prisma.opportunity.create({ data });
    },

    async update(id: string, data: Prisma.OpportunityUpdateInput) {
        return prisma.opportunity.update({ where: { id }, data });
    },

    async remove(id: string) {
        return prisma.opportunity.delete({ where: { id } });
    },
};
