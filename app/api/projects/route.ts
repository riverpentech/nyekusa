import { NextResponse } from 'next/server';
import type { NextRequest } from "next/server";
import { projectService } from "@/modules/projects/projects.service";
import { handleError } from "@/lib/shared/handleErrors";

// GET /api/projects
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') ?? '', 10) || 50;
        const status = searchParams.get('status');

        const projects = await projectService.listProjects(limit, status);

        return NextResponse.json(projects, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        return handleError(error);
    }
}

// POST /api/projects
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const createdProject = await projectService.createProject(body);

        return NextResponse.json(
            { message: 'Project created successfully', project: createdProject },
            { status: 201 }
        );
    } catch (error) {
        return handleError(error);
    }
}