import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const paymentRepository = {
    async create(data: Prisma.PaymentCreateInput) {
        return prisma.payment.create({ data });
    },

    async findByUserId(userId: string) {
        return prisma.payment.findFirst({
            where: { userId, purpose: "MEMBERSHIP" },
            orderBy: { createdAt: "desc" }
        });
    },

    async findManyByUserId(userId: string) {
        return prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
    },

    async findByCheckoutRequestId(checkoutRequestID: string) {
        return prisma.payment.findFirst({ where: { checkoutRequestID } });
    },

    async update(id: string, data: Prisma.PaymentUpdateInput) {
        return prisma.payment.update({ where: { id }, data });
    },

    async updateByCheckoutRequestId(checkoutRequestID: string, data: Prisma.PaymentUpdateInput) {
        return prisma.payment.updateMany({ where: { checkoutRequestID }, data });
    },

    async findMany({
        where = {},
        skip = 0,
        take = 100,
        orderBy = { createdAt: "desc" },
    }: {
        where?: Prisma.PaymentWhereInput;
        skip?: number;
        take?: number;
        orderBy?: Prisma.PaymentOrderByWithRelationInput;
    } = {}) {
        return prisma.payment.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });
    },

    async findById(id: string) {
        return prisma.payment.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });
    },

    async remove(id: string) {
        return prisma.payment.delete({ where: { id } });
    }
};
