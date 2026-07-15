"use client";

import React, { useState, useEffect } from "react";
import { 
    CreditCard, 
    Plus, 
    Trash2, 
    X, 
    Loader2, 
    Search, 
    Check, 
    XCircle, 
    Clock, 
    Filter,
    DollarSign,
    Settings,
    Edit2
} from "lucide-react";
import { toast } from "sonner";

interface Payment {
    id: string;
    userId: string;
    amount: number;
    status: "PENDING" | "COMPLETED" | "FAILED";
    purpose: string;
    categoryCode: string | null;
    phoneNumber: string;
    checkoutRequestID: string;
    mpesaReceiptCode: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
}

interface Member {
    id: string;
    full_name: string;
    email: string;
    phone: string;
}

interface PaymentCategory {
    id: string;
    code: string;
    name: string;
    amount: number;
    isLocked: boolean;
    minAmount: number;
    isActive: boolean;
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [categories, setCategories] = useState<PaymentCategory[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Tab State
    const [activeTab, setActiveTab] = useState<"LEDGER" | "CATEGORIES">("LEDGER");

    // Payment Form Modals/Inputs
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [amount, setAmount] = useState("50");
    const [purpose, setPurpose] = useState("MEMBERSHIP");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [status, setStatus] = useState("COMPLETED");
    const [receiptCode, setReceiptCode] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    
    // Category Form Modals/Inputs
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<PaymentCategory | null>(null);
    const [catCode, setCatCode] = useState("");
    const [catName, setCatName] = useState("");
    const [catAmount, setCatAmount] = useState("0");
    const [catIsLocked, setCatIsLocked] = useState(false);
    const [catMinAmount, setCatMinAmount] = useState("0");
    const [catIsActive, setCatIsActive] = useState(true);
    const [catSubmitting, setCatSubmitting] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [purposeFilter, setPurposeFilter] = useState("ALL");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsRes, membersRes, categoriesRes] = await Promise.all([
                fetch("/api/admin/payments?limit=150"),
                fetch("/api/members?role=all&limit=150"),
                fetch("/api/admin/payments/categories")
            ]);
            
            if (!paymentsRes.ok || !membersRes.ok || !categoriesRes.ok) throw new Error("Failed to load ledger data");
            
            const paymentsData = await paymentsRes.json();
            const membersData = await membersRes.json();
            const categoriesData = await categoriesRes.json();
            
