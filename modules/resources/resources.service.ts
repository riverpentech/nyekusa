import { resourceRepository } from "@/modules/resources/resources.repository";
import { NotFoundError, ValidationError } from "@/lib/shared/errors";
import type { Prisma } from "@prisma/client";

type ApiResourceInput = {
    title?: string;
    description?: string | null;
    file_url?: string;
    file_type?: string | null;
    category?: string;
    department?: string | null;
};

type ResourceListQuery = {
    category?: string;
    department?: string;
    search?: string;
    limit?: string | number;
    page?: string | number;
};

type ResourceRecord = NonNullable<Awaited<ReturnType<typeof resourceRepository.findById>>>;

function toApiResource(resource: ResourceRecord) {
    return {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        file_url: resource.fileUrl,
        file_type: resource.fileType,
        category: resource.category,
        department: resource.department,
        download_count: resource.downloadCount,
        created_at: resource.createdAt,
        updated_at: resource.updatedAt,
    };
}

function toDbData(payload: ApiResourceInput) {
    const data: Prisma.ResourceUpdateInput = {};
    if (payload.title !== undefined) data.title = payload.title.trim();
    if (payload.description !== undefined) data.description = payload.description;
    if (payload.file_url !== undefined) data.fileUrl = payload.file_url;
    if (payload.file_type !== undefined) data.fileType = payload.file_type;
    if (payload.category !== undefined) data.category = payload.category;
    if (payload.department !== undefined) data.department = payload.department;
    return data;
}

function validateResourceInput(payload: ApiResourceInput, { partial = false } = {}) {
    const errors: Record<string, string> = {};

    if (!partial || payload.title !== undefined) {
        if (!payload.title?.trim()) errors.title = "title is required";
    }

    if (!partial || payload.file_url !== undefined) {
        if (!payload.file_url?.trim()) {
            errors.file_url = "file_url is required";
        } else {
            try {
                new URL(payload.file_url);
            } catch {
                errors.file_url = "file_url must be a valid URL";
            }
        }
    }

    if (!partial || payload.category !== undefined) {
        if (!payload.category?.trim()) errors.category = "category is required";
    }

    if (Object.keys(errors).length > 0) {
        throw new ValidationError("Validation failed", errors);
    }
}

export const resourceService = {
    async listResources(query: ResourceListQuery = {}) {
        const { category, department, search, limit, page } = query;

        const take = Math.min(Math.max(parseInt(String(limit ?? ""), 10) || 50, 1), 200);
        const currentPage = Math.max(parseInt(String(page ?? ""), 10) || 1, 1);
        const skip = (currentPage - 1) * take;

        const where: Prisma.ResourceWhereInput = {};
        if (category) where.category = category;
        if (department) where.department = department;

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        const [resources, total] = await Promise.all([
            resourceRepository.findMany({ where, skip, take }),
            resourceRepository.count(where),
        ]);

        return {
            data: resources.map(toApiResource),
            meta: { total, page: currentPage, limit: take, pages: Math.ceil(total / take) || 1 },
        };
    },

    async getResource(id: string) {
        const resource = await resourceRepository.findById(id);
        if (!resource) throw new NotFoundError(`Resource with id "${id}" not found`);
        return toApiResource(resource);
    },

    async createResource(payload: ApiResourceInput) {
        validateResourceInput(payload);
        const data: Prisma.ResourceCreateInput = {
            title: payload.title?.trim() ?? "",
            description: payload.description,
            fileUrl: payload.file_url ?? "",
            fileType: payload.file_type,
            category: payload.category ?? "",
            department: payload.department,
        };
        const created = await resourceRepository.create(data);
        return toApiResource(created);
    },

    async updateResource(id: string, payload: ApiResourceInput) {
        const exists = await resourceRepository.existsById(id);
        if (!exists) throw new NotFoundError(`Resource with id "${id}" not found`);

        validateResourceInput(payload, { partial: true });
        const data = toDbData(payload);
        const updated = await resourceRepository.update(id, data);
        return toApiResource(updated);
    },

    async deleteResource(id: string) {
        const exists = await resourceRepository.existsById(id);
        if (!exists) throw new NotFoundError(`Resource with id "${id}" not found`);

        await resourceRepository.remove(id);
        return { id };
    },

    async registerDownload(id: string) {
        const exists = await resourceRepository.existsById(id);
        if (!exists) throw new NotFoundError(`Resource with id "${id}" not found`);

        const updated = await resourceRepository.incrementDownloadCount(id);
        return updated.fileUrl;
    },
};
