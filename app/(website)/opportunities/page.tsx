import ComingSoon from "@/components/shared/ComingSoon";
import { Banknote } from "lucide-react";

export default function OpportunitiesPage() {
    return (
        <ComingSoon
            moduleName="Opportunities "
            description="Get updates on our upcoming opportunities in DeKUT and beyond."
            icon={<Banknote />}
            eta="July 2026"
        />
    );
}