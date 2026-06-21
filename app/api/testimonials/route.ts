import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const isFeatured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '3');

    // Replace with your actual data fetching logic
    const testimonials: unknown[] = [
        // Your testimonials data here, filtered by is_featured if needed
        // and sorted by created_date descending
    ];

    return NextResponse.json({ testimonials });
}
