"use client";

import React, { useState, useEffect } from "react";
import { 
    GraduationCap, 
    Search, 
    Check, 
    X, 
    Loader2, 
    Calendar,
    Save,
    UserCheck,
    UserX
} from "lucide-react";
import { toast } from "sonner";

interface Member {
    id: string;
    full_name: string;
    email: string;
    course: string;
    is_alumni: boolean;
    admission_year: number | null;
}

export default function AdminAlumniPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [alumniOnly, setAlumniOnly] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [yearsInput, setYearsInput] = useState<Record<string, string>>({});

    const fetchMembers = async () => {
        setLoading(true);
        try {
            // Get all members
            const res = await fetch("/api/members?role=all&limit=150");
            if (!res.ok) throw new Error("Failed to fetch members");
            const data: Member[] = await res.json();
            setMembers(data);
            
            // Initialize years input state
            const yearsMap: Record<string, string> = {};
            data.forEach(m => {
                yearsMap[m.id] = m.admission_year ? String(m.admission_year) : "";
            });
            setYearsInput(yearsMap);
        } catch (error) {
            console.error(error);
            toast.error("Could not load member directory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const toggleAlumniStatus = async (id: string, currentStatus: boolean) => {
        setSavingId(id);
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_alumni: !currentStatus }),
            });
            if (!res.ok) throw new Error("Failed to update alumni status");
            
            toast.success(`Alumni status ${!currentStatus ? "enabled" : "disabled"}`);
            setMembers(members.map(m => m.id === id ? { ...m, is_alumni: !currentStatus } : m));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setSavingId(null);
        }
    };

    const saveAdmissionYear = async (id: string) => {
        const yearStr = yearsInput[id];
        const yearInt = yearStr ? parseInt(yearStr, 10) : null;
        
        if (yearStr && (isNaN(yearInt as number) || (yearInt as number) < 1990 || (yearInt as number) > new Date().getFullYear() + 5)) {
            toast.error("Please enter a valid admission year (e.g. 2018).");
            return;
        }

        setSavingId(id);
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ admission_year: yearInt }),
            });
            if (!res.ok) throw new Error("Failed to update admission year");
            
            toast.success("Admission year saved");
            setMembers(members.map(m => m.id === id ? { ...m, admission_year: yearInt } : m));
        } catch (error) {
            console.error(error);
            toast.error("Failed to save admission year");
        } finally {
            setSavingId(null);
        }
    };

    const handleYearChange = (id: string, val: string) => {
        setYearsInput(prev => ({ ...prev, [id]: val }));
    };

    // Filter logic
    const filteredMembers = members.filter(m => {
        const matchSearch = m.full_name.toLowerCase().includes(search.toLowerCase()) || 
                            m.email.toLowerCase().includes(search.toLowerCase()) ||
                            m.course.toLowerCase().includes(search.toLowerCase());
        
        if (alumniOnly) {
            return matchSearch && m.is_alumni;
        }
        return matchSearch;
    });

    const totalAlumniCount = members.filter(m => m.is_alumni).length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-950 bg-clip-text text-transparent">
                        Alumni Directory & Records
                    </h2>
                    <p className="text-slate-500 mt-1">Graduate active members to alumni status, set their matriculation years, and manage the official alumni register.</p>
                </div>
            </div>

            {/* Metric / Filter Info */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Graduated Alumni</p>
                        <GraduationCap className="h-5 w-5 text-emerald-800" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-950">{totalAlumniCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Total database records with isAlumni flag</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-700" />
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or course..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-450"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={alumniOnly}
                            onChange={(e) => setAlumniOnly(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-500 h-4 w-4"
                        />
                        Show Alumni Only
                    </label>
                </div>
            </div>

            {/* Members List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Academic Course</th>
                                <th className="px-6 py-4">Admission Year</th>
                                <th className="px-6 py-4 text-center">Alumni Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                                            <span>Loading directory...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-400">
                                        No members matching current filters found.
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-slate-900 leading-none">{m.full_name}</p>
                                                <p className="text-xs text-slate-400 mt-1">{m.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{m.course}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 max-w-[150px]">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                <input
                                                    type="number"
                                                    value={yearsInput[m.id] ?? ""}
                                                    onChange={(e) => handleYearChange(m.id, e.target.value)}
                                                    placeholder="e.g. 2018"
                                                    className="w-full rounded bg-slate-50 border border-slate-200 px-2 py-1 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleAlumniStatus(m.id, m.is_alumni)}
                                                disabled={savingId === m.id}
                                                className={`mx-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset transition-all disabled:opacity-50 ${
                                                    m.is_alumni
                                                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                                                        : "bg-slate-50 text-slate-500 ring-slate-500/20"
                                                }`}
                                            >
                                                {m.is_alumni ? (
                                                    <>
                                                        <UserCheck className="h-3.5 w-3.5" />
                                                        Alumni
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserX className="h-3.5 w-3.5" />
                                                        Student
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => saveAdmissionYear(m.id)}
                                                disabled={savingId === m.id || String(m.admission_year || "") === yearsInput[m.id]}
                                                className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-emerald-800 hover:text-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition-all disabled:opacity-40 disabled:hover:bg-slate-100 disabled:hover:text-slate-700"
                                                title="Save admission year"
                                            >
                                                {savingId === m.id ? (
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Save className="h-3 w-3" />
                                                )}
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