            setPayments(paymentsData);
            setMembers(membersData);
            setCategories(categoriesData);
        } catch (error) {
            console.error(error);
            toast.error("Could not load payment records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openRecordModal = () => {
        setSelectedUserId("");
        setAmount("50");
        setPurpose("MEMBERSHIP");
        setPhoneNumber("");
        setStatus("COMPLETED");
        setReceiptCode("");
        setMemberSearch("");
        setIsModalOpen(true);
    };

    const openCatModal = (category: PaymentCategory | null = null) => {
        setEditingCategory(category);
        if (category) {
            setCatCode(category.code);
            setCatName(category.name);
            setCatAmount(category.amount.toString());
            setCatIsLocked(category.isLocked);
            setCatMinAmount(category.minAmount.toString());
            setCatIsActive(category.isActive);
        } else {
            setCatCode("");
            setCatName("");
            setCatAmount("100");
            setCatIsLocked(false);
            setCatMinAmount("10");
            setCatIsActive(true);
        }
        setIsCatModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedUserId) {
            toast.error("Please select a member to associate this payment.");
            return;
        }
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount greater than zero.");
            return;
        }
        if (!phoneNumber.trim()) {
            toast.error("Please enter the payment phone number.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                userId: selectedUserId,
                amount: parseFloat(amount),
                purpose,
                phoneNumber: phoneNumber.trim(),
                status,
                mpesaReceiptCode: receiptCode.trim() || null,
            };

            const res = await fetch("/api/admin/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to record payment");
            
            toast.success("Payment recorded successfully");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to record manual payment.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!catCode.trim() || !catName.trim()) {
            toast.error("Please specify Code and Name.");
            return;
        }

        setCatSubmitting(true);
        try {
            const payload = {
                code: catCode.trim().toUpperCase(),
                name: catName.trim(),
                amount: parseFloat(catAmount),
                isLocked: catIsLocked,
                minAmount: parseFloat(catMinAmount || "0"),
                isActive: catIsActive
            };

            let res;
            if (editingCategory) {
                res = await fetch(`/api/admin/payments/categories/${editingCategory.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch("/api/admin/payments/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }

            if (!res.ok) throw new Error("Failed to save payment category");

            toast.success(editingCategory ? "Category updated successfully!" : "Category created successfully!");
            setIsCatModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save category config.");
        } finally {
            setCatSubmitting(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        setActionId(id);
        try {
            const res = await fetch(`/api/admin/payments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            
            toast.success(`Payment status updated to ${newStatus}`);
            setPayments(payments.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this payment record? This will alter financial totals.")) return;
        try {
            const res = await fetch(`/api/admin/payments/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete payment");
            toast.success("Payment record deleted");
            setPayments(payments.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete payment record");
        }
    };

    const handleCatDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete payment category "${name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/payments/categories/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete category");
            toast.success("Category deleted successfully");
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete payment category.");
        }
    };

    const filteredPayments = payments.filter(p => {
        const pCode = p.categoryCode || p.purpose;
        const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
        const matchPurpose = purposeFilter === "ALL" || pCode === purposeFilter;
        return matchStatus && matchPurpose;
    });

    const filteredMembers = members.filter(m => 
        m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase())
    );

    // Metrics calculations (Only count COMPLETED for totals)
    const completedPayments = payments.filter(p => p.status === "COMPLETED");
    const totalCollected = completedPayments.reduce((acc, curr) => acc + curr.amount, 0);
    const pendingCount = payments.filter(p => p.status === "PENDING").length;
    const completedCount = completedPayments.length;
    const failedCount = payments.filter(p => p.status === "FAILED").length;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(val);
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case "COMPLETED": 
                return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
            case "PENDING": 
                return "bg-amber-50 text-amber-700 ring-amber-600/10";
            case "FAILED": 
                return "bg-red-50 text-red-750 ring-red-650/10";
            default: 
                return "bg-slate-50 text-slate-500 ring-slate-500/10";
        }
    };

    const getCategoryName = (code: string) => {
        const cat = categories.find(c => c.code === code);
        return cat ? cat.name : code;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-950 bg-clip-text text-transparent">
                        Financial Ledger & M-Pesa Logs
                    </h2>
                    <p className="text-slate-500 mt-1">Review STK pushes, configure payment amounts, and record offline cash payments manually.</p>
                </div>
                <div className="flex gap-2">
                    {activeTab === "LEDGER" ? (
                        <button
                            onClick={openRecordModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Record Payment
                        </button>
                    ) : (
                        <button
                            onClick={() => openCatModal(null)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            New Category
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab("LEDGER")}
                        className={`pb-4 text-sm font-bold border-b-2 transition-all ${
                            activeTab === "LEDGER"
                                ? "border-emerald-800 text-emerald-800"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Ledger Entries
                    </button>
                    <button
                        onClick={() => setActiveTab("CATEGORIES")}
                        className={`pb-4 text-sm font-bold border-b-2 transition-all ${
                            activeTab === "CATEGORIES"
                                ? "border-emerald-800 text-emerald-800"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Configure Payment Types
                    </button>
                </nav>
            </div>

            {/* Tab: LEDGER ENTRIES */}
            {activeTab === "LEDGER" && (
                <>
                    {/* Metrics */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between pb-2">
                                <p className="text-sm font-semibold text-slate-500">Collected Income</p>
                                <DollarSign className="h-5 w-5 text-emerald-800" />
                            </div>
                            <div className="mt-2">
                                <div className="text-2xl font-bold text-slate-950">{formatCurrency(totalCollected)}</div>
                                <p className="text-xs text-slate-500 mt-1">Completed status only</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-700" />
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between pb-2">
                                <p className="text-sm font-semibold text-slate-500">Completed Payments</p>
                                <Check className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="mt-2">
                                <div className="text-3xl font-bold text-emerald-700">{completedCount}</div>
                                <p className="text-xs text-slate-500 mt-1">Successful transactions</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600" />
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between pb-2">
                                <p className="text-sm font-semibold text-slate-500">Pending Approvals</p>
                                <Clock className="h-5 w-5 text-amber-500" />
                            </div>
                            <div className="mt-2">
                                <div className="text-3xl font-bold text-amber-600">{pendingCount}</div>
                                <p className="text-xs text-slate-500 mt-1">STK push or review</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between pb-2">
                                <p className="text-sm font-semibold text-slate-500">Failed STK Push</p>
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="mt-2">
                                <div className="text-3xl font-bold text-red-650">{failedCount}</div>
                                <p className="text-xs text-slate-500 mt-1">Declined or timed out</p>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-650" />
                        </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-start items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                        <div className="flex items-center gap-2 pr-4">
                            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-sm border border-slate-200 rounded-lg bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-700"
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="PENDING">PENDING</option>
                                <option value="FAILED">FAILED</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 pl-0 sm:pl-4 pt-3 sm:pt-0">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Purpose:</span>
                            <select
                                value={purposeFilter}
                                onChange={(e) => setPurposeFilter(e.target.value)}
                                className="text-sm border border-slate-200 rounded-lg bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-700"
                            >
                                <option value="ALL">All Purposes</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.code}>{c.code}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* List Table */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                            <span className="mt-2 text-sm">Loading financial ledger...</span>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
                            <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-850">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-slate-800">No Payments Recorded</h3>
                                <p className="text-slate-500 text-sm max-w-sm">
                                    No transactions meet the current criteria or filters.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="px-6 py-4">Payer Member</th>
                                            <th className="px-6 py-4">Payment Info</th>
                                            <th className="px-6 py-4">Purpose</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                                        {filteredPayments.map((p) => (
                                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    {p.user ? (
                                                        <div>
                                                            <p className="font-semibold text-slate-900 leading-none">{p.user.name}</p>
                                                            <p className="text-xs text-slate-400 mt-1">{p.user.email}</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-slate-400 italic">Unknown Member ({p.userId})</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-mono text-xs text-slate-700">Receipt: <span className="font-bold">{p.mpesaReceiptCode || "Offline/Manual"}</span></p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">Phone: {p.phoneNumber}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                                                        {getCategoryName(p.categoryCode || p.purpose)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-900">
                                                    {formatCurrency(p.amount)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={p.status}
                                                        onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                                        disabled={actionId === p.id}
                                                        className={`text-xs font-bold rounded-lg border-none px-2 py-1 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer disabled:opacity-50 ring-1 ring-inset ${getStatusBadge(p.status)}`}
                                                    >
                                                        <option value="COMPLETED">COMPLETED</option>
                                                        <option value="PENDING">PENDING</option>
                                                        <option value="FAILED">FAILED</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete ledger record"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Tab: CONFIGURE PAYMENT TYPES */}
            {activeTab === "CATEGORIES" && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                            <Settings className="h-5 w-5 text-emerald-800" />
                            Payment Category Setup
                        </h3>
                        <p className="text-slate-500 text-xs mb-4">
                            Define locked or variable contribution fees (e.g., membership dues, social tickets, hike charges) displayed in user payment options.
                        </p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-3.5">Code</th>
                                        <th className="px-6 py-3.5">Name</th>
                                        <th className="px-6 py-3.5">Default Amount</th>
                                        <th className="px-6 py-3.5">Behavior</th>
                                        <th className="px-6 py-3.5">Min Required</th>
                                        <th className="px-6 py-3.5">Active</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-650">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-900">
                                                {cat.code}
                                            </td>
                                            <td className="px-6 py-3.5 font-semibold text-slate-800">
                                                {cat.name}
                                            </td>
                                            <td className="px-6 py-3.5 font-semibold text-slate-900">
                                                {formatCurrency(cat.amount)}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    cat.isLocked 
                                                        ? "bg-amber-50 text-amber-700" 
                                                        : "bg-emerald-50 text-emerald-700"
                                                }`}>
                                                    {cat.isLocked ? "Locked (Fixed)" : "Open (Custom)"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5">
                                                {cat.isLocked ? "—" : formatCurrency(cat.minAmount)}
                                            </td>
                                            <td className="px-6 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    cat.isActive 
                                                        ? "bg-emerald-100 text-emerald-800" 
                                                        : "bg-slate-100 text-slate-650"
                                                }`}>
                                                    {cat.isActive ? "Yes" : "No"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openCatModal(cat)}
                                                        className="p-1 text-slate-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all"
                                                        title="Edit configuration"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCatDelete(cat.id, cat.name)}
                                                        className="p-1 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete category"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Record Manual Payment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                Record Manual / Offline Payment
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Member Search / Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Select Payer Member *</label>
                                
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search members by name or email..."
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                {/* dropdown results */}
                                {memberSearch.trim() && (
                                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-100 shadow-inner">
                                        {filteredMembers.length === 0 ? (
                                            <p className="p-3 text-xs text-slate-400 text-center">No matching members found.</p>
                                        ) : (
                                            filteredMembers.map(m => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedUserId(m.id);
                                                        setPhoneNumber(m.phone);
                                                        setMemberSearch(m.full_name);
                                                    }}
                                                    className={`w-full flex items-center justify-between p-2.5 text-left text-xs hover:bg-emerald-50 transition-colors ${
                                                        selectedUserId === m.id ? "bg-emerald-50/70 font-semibold text-emerald-900" : "text-slate-750"
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{m.full_name}</p>
                                                        <p className="text-[10px] text-slate-455 font-normal">{m.email}</p>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400">{m.phone}</span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Amount (KES) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="e.g. 50"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-900"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Purpose *</label>
                                    <select
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Payer Phone Line *</label>
                                    <input
                                        type="text"
                                        required
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="e.g. 0712345678"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">M-Pesa Receipt Code (Optional)</label>
                                    <input
                                        type="text"
                                        value={receiptCode}
                                        onChange={(e) => setReceiptCode(e.target.value)}
                                        placeholder="e.g. SH34HJ89DF"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Payment Status *</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                                >
                                    <option value="COMPLETED">COMPLETED (Paid)</option>
                                    <option value="PENDING">PENDING (In Progress)</option>
                                    <option value="FAILED">FAILED (Cancelled)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-lg border border-slate-250 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 transition-all disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Record Ledger"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create/Edit Category Modal */}
            {isCatModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingCategory ? `Edit Category: ${editingCategory.code}` : "Create Payment Category"}
                            </h3>
                            <button
                                onClick={() => setIsCatModalOpen(false)}
                                className="p-1 rounded-lg text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCatSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Category Code *</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!editingCategory}
                                    value={catCode}
                                    onChange={(e) => setCatCode(e.target.value)}
                                    placeholder="e.g. REGISTRATION, TRIP_2026"
                                    className="w-full rounded-lg border border-slate-205 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase font-mono disabled:bg-slate-50 disabled:text-slate-500"
                                />
                                {!editingCategory && (
                                    <p className="text-[10px] text-slate-400">
                                        Unique identifier (capital letters, digits, and underscores only).
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Display Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                    placeholder="e.g. Annual Retreat Card"
                                    className="w-full rounded-lg border border-slate-205 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Default Amount *</label>
                                    <input
                                        type="number"
                                        required
                                        value={catAmount}
                                        onChange={(e) => setCatAmount(e.target.value)}
                                        min="0"
                                        placeholder="0"
                                        className="w-full rounded-lg border border-slate-205 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Min Open Amount</label>
                                    <input
                                        type="number"
                                        value={catMinAmount}
                                        onChange={(e) => setCatMinAmount(e.target.value)}
                                        min="0"
                                        disabled={catIsLocked}
                                        placeholder="0"
                                        className="w-full rounded-lg border border-slate-205 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold disabled:bg-slate-50 disabled:text-slate-400"
                                    />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="flex flex-col gap-2 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={catIsLocked}
                                        onChange={(e) => setCatIsLocked(e.target.checked)}
                                        className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-700">Lock Payment Amount</span>
                                        <p className="text-[10px] text-slate-400 font-normal leading-tight">If checked, members can only pay the exact default amount. If unchecked, custom amounts are permitted.</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer pt-2">
                                    <input
                                        type="checkbox"
                                        checked={catIsActive}
                                        onChange={(e) => setCatIsActive(e.target.checked)}
                                        className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-700">Active Category</span>
                                        <p className="text-[10px] text-slate-400 font-normal leading-tight">Disable to hide this category option from user contribution forms.</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCatModalOpen(false)}
                                    className="rounded-lg border border-slate-250 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={catSubmitting}
                                    className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 transition-all disabled:opacity-50"
                                >
                                    {catSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Config"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
