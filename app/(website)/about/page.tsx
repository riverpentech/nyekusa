import ComingSoon from "@/components/shared/ComingSoon";
import { Info } from "lucide-react";

export default function AboutPage() {
    return (
        <ComingSoon
            moduleName="About"
            description=" Learn more about NYEKUSA, our vision and our mission."
            icon={<Info />}
        />
    );
}