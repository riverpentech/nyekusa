import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const authRepository = {
    async createVerificationToken(data: Prisma.VerificationTokenCreateInput) {
        return prisma.verificationToken.create({ data });
    },

    async findVerificationTokenByToken(token: string) {
        return prisma.verificationToken.findUnique({ where: { token } });
    },

    async findVerificationTokenByEmailAndToken(email: string, token: string) {
        return prisma.verificationToken.findFirst({ where: { email, token } });
    },

    async deleteVerificationToken(id: string) {
        return prisma.verificationToken.delete({ where: { id } });
    }
};
