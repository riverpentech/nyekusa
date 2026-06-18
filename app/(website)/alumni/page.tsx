import ComingSoon from "@/components/shared/ComingSoon";
import { GraduationCap } from "lucide-react";

export default function AlumniPage() {
    return (
        <ComingSoon
            moduleName="Alumni Network | Connecting Graduates & Professionals"
            description="Expore our Alumni Network and connect with graduates, professionals, mentors and industry leaders dedicated to supporting the next generation of students and creating lasting impact."
            icon={<GraduationCap />}
        />
    );
}