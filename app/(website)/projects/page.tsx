"use client"

import ComingSoon from "@/components/shared/ComingSoon";
import { FolderKanban } from "lucide-react";

export default function ProjectsPage() {
    return (
        <ComingSoon
            moduleName="Projects | Driving Community Impact & Innovation"
            description="Explore our projects and initiatives focused on education, leadership development, mentorship and positive community transformation."
            eta="July 2026"
            icon={<FolderKanban />}
        />
    );
}