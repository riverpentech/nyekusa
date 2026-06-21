import React from "react";
import PageHero from "@/components/shared/PageHero";
import AlumniSearch from "@/components/AlumniSearch";

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
        const response = await fetch(`/api/alumni`)

        if (!response.ok) {
            throw new Error('Failed to fetch alumni data');
        }

        const data = await response.json() as AlumniType[];
        return data.filter((item) => item.membership_status === "alumni");
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
