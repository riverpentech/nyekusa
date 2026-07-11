import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const paymentRepository = {
    async create(data: Prisma.PaymentCreateInput) {
        return prisma.payment.create({ data });
    },

    async findByUserId(userId: string) {
        return prisma.payment.findUnique({ where: { userId } });
    },

    async findByCheckoutRequestId(checkoutRequestID: string) {
        return prisma.payment.findUnique({ where: { checkoutRequestID } });
    },

    async update(id: string, data: Prisma.PaymentUpdateInput) {
        return prisma.payment.update({ where: { id }, data });
    },

    async updateByCheckoutRequestId(checkoutRequestID: string, data: Prisma.PaymentUpdateInput) {
        return prisma.payment.update({ where: { checkoutRequestID }, data });
    }
};
