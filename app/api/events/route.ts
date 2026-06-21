import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '3');

    // Replace with your actual data fetching logic
    const events: unknown[] = [];

    return NextResponse.json({ events });
}
