import { NextResponse } from 'next/server';
import { galleryService } from "@/modules/gallery/gallery.service";

export async function GET() {
    try {
        const mapped = await galleryService.listAlbums(50);
        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Error fetching gallery albums:', error);
        return NextResponse.json(
            { error: 'Failed to fetch albums' },
            { status: 500 }
        );
    }
}