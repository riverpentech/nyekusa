import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const projectRepository = {
    async findMany({
        where = {},
        skip = 0,
        take = 50,
        orderBy = { createdAt: "desc" },
    }: {
        where?: Prisma.ProjectWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.ProjectOrderByWithRelationInput;
    } = {}) {
        return prisma.project.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                tasks: {
                    include: {
                        assignedTo: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                photoUrl: true,
                            }
                        }
                    }
                }
            }
        });
    },

    async create(data: Prisma.ProjectCreateInput) {
        return prisma.project.create({
            data,
            include: {
                tasks: true
            }
        });
    },

    async findById(id: string) {
        return prisma.project.findUnique({
            where: { id },
            include: {
                tasks: {
                    include: {
                        assignedTo: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                photoUrl: true,
                            }
                        }
                    }
                }
            }
        });
    },

    async update(id: string, data: Prisma.ProjectUpdateInput) {
        return prisma.project.update({
            where: { id },
            data,
            include: {
                tasks: true
            }
        });
    },

    async remove(id: string) {
        return prisma.project.delete({
            where: { id }
        });
    }
};
