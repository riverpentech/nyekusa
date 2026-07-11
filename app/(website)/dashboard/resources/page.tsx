import { resourceService } from "@/modules/resources/resources.service";
import ResourcesClient from "@/components/ResourcesClient";

export const revalidate = 60;

export default async function DashboardResourcesPage() {
    const resources = await resourceService
        .listResources({ limit: 50 })
        .then(({ data }) => data)
        .catch(() => []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Resources</h2>
                <p className="text-slate-500 mt-1">Access important documents from our community.</p>
            </div>
            <ResourcesClient initialResources={resources} compact />
        </div>
    );
}
