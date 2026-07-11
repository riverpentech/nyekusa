import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resourceService } from "@/modules/resources/resources.service";
import { handleError } from "@/lib/shared/handleErrors";

// GET /api/resources?category=&department=&search=&page=&limit=
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = Object.fromEntries(searchParams.entries());

        const { data, meta } = await resourceService.listResources(query);

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

// POST /api/resources
// Body: { title, file_url, category, description?, file_type?, department? }
// file_url should already point at the uploaded file (e.g. in Supabase
// Storage) — this endpoint stores metadata, it doesn't handle the upload.
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const resource = await resourceService.createResource(body);
        return NextResponse.json(resource, { status: 201 });
    } catch (err) {
        return handleError(err);
    }
}
