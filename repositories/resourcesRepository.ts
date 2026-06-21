import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const resourceRepository = {
    async findMany({
        where = {},
        skip = 0,
        take = 50,
        orderBy = { createdAt: "desc" },
    }: {
        where?: Prisma.ResourceWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.ResourceOrderByWithRelationInput;
    } = {}) {
        return prisma.resource.findMany({ where, skip, take, orderBy });
    },

    async count(where: Prisma.ResourceWhereInput = {}) {
        return prisma.resource.count({ where });
    },

    async findById(id: string) {
        return prisma.resource.findUnique({ where: { id } });
    },

    async existsById(id: string) {
        const count = await prisma.resource.count({ where: { id } });
        return count > 0;
    },

    async create(data: Prisma.ResourceCreateInput) {
        return prisma.resource.create({ data });
    },

    async update(id: string, data: Prisma.ResourceUpdateInput) {
        return prisma.resource.update({ where: { id }, data });
    },

    async remove(id: string) {
        return prisma.resource.delete({ where: { id } });
    },

    async incrementDownloadCount(id: string) {
        return prisma.resource.update({
            where: { id },
            data: { downloadCount: { increment: 1 } },
        });
    },
};
