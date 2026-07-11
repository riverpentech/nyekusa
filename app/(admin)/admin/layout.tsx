import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {SessionProvider} from "next-auth/react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/signin");
    }

    const role = (session.user as { role?: string })?.role;
    if (role !== "ADMIN") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <div className="max-w-md space-y-4">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">403</h1>
                    <h2 className="text-2xl font-bold text-slate-800">Access Forbidden</h2>
                    <p className="text-slate-500">
                        You do not have the required permissions to access the Admin Dashboard.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex justify-center rounded-lg text-sm font-semibold py-2.5 px-4 bg-emerald-800 text-white hover:bg-emerald-900 transition-colors"
                    >
                        Return to Member Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <SessionProvider>
        <div className="flex min-h-screen bg-slate-50/50">
            <AdminSidebar />
            <main className="pl-64 w-full">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
        </SessionProvider>
    );
}
