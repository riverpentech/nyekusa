import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const galleryRepository = {
    async findMany({
        where = {},
        skip = 0,
        take = 50,
        orderBy = { date: "desc" },
    }: {
        where?: Prisma.GalleryAlbumWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.GalleryAlbumOrderByWithRelationInput;
    } = {}) {
        return prisma.galleryAlbum.findMany({ where, skip, take, orderBy });
    },

    async findById(id: string) {
        return prisma.galleryAlbum.findUnique({ where: { id } });
    },

    async create(data: Prisma.GalleryAlbumCreateInput) {
        return prisma.galleryAlbum.create({ data });
    },

    async update(id: string, data: Prisma.GalleryAlbumUpdateInput) {
        return prisma.galleryAlbum.update({ where: { id }, data });
    },

    async remove(id: string) {
        return prisma.galleryAlbum.delete({ where: { id } });
    }
};
