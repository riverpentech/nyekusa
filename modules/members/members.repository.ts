import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Never add `password` here. This repository backs public-facing member
// endpoints — the hash must never leave the server.
const SAFE_SELECT = {
    id: true,
    name: true,
    email: true,
    phone: true,
    course: true,
    status: true,
    yearOfStudy: true,
    gender: true,
    quotes: true,
    photoUrl: true,
    bio: true,
    role: true,
    isVerified: true,
    createdAt: true,
    updatedAt: true,
    twitter: true,
    linkedin: true,
    facebook: true,
    instagram: true,
    tiktok: true,
    github: true,
};

export const memberRepository = {
    async findMany({
        where = {},
        skip = 0,
        take = 100,
        orderBy = { createdAt: "desc" },
    }: {
        where?: Prisma.UserWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    } = {}) {
        return prisma.user.findMany({ where, skip, take, orderBy, select: SAFE_SELECT });
    },

    async count(where: Prisma.UserWhereInput = {}) {
        return prisma.user.count({ where });
    },

    async findById(id: string) {
        return prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
    },

    async existsById(id: string) {
        const count = await prisma.user.count({ where: { id } });
        return count > 0;
    },

    // Only used internally (e.g. duplicate-email checks) — intentionally
    // not select-limited since it's never returned to the client directly.
    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    },

    async create(data: Prisma.UserCreateInput) {
        return prisma.user.create({ data, select: SAFE_SELECT });
    },

    async update(id: string, data: Prisma.UserUpdateInput) {
        return prisma.user.update({ where: { id }, data, select: SAFE_SELECT });
    },

    async remove(id: string) {
        return prisma.user.delete({ where: { id } });
    },
};
