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

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, term, bio, priority } = body;

        const updated = await leadershipService.updateLeader(id, {
            title,
            term,
            bio,
            priority: priority !== undefined ? parseInt(String(priority)) : undefined,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating leadership entry:', error);
        return NextResponse.json(
            { error: 'Failed to update leadership entry' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await leadershipService.deleteLeader(id);
        return NextResponse.json({ message: 'Leadership entry deleted successfully' });
    } catch (error) {
        console.error('Error deleting leadership entry:', error);
        return NextResponse.json(
            { error: 'Failed to delete leadership entry' },
            { status: 500 }
        );
    }
}