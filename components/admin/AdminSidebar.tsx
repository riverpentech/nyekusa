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
    Award,
    GraduationCap,
    Briefcase,
    Lightbulb,
    MessageSquare,
    CreditCard,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Image Management", href: "/admin/image-management", icon: ImageIcon },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Events", href: "/admin/events", icon: Calendar },
    { name: "Alumni", href: "/admin/alumni", icon: GraduationCap },
    { name: "Leadership", href: "/admin/leadership", icon: Award },
    { name: "Projects", href: "/admin/projects", icon: Briefcase },
    { name: "Opportunities", href: "/admin/opportunities", icon: Lightbulb },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
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

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export default function AdminSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user as
        | { name?: string | null; email?: string | null; image?: string | null; role?: string }
        | undefined;

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    return (
        <aside className={`fixed top-0 bottom-0 left-0 z-20 ${isCollapsed ? 'w-16 p-3' : 'w-64 p-6'} border-r border-slate-200 bg-white flex flex-col justify-between transition-all duration-300`}>
            <div className="space-y-6">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2`}>
                    {!isCollapsed ? (
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-emerald-800 shrink-0" />
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-emerald-900 leading-none">NYEKUSA</h1>
                                <p className="text-[10px] text-amber-600 font-semibold leading-none mt-1">admin panel</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-8 w-8 rounded-lg bg-emerald-800 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                            <Shield className="h-5 w-5" />
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors ml-1 shrink-0"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href, item.exact);
                        return (
                            <div key={item.href} className="relative group flex items-center justify-center w-full">
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full ${
                                        active
                                            ? "bg-amber-50 text-amber-900 font-semibold"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                                >
                                    <item.icon
                                        size={18}
                                        className={active ? "text-amber-700" : "text-slate-400"}
                                    />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </Link>
                                {isCollapsed && (
                                    <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none shadow-md z-50">
                                        {item.name}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="relative group flex items-center justify-center w-full">
                    <Link
                        href="/dashboard"
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-colors ${
                            isCollapsed ? "justify-center px-0" : ""
                        }`}
                    >
                        <ArrowLeft size={18} className="text-slate-400" />
                        {!isCollapsed && <span>Back to Member Hub</span>}
                    </Link>
                    {isCollapsed && (
                        <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none shadow-md z-50">
                            Back to Member Hub
                        </span>
                    )}
                </div>

                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : 'px-2'} py-1.5`}>
                    <div className="h-9 w-9 rounded-full bg-emerald-800 flex items-center justify-center text-sm font-semibold text-white shrink-0 shadow-sm">
                        {getInitials(user?.name)}
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {user?.name ?? "Admin"}
                            </p>
                            <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-semibold text-red-800 ring-1 ring-inset ring-red-600/20 mt-0.5">
                                ADMIN
                            </span>
                        </div>
                    )}
                </div>

                <div className="relative group flex items-center justify-center w-full">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ${
                            isCollapsed ? "justify-center px-0" : ""
                        }`}
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span>Log Out</span>}
                    </button>
                    {isCollapsed && (
                        <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-red-600 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none shadow-md z-50">
                            Log Out
                        </span>
                    )}
                </div>
            </div>
        </aside>
    );
}
