"use client";

import React, { useState, useEffect } from "react";
import { 
    Users, 
    Search, 
    UserCheck, 
    UserX, 
    ShieldAlert, 
    Trash2, 
    Filter, 
    Check, 
    X, 
    UserCheck2,
    Loader2
} from "lucide-react";
import { toast } from "sonner";

interface Member {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    course: string;
    year_of_study: string;
    role: string;
    is_verified: boolean;
    status: string;
    created_at: string;
}

export default function AdminUsersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [actionId, setActionId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                role: roleFilter,
                limit: "150",
            });
            if (search.trim()) {
                queryParams.append("search", search);
            }
            const res = await fetch(`/api/members?${queryParams.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setMembers(data);
        } catch (error) {
            console.error(error);
            toast.error("Could not load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const toggleVerification = async (id: string, currentStatus: boolean) => {
        setActionId(id);
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_verified: !currentStatus }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            
            toast.success(`User verification ${!currentStatus ? "enabled" : "disabled"}`);
            setMembers(members.map(m => m.id === id ? { ...m, is_verified: !currentStatus, status: !currentStatus ? "ACTIVE" : "INACTIVE" } : m));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        } finally {
            setActionId(null);
        }
    };

    const changeRole = async (id: string, newRole: string) => {
        setActionId(id);
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) throw new Error("Failed to update role");
            
            toast.success(`User role updated to ${newRole}`);
            setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m));
        } catch (error) {
            console.error(error);
            toast.error("Failed to change user role");
        } finally {
            setActionId(null);
        }
    };

    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}? This action is irreversible.`)) return;
        setActionId(id);
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete user");
            
            toast.success(`${name} has been deleted`);
            setMembers(members.filter(m => m.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete user");
        } finally {
            setActionId(null);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .slice(0, 2)
            .map(n => n[0])
            .join("")
            .toUpperCase() || "?";
    };

    // Calculate metrics
    const totalCount = members.length;
    const verifiedCount = members.filter(m => m.is_verified).length;
    const unverifiedCount = totalCount - verifiedCount;
    const adminLeaderCount = members.filter(m => m.role === "ADMIN" || m.role === "LEADER").length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-950 bg-clip-text text-transparent">
                        User Directory & Access Control
                    </h2>
                    <p className="text-slate-500 mt-1">Manage system user roles, toggles for verification status, and membership actions.</p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Total Users Listed</p>
                        <Users className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-950">{totalCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Under current filters</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-700" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Verified Members</p>
                        <UserCheck className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-emerald-700">{verifiedCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Approved to access hub</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Unverified Users</p>
                        <UserX className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-amber-600">{unverifiedCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Require admin review</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Admins & Leaders</p>
                        <ShieldAlert className="h-5 w-5 text-slate-700" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-800">{adminLeaderCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Privileged accounts</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800" />
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or course..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-450"
                    />
                    <button type="submit" className="hidden" />
                </form>

                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Role Filter:</span>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="text-sm border border-slate-200 rounded-lg bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700"
                    >
                        <option value="ALL">All Roles</option>
                        <option value="USER">User</option>
                        <option value="MEMBER">Member</option>
                        <option value="LEADER">Leader</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Academic Details</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-center">Verified</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                                            <span>Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-slate-400">
                                        No users found. Try adjusting search query or filter.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* User profile */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-100/50 shrink-0">
                                                    {getInitials(member.full_name)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 leading-none">{member.full_name}</p>
                                                    <p className="text-xs text-slate-400 mt-1">ID: {member.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-800">{member.email}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{member.phone}</p>
                                            </div>
                                        </td>

                                        {/* Academic details */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-800 truncate max-w-[200px]" title={member.course}>{member.course}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Year: {member.year_of_study}</p>
                                            </div>
                                        </td>

                                        {/* Role selector */}
                                        <td className="px-6 py-4">
                                            <select
                                                value={member.role}
                                                onChange={(e) => changeRole(member.id, e.target.value)}
                                                disabled={actionId === member.id}
                                                className="text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 border-none px-2 py-1 focus:ring-2 focus:ring-emerald-500/20 text-slate-700 cursor-pointer disabled:opacity-50"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="MEMBER">MEMBER</option>
                                                <option value="LEADER">LEADER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </td>

                                        {/* Verification toggle button */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleVerification(member.id, member.is_verified)}
                                                disabled={actionId === member.id}
                                                className={`mx-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                                                    member.is_verified
                                                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-600/10"
                                                        : "bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-amber-600/10"
                                                }`}
                                            >
                                                {member.is_verified ? (
                                                    <>
                                                        <Check className="h-3 w-3" />
                                                        Verified
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="h-3 w-3" />
                                                        Pending
                                                    </>
                                                )}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteUser(member.id, member.full_name)}
                                                disabled={actionId === member.id}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                title="Delete user"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
