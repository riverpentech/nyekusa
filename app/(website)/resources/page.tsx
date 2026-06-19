"use client"

import ComingSoon from "@/components/shared/ComingSoon";
import { BookOpen } from "lucide-react";

export default function ResourcesPage() {
    return (
        <ComingSoon
            moduleName="Resources"
            description="Get access to important documents and more"
            icon={<BookOpen />}
        />
    );
}