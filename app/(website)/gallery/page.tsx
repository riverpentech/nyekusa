import ComingSoon from "@/components/shared/ComingSoon";
import { Images } from "lucide-react";

export default function GalleryPage() {
    return (
        <ComingSoon
            moduleName="Gallery | Moments, Events, Laughters & Memories"
            description="Browse photos and highlights from our events, leadership programs, mentorship initiatives  and memorable moments shared by our members."
            eta="June 2026"
            icon={<Images />}
        />
    );
}