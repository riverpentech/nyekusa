import { projectRepository } from "@/modules/projects/projects.repository";
import { ValidationError } from "@/lib/shared/errors";
import { ProjectStatus } from "@prisma/client";

type ProjectInput = {
    title: string;
    description: string;
    status?: string;
    budget?: number | string;
    startDate?: string;
    endDate?: string;
};

export const projectService = {
    async listProjects(limit: number = 50, status?: string | null) {
        const where: any = {};
        if (status) {
            const upperStatus = status.toUpperCase();
            if (Object.values(ProjectStatus).includes(upperStatus as ProjectStatus)) {
                where.status = upperStatus as ProjectStatus;
            }
        }

        return projectRepository.findMany({ where, take: limit });
    },

    async createProject(body: ProjectInput) {
        const { title, description, status, budget, startDate, endDate } = body;
        if (!title || !description) {
            throw new ValidationError("Missing required fields: title and description are mandatory.");
        }

        let projectStatus: ProjectStatus = ProjectStatus.PLANNING;
        if (status && Object.values(ProjectStatus).includes(status.toUpperCase() as ProjectStatus)) {
            projectStatus = status.toUpperCase() as ProjectStatus;
        }

        return projectRepository.create({
            title: title.trim(),
            description: description.trim(),
            status: projectStatus,
            budget: budget ? parseFloat(String(budget)) : 0.0,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
        });
    }
};
