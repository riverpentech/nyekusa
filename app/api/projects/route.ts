// app/api/projects/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma"; // Adjust this import path based on your layout
import { ProjectStatus } from "@prisma/client";

// GET /api/projects
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') ?? '', 10) || 50;
        const status = searchParams.get('status');

        // Build conditional filter clauses
        const where: any = {};

        if (status) {
            const upperStatus = status.toUpperCase();
            // Validate against ProjectStatus enum to prevent query crashes
            if (Object.values(ProjectStatus).includes(upperStatus as ProjectStatus)) {
                where.status = upperStatus as ProjectStatus;
            }
        }

        // Fetch live projects directly from the database
        const projects = await prisma.project.findMany({
            where,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                tasks: {
                    include: {
                        assignedTo: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                photoUrl: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(projects, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}

// POST /api/projects
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, status, budget, startDate, endDate } = body;

        // Validate strictly required schema fields
        if (!title || !description) {
            return NextResponse.json(
                { error: 'Missing required fields: title and description are mandatory.' },
                { status: 400 }
            );
        }

        // Parse and process project variables safely
        let projectStatus: ProjectStatus = ProjectStatus.PLANNING;
        if (status && Object.values(ProjectStatus).includes(status.toUpperCase() as ProjectStatus)) {
            projectStatus = status.toUpperCase() as ProjectStatus;
        }

        const createdProject = await prisma.project.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                status: projectStatus,
                budget: budget ? parseFloat(String(budget)) : 0.0,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            },
            include: {
                tasks: true
            }
        });

        return NextResponse.json(
            { message: 'Project created successfully', project: createdProject },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        );
    }
}