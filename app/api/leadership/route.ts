import { NextResponse } from 'next/server';

const mockLeaders = [
    { id: "1", full_name: "Samuel Gakuru", position: "Chairperson", bio: "A passionate leader dedicated to uniting students and fostering community growth.", term_year: "2025/2026",  photo_url: "/leaders/samuelgakuru.webp", order: 1, email: "samuel.gakuru23@students.dkut.ac.ke", linkedin_url: "https://linkedin.com/in/laikipiainfluencer", twitter_url: "https://twitter.com/laikipiainfluencer" },
    { id: "2", full_name: "Brian Karaba", position: "Vice Chairperson", bio: "Committed to academic excellence and student welfare.", term_year: "2025/2026", photo_url: "/leaders/briankaraba.webp", order: 2, email: "brian.karaba@students.dkut.ac.ke" },
    { id: "3", full_name: "Gerald Karoki", position: "Secretary General", bio: "Ensures smooth coordination of all association activities and communications.", term_year: "2025/2026", photo_url: "", order: 3 },
    { id: "4", full_name: "Juliet Wairimu", position: "Treasurer", bio: "Managing finances with transparency and accountability.", term_year: "2025/2026", photo_url: "", order: 4 },
    { id: "5", full_name: "Washington Mwangi", position: "Organizing Secretary", bio: "Planning and executing memorable events for the community.", term_year: "2025/2026", photo_url: "", order: 5 },
    { id: "6", full_name: "Faith Wairimu King'ori", position: "Social & Welfare Secretary", bio: "Championing student well-being and social cohesion.", term_year: "2025/2026", photo_url: "/leaders/faithwairimu.webp", order: 6, email: "faith.kingori@students.dkut.ac.ke" },
    { id: "7", full_name: "Eric Macharia", position: "Public Relations Officer", bio: "Ensuring the association's visibility and engagement.", term_year: "2025/2026", photo_url: "/leaders/ericmacharia.webp", order: 7 },
    { id: "8", full_name: "Lucy Wanjiru", position: "Assistant Organising Secretary", bio: "Helping in planning and execution of activities and projects.", term_year: "2025/2026", photo_url: "", order: 8},
    { id: "9", full_name: "Alan Mwangi ", position: "Chairperson", bio: "Led the association during a transformative period.", term_year: "2024/2025", photo_url: "", order: 1 },
    { id: "10", full_name: "Samuel Gakuru", position: "Secretary General", bio: "A passionate leader dedicated to uniting students and fostering community growth.", term_year: "2024/2025", photo_url: "/leaders/samuelgakuru.webp", order: 2, email: "samuel.gakuru23@students.dkut.ac.ke", linkedin_url: "https://linkedin.com/in/laikipiainfluencer", twitter_url: "https://twitter.com/laikipiainfluencer" },
];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const order = searchParams.get('order') || 'order';

        // Simulate database delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Sort by order field
        const sorted = [...mockLeaders].sort((a, b) => {
            if (order === 'order') {
                return (a.order || 0) - (b.order || 0);
            }
            return 0;
        });

        // Limit results
        const results = sorted.slice(0, limit);

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

        // Here you would typically validate and save to a database
        // For now, just return the created entry with a mock ID
        const newLeader = {
            id: String(mockLeaders.length + 1),
            ...body,
            created_at: new Date().toISOString(),
        };

        // In a real app, you would save to database here

        return NextResponse.json(newLeader, { status: 201 });
    } catch (error) {
        console.error('Error creating leadership entry:', error);
        return NextResponse.json(
            { error: 'Failed to create leadership entry' },
            { status: 500 }
        );
    }
}