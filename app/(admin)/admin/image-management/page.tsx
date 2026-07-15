import prisma from "@/lib/prisma";
import ImageManagementClient from "@/components/admin/ImageManagementClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminImageManagementPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/signin");
    }

    const role = (session.user as { role?: string })?.role;
    if (role !== "ADMIN") {
        redirect("/dashboard");
    }

    const images = await prisma.galleryImage.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });

    const albums = await prisma.galleryAlbum.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });

    // Cast Date objects to ISO string or rely on React Server Component serialization
    // Actually, prisma returns Date objects which are fully serializable since initialAlbums is passed to a client component.
    // Next.js handles Date serialization, but to be safe, we can serialize dates if needed.
    // Let's just pass them directly.
    return <ImageManagementClient initialImages={images} initialAlbums={albums} />;
}
