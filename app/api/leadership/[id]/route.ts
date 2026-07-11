import { NextResponse } from 'next/server';
import { leadershipService } from "@/modules/leadership/leadership.service";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const leader = await leadershipService.getLeader(id);

        if (!leader) {
            return NextResponse.json(
                { error: 'Leadership entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(leader);
    } catch (error) {
        console.error('Error fetching leadership entry:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leadership entry' },
            { status: 500 }
        );
    }
}