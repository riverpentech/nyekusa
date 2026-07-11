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