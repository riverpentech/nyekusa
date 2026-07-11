import { ShieldAlert } from "lucide-react";

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h2>
                <p className="text-slate-500 mt-1">Platform management options for users and roles.</p>
            </div>
            
            <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
                <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                    <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">Module Under Construction</h3>
                    <p className="text-slate-500 text-sm max-w-sm">
                        This administrative module is scheduled for the next development phase. Check back soon.
                    </p>
                </div>
            </div>
        </div>
    );
}
