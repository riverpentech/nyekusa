import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/modules/projects/projects.service";
import { handleError } from "@/lib/shared/handleErrors";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const project = await projectService.getProject(id);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        return NextResponse.json(project);
    } catch (err) {
        return handleError(err);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const project = await projectService.updateProject(id, body);
        return NextResponse.json(project);
    } catch (err) {
        return handleError(err);
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await projectService.deleteProject(id);
        return NextResponse.json({ message: "Project deleted successfully" });
    } catch (err) {
        return handleError(err);
    }
}
