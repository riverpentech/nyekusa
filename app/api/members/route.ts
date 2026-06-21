import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { memberService } from "@/services/membersService";
import { handleError } from "@/lib/shared/handleErrors";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const { data, meta } = await memberService.listMembers(query);

        return NextResponse.json(data, {
            headers: {
                "X-Total-Count": String(meta.total),
                "X-Page": String(meta.page),
                "X-Limit": String(meta.limit),
                "X-Total-Pages": String(meta.pages),
            },
        });
    } catch (err) {
        return handleError(err);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const member = await memberService.createMember(body);
        return NextResponse.json(member, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
}
