import { NextResponse } from 'next/server';
import { leadershipService } from "@/modules/leadership/leadership.service";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const term = searchParams.get('term'); // Can filter by term e.g. 2025/2026

        const results = await leadershipService.listLeaders(term, limit);

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching leadership data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leadership data' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, title, term, bio, priority, fullName } = body;

        if (!userId || !title || !term) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newLeader = await leadershipService.createLeader({
            userId,
            title,
            term,
            bio,
            priority: priority ? parseInt(String(priority)) : 0,
            fullName,
        });

        return NextResponse.json(newLeader, { status: 201 });
    } catch (error) {
        console.error('Error creating leadership entry:', error);
        return NextResponse.json(
            { error: 'Failed to create leadership entry' },
            { status: 500 }
        );
    }
}