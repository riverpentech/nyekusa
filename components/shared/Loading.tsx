export default function ResourcesLoading() {
    return (
        <section className="py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-10 max-w-md bg-muted rounded-md animate-pulse mb-10" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card rounded-xl border border-border/50 p-5 h-20 animate-pulse" />
                    ))}
                </div>
            </div>
        </section>
    );
}