import prisma from "@/lib/prisma";
import PublicGalleryClient from "@/components/gallery/PublicGalleryClient";

export const dynamic = "force-dynamic";

export default async function PublicGalleryPage() {
    const images = await prisma.galleryImage.findMany({
        orderBy: {
            createdAt: "desc"
        }
    });

    return <PublicGalleryClient initialImages={images} />;
}