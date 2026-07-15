import { leadershipRepository } from "@/modules/leadership/leadership.repository";
import { prisma } from "@/lib/prisma";

export const leadershipService = {
    async listLeaders(term?: string | null, limit: number = 50) {
        const where: any = {};
        if (term) where.term = term;

        const dbLeaders = await leadershipRepository.findMany({ where, take: limit });
        return dbLeaders.map(l => ({
            id: l.id,
            userId: l.userId,
            full_name: l.user.name,
            position: l.title,
            bio: l.bio ?? "",
            term_year: l.term,
            photo_url: l.user.photoUrl ?? "",
            order: l.priority,
            email: l.user.email,
            linkedin_url: l.user.linkedin ?? "",
            twitter_url: l.user.twitter ?? "",
        }));
    },

    async getLeader(id: string) {
        const l = await leadershipRepository.findById(id);
        if (!l) return null;
        return {
            id: l.id,
            userId: l.userId,
            full_name: l.user.name,
            position: l.title,
            bio: l.bio ?? "",
            term_year: l.term,
            photo_url: l.user.photoUrl ?? "",
            order: l.priority,
            email: l.user.email,
            linkedin_url: l.user.linkedin ?? "",
            twitter_url: l.user.twitter ?? "",
        };
    },

    async createLeader(data: { userId: string; title: string; term: string; bio?: string; priority?: number; fullName?: string }) {
        if (data.fullName) {
            await prisma.user.update({
                where: { id: data.userId },
                data: { name: data.fullName.trim() }
            });
        }
        return leadershipRepository.create({
            user: { connect: { id: data.userId } },
            title: data.title,
            term: data.term,
            bio: data.bio,
            priority: data.priority ?? 0,
        });
    },

    async updateLeader(id: string, data: { title?: string; term?: string; bio?: string; priority?: number; fullName?: string }) {
        const record = await prisma.leadership.findUnique({
            where: { id },
            select: { userId: true }
        });
        
        if (record && data.fullName !== undefined) {
            await prisma.user.update({
                where: { id: record.userId },
                data: { name: data.fullName.trim() }
            });
        }

        return leadershipRepository.update(id, {
            title: data.title,
            term: data.term,
            bio: data.bio,
            priority: data.priority,
        });
    },

    async deleteLeader(id: string) {
        return leadershipRepository.remove(id);
    }
};

export const serverLeadershipService = leadershipService;
