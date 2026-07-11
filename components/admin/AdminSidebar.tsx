"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Image as ImageIcon,
    Users,
    Calendar,
    Settings,
    LogOut,
    ArrowLeft,
    Shield,
} from "lucide-react";

const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Image Management", href: "/admin/image-management", icon: ImageIcon },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

function getInitials(name?: string | null) {
    if (!name) return "?";
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user as
        | { name?: string | null; email?: string | null; image?: string | null; role?: string }
        | undefined;

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    return (
        <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-slate-200 bg-white p-6 flex flex-col justify-between">
            <div className="space-y-6">
                <div className="px-2 flex items-center gap-2">
                    <Shield className="h-6 w-6 text-emerald-800" />
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-emerald-900">NYEKUSA</h1>
                        <p className="text-xs text-amber-600 font-medium">admin dashboard</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href, item.exact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    active
                                        ? "bg-amber-50 text-amber-900"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                }`}
                            >
                                <item.icon
                                    size={18}
                                    className={active ? "text-amber-700" : "text-slate-400"}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-colors"
                >
                    <ArrowLeft size={18} className="text-slate-400" />
                    Back to Member Hub
                </Link>
                <div className="flex items-center gap-3 px-2 py-1.5">
                    <div className="h-9 w-9 rounded-full bg-emerald-800 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                        {getInitials(user?.name)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                            {user?.name ?? "Admin"}
                        </p>
                        <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-800 ring-1 ring-inset ring-red-600/20">
                            ADMIN
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </aside>
    );
}
