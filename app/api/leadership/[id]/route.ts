import { NextResponse } from 'next/server';

const mockLeaders = [
    { id: "1", full_name: "James Mwangi", position: "Chairperson", bio: "A passionate leader dedicated to uniting students and fostering community growth.", term_year: "2024/2025", is_current: true, photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face", order: 1 },
    { id: "2", full_name: "Grace Wanjiku", position: "Vice Chairperson", bio: "Committed to academic excellence and student welfare.", term_year: "2024/2025", is_current: true, photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face", order: 2 },
    // ... more mock data
];

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const leader = mockLeaders.find(l => l.id === id);

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

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Find and update the leader
        const index = mockLeaders.findIndex(l => l.id === id);

        if (index === -1) {
            return NextResponse.json(
                { error: 'Leadership entry not found' },
                { status: 404 }
            );
        }

        // In a real app, you would update in database
        const updatedLeader = {
            ...mockLeaders[index],
            ...body,
            updated_at: new Date().toISOString(),
        };

        return NextResponse.json(updatedLeader);
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
        // In a real app, you would delete from database
        const leader = mockLeaders.find(l => l.id === id);

        if (!leader) {
            return NextResponse.json(
                { error: 'Leadership entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Leadership entry deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting leadership entry:', error);
        return NextResponse.json(
            { error: 'Failed to delete leadership entry' },
            { status: 500 }
        );
    }
}