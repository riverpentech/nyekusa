import Link from "next/link";
import {
    LayoutDashboard,
    User as UserIcon,
    CreditCard,
    Award,
    Briefcase,
    LogOut
} from "lucide-react";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    // Navigation matching your user structure and sidebar design
    const navItems = [
        { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { name: "My Profile", href: "/dashboard/profile", icon: UserIcon },
        { name: "Payments & Fees", href: "/dashboard/payments", icon: CreditCard },
        { name: "Opportunities", href: "/dashboard/opportunities", icon: Briefcase },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Sidebar Panel */}
            <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r border-slate-200 bg-white p-6 flex flex-col justify-between">
                <div className="space-y-6">
                    {/* Brand/Logo header matching your screenshot styling */}
                    <div className="px-2">
                        <h1 className="text-xl font-bold tracking-tight text-emerald-900">NYEKUSA</h1>
                        <p className="text-xs text-amber-600 font-medium">our unity, our strength</p>
                    </div>

                    {/* Nav Links */}
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-colors"
                            >
                                <item.icon size={18} className="text-slate-400" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* User Session Bottom Area */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                    <div className="flex items-center gap-3 px-2 py-1.5">
                        <div className="h-9 w-9 rounded-full bg-emerald-800 flex items-center justify-center text-sm font-semibold text-white">
                            WM
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-900 truncate max-w-[140px]">Welcome Back</p>
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
                MEMBER
              </span>
                        </div>
                    </div>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main View Area */}
            <main className="pl-64 w-full">
                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}