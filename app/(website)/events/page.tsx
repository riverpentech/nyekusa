import ComingSoon from "@/components/shared/ComingSoon";
import { CalendarDays } from "lucide-react";

export default function EventsPage() {
    return (
        <ComingSoon
            moduleName="NYEKUSA Events | Workshops, Hikes, Networking, Mentorship & Thursday Experience"
            description="Stay updated with our upcoming events, mentorship programs, hikes, community engagement activities and more."
            eta="June 2026"
            icon={<CalendarDays />}
        />
    );
}