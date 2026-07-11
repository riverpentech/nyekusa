import { leadershipRepository } from "@/modules/leadership/leadership.repository";

const mockLeaders = [
    { id: "1", full_name: "Samuel Gakuru", position: "Chairperson", bio: "A passionate leader dedicated to uniting students and fostering community growth.", term_year: "2025/2026", photo_url: "/leaders/samuelgakuru.webp", order: 1, email: "samuel.gakuru23@students.dkut.ac.ke", linkedin_url: "https://linkedin.com/in/laikipiainfluencer", twitter_url: "https://twitter.com/laikipiainfluencer" },
    { id: "2", full_name: "Brian Karaba", position: "Vice Chairperson", bio: "Committed to academic excellence and student welfare.", term_year: "2025/2026", photo_url: "/leaders/briankaraba.webp", order: 2, email: "brian.karaba@students.dkut.ac.ke" },
    { id: "3", full_name: "Gerald Karoki", position: "Secretary General", bio: "Ensures smooth coordination of all association activities and communications.", term_year: "2025/2026", photo_url: "", order: 3 },
    { id: "4", full_name: "Juliet Wairimu", position: "Treasurer", bio: "Managing finances with transparency and accountability.", term_year: "2025/2026", photo_url: "", order: 4 },
    { id: "5", full_name: "Washington Mwangi", position: "Organizing Secretary", bio: "Planning and executing memorable events for the community.", term_year: "2025/2026", photo_url: "", order: 5 },
    { id: "6", full_name: "Faith Wairimu King'ori", position: "Social & Welfare Secretary", bio: "Championing student well-being and social cohesion.", term_year: "2025/2026", photo_url: "/leaders/faithwairimu.webp", order: 6, email: "faith.kingori@students.dkut.ac.ke" },
    { id: "7", full_name: "Eric Macharia", position: "Public Relations Officer", bio: "Ensuring the association's visibility and engagement.", term_year: "2025/2026", photo_url: "/leaders/ericmacharia.webp", order: 7 },
    { id: "8", full_name: "Lucy Wanjiru", position: "Assistant Organising Secretary", bio: "Helping in planning and execution of activities and projects.", term_year: "2025/2026", photo_url: "", order: 8},
    { id: "9", full_name: "Alan Mwangi ", position: "Chairperson", bio: "Led the association during a transformative period.", term_year: "2024/2025", photo_url: "", order: 1 },
    { id: "10", full_name: "Samuel Gakuru", position: "Secretary General", bio: "A passionate leader dedicated to uniting students and fostering community growth.", term_year: "2024/2025", photo_url: "/leaders/samuelgakuru.webp", order: 2, email: "samuel.gakuru23@students.dkut.ac.ke", linkedin_url: "https://linkedin.com/in/laikipiainfluencer", twitter_url: "https://twitter.com/laikipiainfluencer" },
];

export const leadershipService = {
    async listLeaders(term?: string | null, limit: number = 50) {
        try {
            const where: any = {};
            if (term) where.term = term;

            const dbLeaders = await leadershipRepository.findMany({ where, take: limit });
            if (dbLeaders.length > 0) {
                return dbLeaders.map(l => ({
                    id: l.id,
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
            }
        } catch (error) {
            console.error("Failed to fetch leaders from DB, falling back to mock data", error);
        }

        // Fallback to static mock data if DB is empty or fails
        let filtered = [...mockLeaders];
        if (term) {
            filtered = filtered.filter(l => l.term_year === term);
        }
        return filtered.slice(0, limit);
    },

    async getLeader(id: string) {
        try {
            const l = await leadershipRepository.findById(id);
            if (l) {
                return {
                    id: l.id,
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
            }
        } catch (error) {
            console.error("Failed to fetch leader by id from DB", error);
        }

        const fallback = mockLeaders.find(l => l.id === id);
        return fallback || null;
    }
};
export const serverLeadershipService = leadershipService;
