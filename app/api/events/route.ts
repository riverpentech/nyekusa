import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limitStr = searchParams.get('limit');
        const limit = limitStr ? parseInt(limitStr) : undefined;

        const events = await prisma.event.findMany({
            orderBy: { eventDate: 'asc' },
            take: limit,
        });

        return NextResponse.json({ events });
    } catch (error) {
        console.error('Failed to fetch events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, location, eventDate, image } = body;

        if (!title || !description || !location || !eventDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const event = await prisma.event.create({
            data: {
                title,
                description,
                location,
                eventDate: new Date(eventDate),
                image: image || null,
            }
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error('Failed to create event:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}
