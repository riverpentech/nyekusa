// import "dotenv/config";
// import prisma from "./prisma";
// import { Role } from "@prisma/client";
//
// const mockLeaders = [
//     { id: "1", full_name: "Samuel Gakuru", position: "Chairperson", bio: "A passionate leader dedicated to uniting students and fostering community growth.", term_year: "2025/2026",  photo_url: "/leaders/samuelgakuru.webp", order: 1, email: "samuel.gakuru23@students.dkut.ac.ke", linkedin_url: "https://linkedin.com/in/laikipiainfluencer", twitter_url: "https://twitter.com/laikipiainfluencer" },
//     { id: "2", full_name: "Brian Karaba", position: "Vice Chairperson", bio: "Committed to academic excellence and student welfare.", term_year: "2025/2026", photo_url: "/leaders/briankaraba.webp", order: 2, email: "brian.karaba@students.dkut.ac.ke" },
//     { id: "3", full_name: "Gerald Karoki", position: "Secretary General", bio: "Ensures smooth coordination of all association activities and communications.", term_year: "2025/2026", photo_url: "", order: 3, email: "gerald.karoki@students.dkut.ac.ke" },
//     { id: "4", full_name: "Juliet Wairimu", position: "Treasurer", bio: "Managing finances with transparency and accountability.", term_year: "2025/2026", photo_url: "", order: 4, email: "juliet.wairimu@students.dkut.ac.ke" },
//     { id: "5", full_name: "Washington Mwangi", position: "Organizing Secretary", bio: "Planning and executing memorable events for the community.", term_year: "2025/2026", photo_url: "", order: 5, email: "washington.mwangi@students.dkut.ac.ke" },
//     { id: "6", full_name: "Faith Wairimu King'ori", position: "Social & Welfare Secretary", bio: "Championing student well-being and social cohesion.", term_year: "2025/2026", photo_url: "/leaders/faithwairimu.webp", order: 6, email: "faith.kingori@students.dkut.ac.ke" },
//     { id: "7", full_name: "Eric Macharia", position: "Public Relations Officer", bio: "Ensuring the association's visibility and engagement.", term_year: "2025/2026", photo_url: "/leaders/ericmacharia.webp", order: 7, email: "eric.macharia@students.dkut.ac.ke" },
//     { id: "8", full_name: "Lucy Wanjiru", position: "Assistant Organising Secretary", bio: "Helping in planning and execution of activities and projects.", term_year: "2025/2026", photo_url: "", order: 8, email: "lucy.wanjiru@students.dkut.ac.ke" },
//     { id: "9", full_name: "Alan Mwangi ", position: "Chairperson", bio: "Led the association during a transformative period.", term_year: "2024/2025", photo_url: "", order: 1, email: "alan.mwangi@students.dkut.ac.ke" },
//     { id: "10", full_name: "Samuel Gakuru", position: "Secretary General", bio: "A passionate leader dedicated to uniting students and fostering community growth.", term_year: "2024/2025", photo_url: "/leaders/samuelgakuru.webp", order: 2, email: "samuel.gakuru23@students.dkut.ac.ke", linkedin_url: "https://linkedin.com/in/laikipiainfluencer", twitter_url: "https://twitter.com/laikipiainfluencer" },
// ];
//
// async function main() {
//     console.log("🌱 Seeding leadership records...");
//
//     // Clear out existing leadership records
//     await prisma.leadership.deleteMany();
//     console.log("   Cleared existing leadership data.");
//
//     // Sort mockLeaders so that older terms (like 2024/2025) are processed first,
//     // meaning the newer terms (2025/2026) will overwrite them and stay in the DB.
//     const sortedLeaders = [...mockLeaders].sort((a, b) => a.term_year.localeCompare(b.term_year));
//
//     for (const leader of sortedLeaders) {
//         const safeEmail = leader.email || `${leader.full_name.toLowerCase().replace(/\s+/g, ".")}@students.dkut.ac.ke`;
//
//         // Step 1: Upsert the user profile
//         const user = await prisma.user.upsert({
//             where: { email: safeEmail },
//             update: {
//                 name: leader.full_name.trim(),
//                 role: Role.LEADER,
//                 photoUrl: leader.photo_url || null,
//                 linkedin: leader.linkedin_url || null,
//                 twitter: leader.twitter_url || null,
//             },
//             create: {
//                 name: leader.full_name.trim(),
//                 email: safeEmail,
//                 phone: "0700000000",
//                 course: "Computer Science",
//                 yearOfStudy: "4.1",
//                 password: "$2a$10$UniquelyHashedPlaceholderForSecurityPurposeOnly",
//                 role: Role.LEADER,
//                 photoUrl: leader.photo_url || null,
//                 linkedin: leader.linkedin_url || null,
//                 twitter: leader.twitter_url || null,
//                 isVerified: true,
//             },
//         });
//
//         // Step 2: Use upsert here instead of create to respect the 1-to-1 unique constraint on userId
//         await prisma.leadership.upsert({
//             where: { userId: user.id },
//             update: {
//                 title: leader.position,
//                 term: leader.term_year,
//                 bio: leader.bio,
//                 priority: leader.order,
//             },
//             create: {
//                 userId: user.id,
//                 title: leader.position,
//                 term: leader.term_year,
//                 bio: leader.bio,
//                 priority: leader.order,
//             },
//         });
//     }
//
//     console.log(`✅ Seeded leadership items safely without constraint conflicts.`);
// }
//
// main()
//     .catch((e) => {
//         console.error("❌ Seed failed:", e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });