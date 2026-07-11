import { galleryRepository } from "@/modules/gallery/gallery.repository";

export const galleryService = {
    async listAlbums(limit: number = 50) {
        const albums = await galleryRepository.findMany({ take: limit });
        return albums.map((album) => ({
            id: album.id,
            title: album.title ?? "",
            description: album.description ?? "",
            category: album.category ?? "other",
            date: album.date ? album.date.toISOString().split("T")[0] : "",
            cover_image: album.coverImage ?? "",
            images: album.images ?? "",
        }));
    }
};
