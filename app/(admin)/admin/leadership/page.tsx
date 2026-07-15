"use client";

import React, { useState, useEffect } from "react";
import { 
    Award, 
    Plus, 
    Trash2, 
    Edit3, 
    X, 
    Loader2, 
    User, 
    Search,
    ChevronUp,
    ChevronDown
} from "lucide-react";
import { toast } from "sonner";

interface Leader {
    id: string;
    userId: string;
    full_name: string;
    position: string;
    bio: string;
    term_year: string;
    photo_url: string;
    order: number;
    email: string;
    linkedin_url: string;
    twitter_url: string;
}

interface Member {
    id: string;
    full_name: string;
    email: string;
    role: string;
}

export default function AdminLeadershipPage() {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLeader, setEditingLeader] = useState<Leader | null>(null);

    // Form inputs
    const [selectedUserId, setSelectedUserId] = useState("");
    const [title, setTitle] = useState("");
    const [term, setTerm] = useState("2025/2026");
    const [bio, setBio] = useState("");
    const [priority, setPriority] = useState("0");
    const [submitting, setSubmitting] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leadersRes, membersRes] = await Promise.all([
                fetch("/api/leadership?limit=100"),
                fetch("/api/members?role=all&limit=150")
            ]);
            
            if (!leadersRes.ok || !membersRes.ok) throw new Error("Failed to fetch page data");
            
            const leadersData = await leadersRes.json();
            const membersData = await membersRes.json();
            
            setLeaders(leadersData);
            setMembers(membersData);
        } catch (error) {
            console.error(error);
            toast.error("Could not load leadership data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openCreateModal = () => {
        setEditingLeader(null);
        setSelectedUserId("");
        setTitle("");
        setTerm("2025/2026");
        setBio("");
        setPriority("0");
        setMemberSearch("");
        setIsModalOpen(true);
    };

    const openEditModal = (leader: Leader) => {
        setEditingLeader(leader);
        setSelectedUserId(leader.userId);
        setTitle(leader.position);
        setTerm(leader.term_year);
        setBio(leader.bio);
        setPriority(String(leader.order));
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingLeader && !selectedUserId) {
            toast.error("Please select a member to assign as leader.");
            return;
        }
        if (!title.trim() || !term.trim()) {
            toast.error("Please fill in the title and term fields.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                userId: selectedUserId,
                title: title.trim(),
                term: term.trim(),
                bio: bio.trim() || null,
                priority: parseInt(priority) || 0,
            };

            let res;
            if (editingLeader) {
                res = await fetch(`/api/leadership/${editingLeader.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: payload.title,
                        term: payload.term,
                        bio: payload.bio,
                        priority: payload.priority,
                    }),
                });
            } else {
                res = await fetch("/api/leadership", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to save leadership record");
            }

            toast.success(editingLeader ? "Leadership entry updated!" : "Leader assigned successfully!");
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "An error occurred while saving.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from leadership?`)) return;
        try {
            const res = await fetch(`/api/leadership/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete leadership record");
            toast.success(`${name} removed from leadership`);
            setLeaders(leaders.filter(l => l.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove leader.");
        }
    };

    const filteredMembers = members.filter(m => 
        m.full_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase())
    );

    // Sort leaders by Priority asc, then Term desc
    const sortedLeaders = [...leaders].sort((a, b) => {
        if (a.term_year !== b.term_year) {
            return b.term_year.localeCompare(a.term_year);
        }
        return a.order - b.order;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-950 bg-clip-text text-transparent">
                        Leadership Board & Appointees
                    </h2>
                    <p className="text-slate-500 mt-1">Assign members to roles like President or Treasurer, define hierarchies, and add executive bios.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    Appoint Leader
                </button>
            </div>

            {/* List / Table of leaders */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                    <span className="mt-2 text-sm">Loading leaders...</span>
                </div>
            ) : sortedLeaders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
                    <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-850">
                        <Award className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-800">No Appointed Leaders</h3>
                        <p className="text-slate-500 text-sm max-w-sm">
                            Click "Appoint Leader" to search system members and assign them an official position.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Leader</th>
                                    <th className="px-6 py-4">Position</th>
                                    <th className="px-6 py-4">Term</th>
                                    <th className="px-6 py-4">Priority / Sort</th>
                                    <th className="px-6 py-4">Executive Bio</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                                {sortedLeaders.map((leader) => (
                                    <tr key={leader.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/50">
                                                    {leader.photo_url ? (
                                                        <img src={leader.photo_url} alt={leader.full_name} className="h-full w-full rounded-full object-cover" />
                                                    ) : (
                                                        <User className="h-4 w-4 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{leader.full_name}</p>
                                                    <p className="text-xs text-slate-400 font-normal">{leader.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{leader.position}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-850 ring-1 ring-inset ring-emerald-600/10">
                                                {leader.term_year}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-700">{leader.order}</td>
                                        <td className="px-6 py-4 max-w-[250px] truncate" title={leader.bio}>{leader.bio || <span className="text-slate-350 italic">None provided</span>}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(leader)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-slate-50 rounded-lg transition-all"
                                                    title="Edit details"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(leader.id, leader.full_name)}
                                                    className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete appointee"
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
            )}

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingLeader ? "Edit Appointee Details" : "Appoint New Leader"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Member Search / Selector - Only visible when creating */}
                            {!editingLeader && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Select Member *</label>
                                    
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

                                    {/* Member selection dropdown list */}
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
                                                            setMemberSearch(m.full_name);
                                                        }}
                                                        className={`w-full flex items-center justify-between p-2.5 text-left text-xs hover:bg-emerald-50 transition-colors ${
                                                            selectedUserId === m.id ? "bg-emerald-50/70 font-semibold text-emerald-900" : "text-slate-750"
                                                        }`}
                                                    >
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{m.full_name}</p>
                                                            <p className="text-[10px] text-slate-400 font-normal">{m.email}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded px-1">{m.role}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {editingLeader && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Appointed Member</label>
                                    <p className="font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-150">{editingLeader.full_name}</p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Title / Position *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. President, Treasurer, Vice Chairperson"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Term Year *</label>
                                    <input
                                        type="text"
                                        required
                                        value={term}
                                        onChange={(e) => setTerm(e.target.value)}
                                        placeholder="e.g. 2025/2026"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Sort Priority (Hierarchy) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        placeholder="e.g. 1, 2, 3"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Executive Bio</label>
                                <textarea
                                    rows={3}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Brief bio about the leader's vision or background..."
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                                />
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
                                        "Save Appointee"
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
