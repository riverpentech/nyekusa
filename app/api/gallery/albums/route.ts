import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const albums = await prisma.galleryAlbum.findMany({
            orderBy: { date: 'desc' },
            take: 50
        });

            const mapped = albums.map((album) => ({
                id: album.id,
                title: album.title ?? "",
                description: album.description ?? "",
                category: album.category ?? "other",
                date: album.date ? album.date.toISOString().split("T")[0] : "",
                cover_image: album.coverImage ?? "",
                images: album.images ?? "",
            }));
            return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching gallery albums:', error);
        return NextResponse.json(
            { error: 'Failed to fetch albums' },
            { status: 500 }
        );
    }
}