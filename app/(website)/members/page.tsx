import ComingSoon from "@/components/shared/ComingSoon";
import { Users } from "lucide-react";

export default function MembersPage() {
    return (
        <ComingSoon
            moduleName="Members | A Community filled with love"
            description="Discover the vibrant membership community bringing together students, innovators, and leaders to learn, grow, make memories and create impact."
            eta="June 2026"
            icon={<Users />}
        />
    );
}