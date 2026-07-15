import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const alumni = await prisma.user.findMany({
            where: { isAlumni: true },
            orderBy: { admissionYear: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                gender: true,
                course: true,
                yearOfStudy: true,
                bio: true,
                photoUrl: true,
                admissionYear: true,
                isAlumni: true,
                linkedin: true,
                twitter: true,
            }
        });

        const formattedAlumni = alumni.map(a => ({
            id: a.id,
            full_name: a.name,
            email: a.email,
            phone: a.phone,
            course: a.course,
            admission_year: a.admissionYear ?? 0,
            bio: a.bio ?? "",
            photo_url: a.photoUrl ?? "",
            linkedin_url: a.linkedin ?? "",
            twitter_url: a.twitter ?? "",
            isAlumni: a.isAlumni,
        }));

        return NextResponse.json(formattedAlumni);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch alumni data' },
            { status: 500 }
        );
    }
}