"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { s3Client, BUCKET_NAME, getPublicUrl } from "@/lib/supabase";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif"
];

async function checkAdminAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized: Please sign in.");
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== "ADMIN") {
        throw new Error("Forbidden: You do not have administrator permissions.");
    }
}

export async function uploadImageAction(formData: FormData) {
    try {
        await checkAdminAuth();

        const title = formData.get("title") as string;
        const description = formData.get("description") as string || "";
        const category = formData.get("category") as string || "other";
        const file = formData.get("file") as File | null;

        if (!title || title.trim() === "") {
            return { error: "Title is required." };
        }

        if (!file || file.size === 0) {
            return { error: "Please select an image file to upload." };
        }

        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return { error: "Invalid file type. Supported types: JPEG, PNG, WEBP, GIF, AVIF." };
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return { error: "File is too large. Maximum size is 10MB." };
        }

        // Generate optimized collision-free filename
        const originalExtension = file.name.split(".").pop() || "jpg";
        const cleanedTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        const uniqueId = Math.random().toString(36).substring(2, 8);
        const fileName = `gallery/img_${Date.now()}_${uniqueId}_${cleanedTitle}.${originalExtension}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage via S3 API
        await s3Client.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileName,
                Body: buffer,
                ContentType: file.type,
                CacheControl: "public, max-age=31536000", // Cache for 1 year
            })
        );

        const url = getPublicUrl(fileName);

        // Save metadata in database
        const imageRecord = await prisma.galleryImage.create({
            data: {
                title,
                description,
                category,
                url,
                fileName,
                fileSize: file.size,
                mimeType: file.type,
            },
        });

        revalidatePath("/gallery");
        return { success: true, image: imageRecord };
    } catch (err: any) {
        console.error("Error in uploadImageAction:", err);
        return { error: err.message || "Failed to upload image." };
    }
}

export async function updateImageAction(data: {
    id: string;
    title: string;
    description?: string;
    category?: string;
}) {
    try {
        await checkAdminAuth();

        const { id, title, description = "", category = "other" } = data;

        if (!title || title.trim() === "") {
            return { error: "Title is required." };
        }

        const updated = await prisma.galleryImage.update({
            where: { id },
            data: {
                title,
                description,
                category,
            },
        });

        revalidatePath("/gallery");
        return { success: true, image: updated };
    } catch (err: any) {
        console.error("Error in updateImageAction:", err);
        return { error: err.message || "Failed to update image details." };
    }
}

export async function replaceImageAction(id: string, formData: FormData) {
    try {
        await checkAdminAuth();

        const title = formData.get("title") as string;
        const description = formData.get("description") as string || "";
        const category = formData.get("category") as string || "other";
        const file = formData.get("file") as File | null;

        const existingImage = await prisma.galleryImage.findUnique({
            where: { id },
        });

        if (!existingImage) {
            return { error: "Image not found." };
        }

        let fileName = existingImage.fileName;
        let url = existingImage.url;
        let fileSize = existingImage.fileSize;
        let mimeType = existingImage.mimeType;

        // If a new file is uploaded, replace the old one
        if (file && file.size > 0) {
            // Validate file type
            if (!ALLOWED_MIME_TYPES.includes(file.type)) {
                return { error: "Invalid file type. Supported types: JPEG, PNG, WEBP, GIF, AVIF." };
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return { error: "File is too large. Maximum size is 10MB." };
            }

            // Delete old file from S3 storage
            try {
                await s3Client.send(
                    new DeleteObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: existingImage.fileName,
                    })
                );
            } catch (s3Err) {
                console.error("Error deleting old file from storage during replace:", s3Err);
                // Continue anyway to avoid getting stuck
            }

            // Generate new filename
            const originalExtension = file.name.split(".").pop() || "jpg";
            const cleanedTitle = (title || existingImage.title)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            const uniqueId = Math.random().toString(36).substring(2, 8);
            fileName = `gallery/img_${Date.now()}_${uniqueId}_${cleanedTitle}.${originalExtension}`;

            // Upload new file
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            await s3Client.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: fileName,
                    Body: buffer,
                    ContentType: file.type,
                    CacheControl: "public, max-age=31536000",
                })
            );

            url = getPublicUrl(fileName);
            fileSize = file.size;
            mimeType = file.type;
        }

        const updated = await prisma.galleryImage.update({
            where: { id },
            data: {
                title: title || existingImage.title,
                description,
                category,
                url,
                fileName,
                fileSize,
                mimeType,
            },
        });

        revalidatePath("/gallery");
        return { success: true, image: updated };
    } catch (err: any) {
        console.error("Error in replaceImageAction:", err);
        return { error: err.message || "Failed to replace image." };
    }
}

export async function deleteImageAction(id: string) {
    try {
        await checkAdminAuth();

        // Find existing record
        const image = await prisma.galleryImage.findUnique({
            where: { id },
        });

        if (!image) {
            return { error: "Image not found." };
        }

        // Delete from Supabase Storage
        try {
            await s3Client.send(
                new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: image.fileName,
                })
            );
        } catch (s3Err) {
            console.error("Error deleting file from S3 storage:", s3Err);
            // Delete DB record anyway to avoid orphan record loop if file is missing in storage
        }

        // Delete record from database
        await prisma.galleryImage.delete({
            where: { id },
        });

        revalidatePath("/gallery");
        return { success: true };
    } catch (err: any) {
        console.error("Error in deleteImageAction:", err);
        return { error: err.message || "Failed to delete image." };
    }
}

export async function createAlbumAction(data: {
    title: string;
    description?: string;
    category?: string;
    date?: string;
    coverImage?: string;
    images: string;
}) {
    try {
        await checkAdminAuth();

        const { title, description = "", category = "other", date, coverImage = "", images } = data;

        if (!title || title.trim() === "") {
            return { error: "Title is required." };
        }
        if (!images || images.trim() === "") {
            return { error: "Google Photos album link is required." };
        }

        const album = await prisma.galleryAlbum.create({
            data: {
                title,
                description,
                category,
                date: date ? new Date(date) : null,
                coverImage,
                images,
            },
        });

        revalidatePath("/dashboard/gallery");
        return { success: true, album };
    } catch (err: any) {
        console.error("Error in createAlbumAction:", err);
        return { error: err.message || "Failed to create gallery album." };
    }
}

export async function updateAlbumAction(data: {
    id: string;
    title?: string;
    description?: string;
    category?: string;
    date?: string;
    coverImage?: string;
    images?: string;
}) {
    try {
        await checkAdminAuth();

        const { id, title, description, category, date, coverImage, images } = data;

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (date !== undefined) updateData.date = date ? new Date(date) : null;
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (images !== undefined) updateData.images = images;

        const album = await prisma.galleryAlbum.update({
            where: { id },
            data: updateData,
        });

        revalidatePath("/dashboard/gallery");
        return { success: true, album };
    } catch (err: any) {
        console.error("Error in updateAlbumAction:", err);
        return { error: err.message || "Failed to update gallery album." };
    }
}

export async function deleteAlbumAction(id: string) {
    try {
        await checkAdminAuth();

        await prisma.galleryAlbum.delete({
            where: { id },
        });

        revalidatePath("/dashboard/gallery");
        return { success: true };
    } catch (err: any) {
        console.error("Error in deleteAlbumAction:", err);
        return { error: err.message || "Failed to delete gallery album." };
    }
}
