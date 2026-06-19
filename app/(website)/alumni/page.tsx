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

const sampleAlumni: AlumniType[] = [
    {
        id: "1",
        full_name: "Alan Maina",
        course: "BSc. Computer Science",
        admission_year: 2018,
        bio: "Software Engineer at Safaricom. Passionate about tech and mentoring the next generation.",
        skills: "Software Engineering, Cloud Computing",
        photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        linkedin_url: "#"
    },
    {
        id: "2",
        full_name: "George Gitonga",
        course: "BSc. Electrical Engineering",
        admission_year: 2017,
        bio: "Project Engineer at KenGen. Contributing to Kenya's renewable energy infrastructure.",
        skills: "Power Systems, Project Management",
        photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
        linkedin_url: "#"
    },
    {
        id: "3",
        full_name: "Susan Nyambura",
        course: "BBA Finance",
        admission_year: 2016,
        bio: "Investment Analyst at CIC Group. Helping students navigate the world of finance.",
        skills: "Financial Analysis, Investment Banking",
        photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
        linkedin_url: "#"
    },
    {
        id: "4",
        full_name: "Joyce Muthoni",
        course: "BSc. Food Science",
        admission_year: 2017,
        bio: "Quality Assurance Manager at Brookside Dairy. Passionate about food safety and innovation.",
        skills: "Food Technology, Quality Management",
        photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
        linkedin_url: "#"
    },
];

async function getAlumniData(): Promise<AlumniType[]> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/alumni`, {
            cache: 'force-cache', // or 'no-store' for dynamic data
            next: { revalidate: 3600 } // Revalidate every hour
        });

        if (!response.ok) {
            throw new Error('Failed to fetch alumni data');
        }

        const data = await response.json();
        return data.filter((item: any) => item.membership_status === "alumni");
    } catch (error) {
        console.error('Error fetching alumni:', error);
        return sampleAlumni;
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