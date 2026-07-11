import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const leadershipRepository = {
    async findMany({
        where = {},
        skip = 0,
        take = 50,
        orderBy = { priority: "asc" },
    }: {
        where?: Prisma.LeadershipWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.LeadershipOrderByWithRelationInput;
    } = {}) {
        return prisma.leadership.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        linkedin: true,
                        twitter: true,
                        photoUrl: true,
                    }
                }
            }
        });
    },

    async findById(id: string) {
        return prisma.leadership.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        linkedin: true,
                        twitter: true,
                        photoUrl: true,
                    }
                }
            }
        });
    },

    async create(data: Prisma.LeadershipCreateInput) {
        return prisma.leadership.create({ data });
    },

    async update(id: string, data: Prisma.LeadershipUpdateInput) {
        return prisma.leadership.update({ where: { id }, data });
    },

    async remove(id: string) {
        return prisma.leadership.delete({ where: { id } });
    }
};
