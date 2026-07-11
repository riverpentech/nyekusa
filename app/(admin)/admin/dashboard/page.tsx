import prisma from "@/lib/prisma";
import { Image, Users, Calendar } from "lucide-react";

export default async function AdminDashboardOverview() {
    const [imageCount, userCount, eventCount] = await Promise.all([
        prisma.galleryImage.count(),
        prisma.user.count(),
        prisma.event.count(),
    ]);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Admin Control Panel</h2>
                <p className="text-slate-500 mt-1">Manage the platform, members, events, and gallery media.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Metric 1: Image management */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-medium text-slate-500">Gallery Images</p>
                        <Image className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-900">{imageCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Uploaded in Supabase Storage</p>
                    </div>
                </div>

                {/* Metric 2: Users */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-medium text-slate-500">Registered Members</p>
                        <Users className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-900">{userCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Total platform users registered</p>
                    </div>
                </div>

                {/* Metric 3: Events */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-medium text-slate-500">Events Scheduled</p>
                        <Calendar className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-900">{eventCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Inductions, hikes, and gatherings</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Platform security */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Admin Shortcuts</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href="/admin/image-management"
                            className="flex flex-col items-center justify-center p-4 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors text-center border border-emerald-100"
                        >
                            <Image className="h-6 w-6 mb-2 text-emerald-700" />
                            <span className="text-sm font-medium">Manage Gallery</span>
                        </a>
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed text-center border border-slate-100">
                            <Users className="h-6 w-6 mb-2 text-slate-400" />
                            <span className="text-sm font-medium">Manage Users</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Platform Security Notice</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            As an administrator, you have permission to upload, replace, and delete public image resources and documents. Always double check before deleting content, as these deletions are final.
                        </p>
                    </div>
                    <div className="pt-4 text-xs text-slate-400 font-medium">
                        Secure connection active: AWS Pooler / Supabase Storage
                    </div>
                </div>
            </div>
        </div>
    );
}
