import bcrypt from "bcryptjs";
import { memberRepository } from "@/modules/members/members.repository";
import { NotFoundError, ValidationError } from "@/lib/shared/errors";
import { Prisma, Role, Gender, RelationshipStatus } from "@prisma/client";

type ApiMemberInput = {
    full_name?: string;
    email?: string;
    phone?: string;
    course?: string;
    status?: string; // Maps to RelationshipStatus enum values string representation
    year_of_study?: string;
    quotes?: string;
    photo_url?: string;
    bio?: string;
    role?: string;
    gender?: string; // Maps to Gender enum values string representation
    is_verified?: boolean;
    password?: string;
    twitter?: string | null;
    linkedin?: string | null;
    facebook?: string | null;
    instagram?: string | null;
    tiktok?: string | null;
    github?: string | null;
    is_alumni?: boolean;
    admission_year?: number;
};

type MemberListQuery = {
    status?: string; // "active" or "inactive" for system verification filtering
    role?: string;
    search?: string;
    department?: string;
    year_of_study?: string;
    limit?: string | number;
    page?: string | number;
};

type SafeMember = NonNullable<Awaited<ReturnType<typeof memberRepository.findById>>>;

const ROLES = ["USER", "MEMBER", "LEADER", "ADMIN"];
const GENDERS = ["MALE", "FEMALE", "OTHER", "RATHER_NOT_SAY"];
const RELATIONSHIP_STATUSES = ["SINGLE", "DATING", "MARRIED", "OTHER"];

// Roles that count as an actual club "member" for the public directory.
const MEMBER_ROLES: Role[] = ["MEMBER", "LEADER", "ADMIN"];

function generateTempPassword() {
    return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}

function hashPassword(password: string) {
    return bcrypt.hash(password, 10);
}

// --- mapping helpers ---------------------------------------------------

function toApiMember(user: SafeMember) {
    return {
        id: user.id,
        full_name: user.name,
        email: user.email,
        phone: user.phone,
        course: user.course,
        relationshipStatus: user.status,
        year_of_study: user.yearOfStudy,
        quotes: user.quotes,
        gender: user.gender,
        photo_url: user.photoUrl,
        bio: user.bio,
        role: user.role,
        is_verified: user.isVerified,
        // Derived for the existing frontend, which filters/displays a
        // simple active/inactive status rather than the isVerified flag.
        status: user.isVerified ? "ACTIVE" : "INACTIVE",
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        twitter: user.twitter,
        linkedin: user.linkedin,
        facebook: user.facebook,
        instagram: user.instagram,
        tiktok: user.tiktok,
        github: user.github,
        is_alumni: user.isAlumni,
        admission_year: user.admissionYear,
    };
}

function toDbData(payload: ApiMemberInput) {
    const data: Prisma.UserUpdateInput = {};
    if (payload.full_name !== undefined) data.name = payload.full_name.trim();
    if (payload.phone !== undefined) data.phone = payload.phone;
    if (payload.course !== undefined) data.course = payload.course;
    if (payload.year_of_study !== undefined) data.yearOfStudy = payload.year_of_study;
    if (payload.quotes !== undefined) data.quotes = payload.quotes;
    if (payload.photo_url !== undefined) data.photoUrl = payload.photo_url;
    if (payload.bio !== undefined) data.bio = payload.bio;

    if (payload.status !== undefined) {
        data.status = String(payload.status).toUpperCase() as RelationshipStatus;
    }
    if (payload.gender !== undefined) {
        data.gender = String(payload.gender).toUpperCase() as Gender;
    }
    if (payload.role !== undefined) {
        data.role = String(payload.role).toUpperCase() as Role;
    }
    if (payload.is_verified !== undefined) {
        data.isVerified = Boolean(payload.is_verified);
    }
    if (payload.twitter !== undefined) data.twitter = payload.twitter;
    if (payload.linkedin !== undefined) data.linkedin = payload.linkedin;
    if (payload.facebook !== undefined) data.facebook = payload.facebook;
    if (payload.instagram !== undefined) data.instagram = payload.instagram;
    if (payload.tiktok !== undefined) data.tiktok = payload.tiktok;
    if (payload.github !== undefined) data.github = payload.github;
    if (payload.is_alumni !== undefined) data.isAlumni = Boolean(payload.is_alumni);
    if (payload.admission_year !== undefined) {
        data.admissionYear = payload.admission_year ? parseInt(String(payload.admission_year), 10) : null;
    }
    return data;
}

function normalizeStatus(status?: string) {
    if (status === undefined || status === null || status === "") return undefined;
    const lower = String(status).toLowerCase();
    if (lower === "active") return true;
    if (lower === "inactive") return false;
    throw new ValidationError('status must be "active" or "inactive"');
}

// Helper to validate and normalize role
function normalizeRole(role?: string) {
    if (!role) return undefined;
    const upper = String(role).toUpperCase();
    if (upper === "ALL") return "ALL";
    if (!ROLES.includes(upper)) {
        throw new ValidationError(`role must be one of ${ROLES.join(", ")}`);
    }
    return upper;
}

