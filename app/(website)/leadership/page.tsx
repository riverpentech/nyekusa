import ComingSoon from "@/components/shared/ComingSoon";
import { Crown } from "lucide-react";

export default function LeadershipPage() {
    return (
        <ComingSoon
            moduleName="Leadership | Executive Team"
            description="Meet the dedicated leaders driving NYEKUSA's vision and achievements."
            eta="June 2026"
            icon={<Crown />}
        />
    );
}