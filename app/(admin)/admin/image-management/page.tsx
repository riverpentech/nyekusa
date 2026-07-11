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

    return <ImageManagementClient initialImages={images} />;
}
