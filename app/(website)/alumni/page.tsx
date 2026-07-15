import React from "react";
import PageHero from "@/components/shared/PageHero";
import AlumniSearch from "@/components/AlumniSearch";
import { prisma } from "@/lib/prisma";

export interface AlumniType {
    id: string;
    full_name: string;
    course: string;
    admission_year: number;
    bio: string;
    skills: string;
    photo_url: string;
    linkedin_url: string;
    email?: string;
    membership_status?: string;
}

async function getAlumniData(): Promise<AlumniType[]> {
    try {
        const alumni = await prisma.user.findMany({
            where: { isAlumni: true },
            orderBy: { admissionYear: 'desc' },
            select: {
                id: true,
                name: true,
                course: true,
                admissionYear: true,
                bio: true,
                quotes: true,
                photoUrl: true,
                linkedin: true,
                email: true,
            }
        });

        return alumni.map((a) => ({
            id: a.id,
            full_name: a.name,
            course: a.course,
            admission_year: a.admissionYear ?? 2020,
            bio: a.bio ?? "",
            skills: a.quotes ?? "",
            photo_url: a.photoUrl ?? "",
            linkedin_url: a.linkedin ?? "",
            email: a.email,
            membership_status: "alumni"
        }));
    } catch (error) {
        console.error('Error fetching alumni:', error);
        return [];
    }
}

export default async function AlumniPage() {
    const alumniData = await getAlumniData();

    return (
        <div>
            <PageHero
                badge="Alumni"
                title="Our Alumni Network"
                description="Graduates who continue to inspire, mentor, and give back to the NYEKUSA community."
            />

            <section className="py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AlumniSearch initialAlumni={alumniData} />
                </div>
            </section>
        </div>
    );
}
