// app/api/contact/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Add your email sending logic here
        // Example: Send email via nodemailer, resend, etc.

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}