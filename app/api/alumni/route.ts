import { NextResponse } from 'next/server';

// Example API route - replace with your actual data fetching logic
export async function GET() {
    try {
        // Replace this with your actual database query
        // Example using Prisma:
        // const alumni = await prisma.memberProfile.findMany({
        //   where: { membership_status: "alumni" },
        //   orderBy: { created_date: 'desc' },
        //   take: 100
        // });

        // For now, return sample data
        const sampleAlumni = [
            {
                id: "1",
                full_name: "David Kibet",
                course: "BSc. Computer Science",
                admission_year: 2018,
                bio: "Software Engineer at Safaricom. Passionate about tech and mentoring the next generation.",
                skills: "Software Engineering, Cloud Computing",
                photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
                linkedin_url: "#",
                membership_status: "alumni"
            },
            // Add more sample data...
        ];

        return NextResponse.json(sampleAlumni);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch alumni data' },
            { status: 500 }
        );
    }
}