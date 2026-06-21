import { resourceService } from "@/services/resourcesService";
import PageHero from "@/components/shared/PageHero";
import ResourcesClient from "@/components/ResourcesClient";

export const metadata = {
    title: "Resource Center | NYEKUSA",
    description:
        "Access important documents from our community.",
};

// Resources change occasionally (admin uploads), not on every request —
// revalidate periodically instead of forcing fully dynamic rendering.
export const revalidate = 60;

export default async function ResourcesPage() {
    const resources = await resourceService
        .listResources({ limit: 50 })
        .then(({ data }) => data)
        .catch(() => {
            return [];
        });

    return (
        <div>
            <PageHero
                badge="Resources"
                title="Resource Center"
                description="Access important documents from our community."
            />
            <ResourcesClient initialResources={resources} />
        </div>
    );
}
