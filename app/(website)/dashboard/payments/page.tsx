"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Calendar,
    Phone,
    Coins,
    Clock,
    RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Payment = {
    id: string;
    amount: number;
    status: "PENDING" | "COMPLETED" | "FAILED";
    checkoutRequestID: string;
    mpesaReceiptCode: string | null;
    purpose: string;
    categoryCode: string | null;
    phoneNumber: string;
    createdAt: string;
};

type UserProfile = {
    phone: string;
    isVerified: boolean;
};

type PaymentCategory = {
    id: string;
    code: string;
    name: string;
    amount: number;
    mandatoryAmount: number;
    isLocked: boolean;
    minAmount: number;
    isActive: boolean;
    deadline?: string | null;
};

const PURPOSE_LABELS: Record<string, string> = {
    MEMBERSHIP: "Registration Fee",
    CHALLENGE_10_BOB: "10 Bob Challenge",
    HIKE: "Hike & Social Event",
    CHARITY: "Charity & Outreach",
    OTHER: "Other Contribution",
};

export default function PaymentsPage() {
    const { data: session } = useSession();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [categories, setCategories] = useState<PaymentCategory[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [phoneNumber, setPhoneNumber] = useState("");
    const [amount, setAmount] = useState("50");
    const [purpose, setPurpose] = useState("MEMBERSHIP");
    const [isInitiating, setIsInitiating] = useState(false);

    // Polling states
    const [activeCheckoutId, setActiveCheckoutId] = useState<string | null>(null);
    const [pollingStatus, setPollingStatus] = useState<"IDLE" | "POLLING" | "SUCCESS" | "FAILED" | "TIMEOUT">("IDLE");
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingCountRef = useRef(0);

    const fetchPaymentsAndProfile = async () => {
        const userId = session?.user?.id;
        if (!userId) return;

        try {
            setError(null);
            const [paymentsRes, profileRes, categoriesRes] = await Promise.all([
                fetch("/api/dashboard/payments"),
                fetch(`/api/members/${userId}`),
                fetch("/api/dashboard/payments/categories")
            ]);

            if (!paymentsRes.ok || !profileRes.ok || !categoriesRes.ok) {
                throw new Error("Failed to load payment history or configurations");
            }

            const paymentsData = await paymentsRes.json();
            const profileData = await profileRes.json();
            const categoriesData = await categoriesRes.json();

            setPayments(paymentsData);
            setCategories(categoriesData);
            setProfile({
                phone: profileData.phone || "",
                isVerified: profileData.is_verified || false
            });

            // Pre-fill phone number if empty
            if (!phoneNumber && profileData.phone) {
                setPhoneNumber(profileData.phone);
            }

            // Set initial category defaults if categories loaded and form not touched
            if (categoriesData.length > 0 && !purpose) {
                const defaultCat = categoriesData.find((c: any) => c.code === "MEMBERSHIP") || categoriesData[0];
                setPurpose(defaultCat.code);
                setAmount(defaultCat.amount.toString());
            }
        } catch (err) {
            console.error("Error loading payments data:", err);
            setError("Could not load your payment history. Please reload the page.");
            toast.error("Could not load payment configurations or history.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchPaymentsAndProfile();
        }
    }, [session?.user?.id]);

    // Handle Purpose Selection Change (automatically update amounts for fixed items)
    const handlePurposeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCode = e.target.value;
        setPurpose(selectedCode);
        const cat = categories.find(c => c.code === selectedCode);
        if (cat) {
            setAmount(cat.amount.toString());
        }
    };

    const handleQuickPay = (catCode: string, remainingAmount: number) => {
        setPurpose(catCode);
        const cat = categories.find(c => c.code === catCode);
        if (cat) {
            const suggestedAmount = Math.max(cat.minAmount, Math.min(remainingAmount, cat.amount));
            setAmount(suggestedAmount.toString());
        }
        const formElement = document.getElementById("contribution-form");
        if (formElement) {
            formElement.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Check if the user has already paid the registration fee
    const hasPaidRegistration = payments.some(
        (p) => (p.categoryCode === "MEMBERSHIP" || p.purpose === "MEMBERSHIP") && p.status === "COMPLETED"
    );

    // Get current category validation parameters
    const activeCategory = categories.find(c => c.code === purpose);
    const isLocked = activeCategory ? activeCategory.isLocked : false;
    const minVal = activeCategory ? activeCategory.minAmount : 1;

    // Start STK Push payment
    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsInitiating(true);
        setPollingStatus("IDLE");

        try {
            // Clean up phone number input
            let cleanPhone = phoneNumber.trim();
            if (cleanPhone.startsWith("+")) cleanPhone = cleanPhone.slice(1);

            const res = await fetch("/api/dashboard/payments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phoneNumber: cleanPhone,
                    amount: parseFloat(amount),
                    purpose,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to trigger payment STK push");
            }

            // Start polling for this checkoutRequestID
            setActiveCheckoutId(data.checkoutRequestId);
            setPollingStatus("POLLING");
            pollingCountRef.current = 0;

            // Clear any existing polling interval
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

            // Start polling status API every 3 seconds
            pollingIntervalRef.current = setInterval(() => {
                pollPaymentStatus(data.checkoutRequestId);
            }, 3000);

        } catch (err) {
            console.error("Error initiating payment:", err);
            const msg = err instanceof Error ? err.message : "M-Pesa STK Push request failed.";
            setError(msg);
            toast.error(msg);
            setIsInitiating(false);
        }
    };

    // Poll the backend payment status
    const pollPaymentStatus = async (checkoutRequestId: string) => {
        pollingCountRef.current += 1;

        try {
            const res = await fetch(`/api/v1/payments/status?checkoutRequestId=${checkoutRequestId}`);
            if (!res.ok) {
                throw new Error("Failed to query payment status");
            }

            const data = await res.json();
            
            if (data.status === "COMPLETED") {
                clearInterval(pollingIntervalRef.current!);
                setPollingStatus("SUCCESS");
                setIsInitiating(false);
                toast.success("Payment completed and verified successfully!");
                fetchPaymentsAndProfile(); // Refresh table and status
            } else if (data.status === "FAILED") {
                clearInterval(pollingIntervalRef.current!);
                setPollingStatus("FAILED");
                setIsInitiating(false);
                toast.error("M-Pesa transaction was cancelled or failed.");
                fetchPaymentsAndProfile(); // Refresh table
            } else if (pollingCountRef.current > 20) {
                // Timeout after 60 seconds (20 polls * 3s)
                clearInterval(pollingIntervalRef.current!);
                setPollingStatus("TIMEOUT");
                setIsInitiating(false);
                toast.warning("Verification timed out. Check your transaction logs shortly.");
                fetchPaymentsAndProfile(); // Refresh table
            }
        } catch (err) {
            console.error("Error polling payment status:", err);
            // Don't stop immediately on a transient fetch error, just wait for next tick
            if (pollingCountRef.current > 20) {
                clearInterval(pollingIntervalRef.current!);
                setPollingStatus("TIMEOUT");
                setIsInitiating(false);
            }
        }
    };

    // Clean up polling interval on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, []);

    // Format Date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getCategoryName = (code: string) => {
        const cat = categories.find(c => c.code === code);
        return cat ? cat.name : (PURPOSE_LABELS[code] || code);
    };

    if (isLoading || !session?.user?.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                <p className="text-sm text-slate-500 font-medium">Loading payments history...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Payments & Fees</h2>
                    <p className="text-slate-500 mt-1">
                        Pay association fees, contribute to challenges, and check your transaction history.
                    </p>
                </div>
                <Button 
                    onClick={fetchPaymentsAndProfile} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1.5 self-start md:self-center"
                >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh Ledger
                </Button>
            </div>

            {/* Registration Alert Status */}
            <div>
                {hasPaidRegistration ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <div>
                            <span className="font-semibold">Membership Registration Paid:</span> Your registration fee has been confirmed. Thank you for activating your official account card.
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                        <div>
                            <span className="font-semibold">Membership Registration Pending:</span> You must pay the KES 50.00 registration fee to unlock all official platform features and public directories.
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800 border border-red-200">
                    <AlertCircle size={18} className="text-red-600 shrink-0" />
                    {error}
                </div>
            )}

            {/* Payment Progress Tracker (Installments/Bits Tracker) */}
            {categories.filter(c => c.isActive && c.mandatoryAmount > 0).length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-emerald-800" />
                            Installment & Progress Tracker
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">
                            Track your payments for specific events, hikes, or dues. You can pay in custom installment amounts before each deadline.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {categories
                            .filter(c => c.isActive && c.mandatoryAmount > 0)
                            .map((cat) => {
                                const totalPaid = payments
                                    .filter(p => (p.categoryCode === cat.code || (cat.code === "MEMBERSHIP" && p.purpose === "MEMBERSHIP")) && p.status === "COMPLETED")
                                    .reduce((sum, p) => sum + p.amount, 0);
                                
                                const remaining = Math.max(0, cat.mandatoryAmount - totalPaid);
                                const progressPct = Math.min(100, (totalPaid / cat.mandatoryAmount) * 100);
                                const isCompleted = totalPaid >= cat.mandatoryAmount;
                                const isExpired = cat.deadline ? new Date() > new Date(cat.deadline) : false;

                                let statusLabel = "Not Started";
                                let statusColor = "bg-slate-100 text-slate-700";

                                if (isCompleted) {
                                    statusLabel = "Completed";
                                    statusColor = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                                } else if (totalPaid > 0) {
                                    if (isExpired) {
                                        statusLabel = "Incomplete (Expired)";
                                        statusColor = "bg-red-50 text-red-700 border border-red-200";
                                    } else {
                                        statusLabel = "In Progress";
                                        statusColor = "bg-amber-50 text-amber-700 border border-amber-200";
                                    }
                                } else if (isExpired) {
                                    statusLabel = "Expired";
                                    statusColor = "bg-red-50 text-red-700 border border-red-200";
                                }

                                return (
                                    <div key={cat.id} className="border border-slate-150 rounded-xl p-5 bg-slate-50/30 space-y-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm leading-tight">{cat.name}</h4>
                                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{cat.code}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
                                                {statusLabel}
                                            </span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-semibold text-slate-755">
                                                <span>Progress</span>
                                                <span>{progressPct.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div 
                                                    className="bg-emerald-800 h-2 rounded-full transition-all duration-500" 
                                                    style={{ width: `${progressPct}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                                                <span>Paid: KES {totalPaid.toFixed(0)}</span>
                                                <span>Goal: KES {cat.mandatoryAmount.toFixed(0)}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-100 pt-3">
                                            <div>
                                                <span className="font-semibold">Deadline:</span>{" "}
                                                {cat.deadline ? new Date(cat.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "No Deadline"}
                                            </div>
                                            
                                            {!isCompleted && !isExpired && (
                                                <button
                                                    onClick={() => handleQuickPay(cat.code, remaining)}
                                                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold hover:underline font-semibold"
                                                >
                                                    Pay Installment
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Content Split Layout */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Pay Form Card */}
                <div id="contribution-form" className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-fit space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Coins className="h-5 w-5 text-emerald-800" />
                            Send Contribution
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">
                            Contribute fees securely using Safaricom M-Pesa STK Push.
                        </p>
                    </div>

                    <form onSubmit={handlePaySubmit} className="space-y-4">
                        {/* Select Purpose */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Contribution Purpose</label>
                            <select
                                value={purpose}
                                onChange={handlePurposeChange}
                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-emerald-800 bg-white"
                                required
                            >
                                {categories.map((cat) => {
                                    const isReg = cat.code === "MEMBERSHIP";
                                    return (
                                        <option 
                                            key={cat.id} 
                                            value={cat.code} 
                                            disabled={isReg && hasPaidRegistration}
                                        >
                                            {cat.name} {isReg && hasPaidRegistration ? "(Already Paid)" : ""}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">Amount (KES)</label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={minVal}
                                disabled={isLocked}
                                className="w-full"
                                required
                            />
                            {isLocked ? (
                                <p className="text-[10px] text-slate-400 italic">
                                    Amount is locked for this contribution category.
                                </p>
                            ) : (
                                <p className="text-[10px] text-slate-400 italic">
                                    Minimum amount required is KES {minVal.toFixed(2)}.
                                </p>
                            )}
                        </div>

                        {/* Phone number */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">M-Pesa Mobile Number</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                    +
                                </span>
                                <Input
                                    type="text"
                                    placeholder="254712345678"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="pl-6 w-full"
                                    required
                                />
                            </div>
                            <p className="text-[10px] text-slate-400">
                                Enter format: 254XXXXXXXXX (or 07XXXXXXXX)
                            </p>
                        </div>

                        {/* Pay Button */}
                        <Button
                            type="submit"
                            disabled={isInitiating}
                            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-semibold flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors"
                        >
                            {isInitiating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Pushing STK...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4" />
                                    Pay with M-Pesa
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Ledger & History Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-emerald-800" />
                            Transaction History
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">
                            Real-time confirmation of your payments logged on the ledger.
                        </p>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 bg-slate-50/50 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                    <th className="px-4 py-3 font-semibold">Description</th>
                                    <th className="px-4 py-3 font-semibold">Amount</th>
                                    <th className="px-4 py-3 font-semibold">Receipt Code</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.length > 0 ? (
                                    payments.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                                                {formatDate(p.createdAt)}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-slate-900">
                                                {getCategoryName(p.categoryCode || p.purpose)}
                                            </td>
                                            <td className="px-4 py-3.5 font-semibold text-slate-900">
                                                KES {p.amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-xs text-slate-500">
                                                {p.mpesaReceiptCode || "—"}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    p.status === "COMPLETED" 
                                                        ? "bg-emerald-50 text-emerald-700" 
                                                        : p.status === "PENDING"
                                                        ? "bg-amber-50 text-amber-700"
                                                        : "bg-red-50 text-red-700"
                                                }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-slate-400 text-xs italic">
                                            No payment records found on the ledger.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Polling overlay loader modal */}
            {isInitiating && pollingStatus === "POLLING" && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 text-center space-y-6 shadow-xl border border-slate-100 animate-scale-up">
                        <div className="relative mx-auto h-16 w-16 flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-emerald-800 animate-spin absolute" />
                            <Phone className="h-5 w-5 text-emerald-800" />
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-slate-900">Pushing M-Pesa STK Dialog</h4>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                Please check your mobile phone for an M-Pesa STK Push dialog box. Enter your M-Pesa PIN to authorize the payment.
                            </p>
                            <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                                <Clock className="h-3 w-3" />
                                Processing contribution...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment success overlay modal */}
            {pollingStatus === "SUCCESS" && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 text-center space-y-6 shadow-xl border border-slate-100 animate-scale-up">
                        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-slate-900">Payment Confirmed!</h4>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                Your contribution has been verified successfully. The funds have been successfully logged to the secure ledger.
                            </p>
                        </div>

                        <Button 
                            onClick={() => setPollingStatus("IDLE")} 
                            className="bg-emerald-800 hover:bg-emerald-950 text-white w-full py-2 rounded-lg font-semibold"
                        >
                            Return to Ledger
                        </Button>
                    </div>
                </div>
            )}

            {/* Payment failed overlay modal */}
            {(pollingStatus === "FAILED" || pollingStatus === "TIMEOUT") && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 text-center space-y-6 shadow-xl border border-slate-100 animate-scale-up">
                        <div className="mx-auto h-16 w-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-slate-900">
                                {pollingStatus === "TIMEOUT" ? "Verification Timeout" : "Payment Cancelled"}
                            </h4>
                            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                {pollingStatus === "TIMEOUT" 
                                    ? "We could not verify your payment callback in time. If you entered your PIN, please refresh the page in a moment to sync your ledger."
                                    : "The transaction request was cancelled, declined, or failed. Please check your phone settings or credentials and try again."}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button 
                                onClick={() => setPollingStatus("IDLE")} 
                                variant="outline"
                                className="flex-1 py-2 rounded-lg font-semibold"
                            >
                                Close
                            </Button>
                            <Button 
                                onClick={fetchPaymentsAndProfile} 
                                className="bg-emerald-800 hover:bg-emerald-950 text-white flex-1 py-2 rounded-lg font-semibold"
                            >
                                Sync Status
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
