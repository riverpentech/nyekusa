import {
    CheckCircle2,
    Clock,
    GraduationCap,
    FileText,
    Calendar,
    AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    // Mocking real db context corresponding to your schema fields
    const mockUser = {
        name: "Samuel Gakuru",
        role: "MEMBER", // Enum: USER, MEMBER, LEADER, ADMIN
        yearOfStudy: "4.1",
        course: "BSc. Computer Science",
        isVerified: true,
        payment: {
            amount: 50.0,
            status: "COMPLETED", // Enum: PENDING, COMPLETED, FAILED
            mpesaReceiptCode: "SFT78XJ9K1"
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Hello, {mockUser.name}!
                </h2>
                <p className="text-slate-500 mt-1">
                    Welcome to your Nyekusa platform dashboard. Here is your current membership overview.
                </p>
            </div>

            {/* Grid Quick Info Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Metric 1: Course & Academic Profile */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-slate-500">Academic Profile</p>
                        <GraduationCap className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-slate-900">{mockUser.course}</div>
                        <p className="text-xs text-slate-500 mt-1">Year of Study: <span className="font-semibold text-slate-700">{mockUser.yearOfStudy}</span></p>
                    </div>
                </div>

                {/* Metric 2: M-Pesa Subscription Status */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-slate-500">Registration Fee</p>
                        {mockUser.payment.status === "COMPLETED" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-slate-900">KES {mockUser.payment.amount.toFixed(2)}</div>
                        <p className="text-xs mt-1 flex items-center gap-1">
                            Status:
                            <span className={`font-semibold ${mockUser.payment.status === "COMPLETED" ? "text-emerald-600" : "text-amber-600"}`}>
                {mockUser.payment.status}
              </span>
                            {mockUser.payment.mpesaReceiptCode && ` (${mockUser.payment.mpesaReceiptCode})`}
                        </p>
                    </div>
                </div>

                {/* Metric 3: Verification Check */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <p className="text-sm font-medium text-slate-500">Account Tier</p>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-slate-900">{mockUser.role}</div>
                        <p className="text-xs text-slate-500 mt-1">Official platform permissions active</p>
                    </div>
                </div>
            </div>

            {/* Main Container Content */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Dynamic Action items card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Important Notices</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                            <FileText className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-slate-900">Constitution Available</p>
                                <p className="text-slate-500 text-xs">The latest association guidelines and minutes have been updated under Resources.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                            <Calendar className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-slate-900">Upcoming General Meeting</p>
                                <p className="text-slate-500 text-xs">Check out the events page for location and schedule timings.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile incomplete / complete values callout card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">Platform Value & Engagement</h3>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                            Ensure your social links (LinkedIn, Twitter, and GitHub) are updated on your profile. This allows other members and leaders within the organization to connect with you directly on projects and collaborative tasks.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Link href="/dashboard/profile" className="inline-flex justify-center rounded-lg text-sm font-semibold py-2.5 px-4 bg-emerald-800 text-white hover:bg-emerald-900 transition-colors w-full sm:w-auto">
                            Edit My Profile Card
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}