function validateMemberInput(payload: ApiMemberInput, { partial = false } = {}) {
    const errors: Record<string, string> = {};

    if (!partial) {
        if (!payload.full_name?.trim()) errors.full_name = "full_name is required";
        if (!payload.email?.trim()) errors.email = "email is required";
        if (!payload.phone?.trim()) errors.phone = "phone is required";
        if (!payload.course?.trim()) errors.course = "course is required";
        if (!payload.year_of_study?.trim()) errors.year_of_study = "year_of_study is required";
    } else if (payload.full_name !== undefined && !payload.full_name?.trim()) {
        errors.full_name = "full_name cannot be empty";
    }

    if (payload.photo_url) {
        try {
            new URL(payload.photo_url);
        } catch {
            errors.photo_url = "photo_url must be a valid URL";
        }
    }

    if (payload.role !== undefined && !ROLES.includes(String(payload.role).toUpperCase())) {
        errors.role = `role must be one of ${ROLES.join(", ")}`;
    }

    if (payload.gender !== undefined && !GENDERS.includes(String(payload.gender).toUpperCase())) {
        errors.gender = `gender must be one of ${GENDERS.join(", ")}`;
    }

    if (payload.status !== undefined && !RELATIONSHIP_STATUSES.includes(String(payload.status).toUpperCase())) {
        errors.status = `status (relationship) must be one of ${RELATIONSHIP_STATUSES.join(", ")}`;
    }

    if (Object.keys(errors).length > 0) {
        throw new ValidationError("Validation failed", errors);
    }
}

// --- service -------------------------------------------------------------

export const memberService = {
    async listMembers(query: MemberListQuery = {}) {
        const { status, role, search, department, year_of_study, limit, page } = query;

        const take = Math.min(Math.max(parseInt(String(limit ?? ""), 10) || 100, 1), 200);
        const currentPage = Math.max(parseInt(String(page ?? ""), 10) || 1, 1);
        const skip = (currentPage - 1) * take;

        const where: Prisma.UserWhereInput = {};

        const normalizedRole = normalizeRole(role);
        if (normalizedRole === "ALL") {
            // No role constraint, lists all roles
        } else if (normalizedRole) {
            where.role = normalizedRole as Role;
        } else {
            where.role = { in: MEMBER_ROLES };
        }

        const isVerified = normalizeStatus(status);
        if (isVerified !== undefined) where.isVerified = isVerified;

        if (year_of_study) where.yearOfStudy = year_of_study;

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { course: { contains: search, mode: "insensitive" } },
            ];
        }

        const [users, total] = await Promise.all([
            memberRepository.findMany({ where, skip, take }),
            memberRepository.count(where),
        ]);

        return {
            data: users.map(toApiMember),
            meta: { total, page: currentPage, limit: take, pages: Math.ceil(total / take) || 1 },
        };
    },

    async getMember(id: string) {
        const user = await memberRepository.findById(id);
        if (!user) throw new NotFoundError(`Member with id "${id}" not found`);
        return toApiMember(user);
    },

    async createMember(payload: ApiMemberInput) {
        validateMemberInput(payload);

        if (!payload.email) {
            throw new ValidationError("Validation failed", { email: "email is required" });
        }

        const normalizedEmail = payload.email.trim().toLowerCase();
        const existing = await memberRepository.findByEmail(normalizedEmail);
        if (existing) {
            throw new ValidationError("Validation failed", { email: "email already in use" });
        }

        const data: Prisma.UserCreateInput = {
            email: normalizedEmail,
            password: "",
            name: payload.full_name?.trim() ?? "",
            phone: payload.phone ?? "",
            course: payload.course ?? "",
            yearOfStudy: payload.year_of_study ?? "",
            status: payload.status ? (String(payload.status).toUpperCase() as RelationshipStatus) : undefined,
            gender: payload.gender ? (String(payload.gender).toUpperCase() as Gender) : undefined,
            quotes: payload.quotes,
            photoUrl: payload.photo_url,
            bio: payload.bio,
            role: payload.role ? (String(payload.role).toUpperCase() as Role) : undefined,
            isVerified: payload.is_verified,
        };

        const usedGeneratedPassword = !payload.password;
        const plainPassword = payload.password || generateTempPassword();
        data.password = await hashPassword(plainPassword);

        if (data.role === undefined) data.role = "MEMBER";
        if (data.isVerified === undefined) data.isVerified = true;

        const created = await memberRepository.create(data);
        const result = toApiMember(created);

        if (usedGeneratedPassword && result) {
            return { ...result, temp_password: plainPassword };
        }
        return result;
    },

    async updateMember(id: string, payload: ApiMemberInput) {
        const exists = await memberRepository.existsById(id);
        if (!exists) throw new NotFoundError(`Member with id "${id}" not found`);

        validateMemberInput(payload, { partial: true });
        const data = toDbData(payload);

        const updated = await memberRepository.update(id, data);
        return toApiMember(updated);
    },

    async deleteMember(id: string) {
        const exists = await memberRepository.existsById(id);
        if (!exists) throw new NotFoundError(`Member with id "${id}" not found`);

        await memberRepository.remove(id);
        return { id };
    },
};
