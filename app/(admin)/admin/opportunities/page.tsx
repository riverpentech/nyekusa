"use client";

import React, { useState, useEffect } from "react";
import { 
    Lightbulb, 
    Plus, 
    Trash2, 
    Edit3, 
    X, 
    Loader2, 
    Calendar, 
    Briefcase, 
    ExternalLink,
    Compass,
    Building2
} from "lucide-react";
import { toast } from "sonner";

interface Opportunity {
    id: string;
    title: string;
    company: string;
    location: string;
    category: string;
    deadline: string;
    description: string;
    apply_url: string;
    created_at: string;
}

export default function AdminOpportunitiesPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

    // Form inputs
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [category, setCategory] = useState("internship");
    const [applyUrl, setApplyUrl] = useState("");
    const [deadline, setDeadline] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchOpportunities = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/opportunities?limit=100");
            if (!res.ok) throw new Error("Failed to fetch opportunities");
            const data = await res.json();
            setOpportunities(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Could not load opportunities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const openCreateModal = () => {
        setEditingOpportunity(null);
        setTitle("");
        setCompany("");
        setCategory("internship");
        setApplyUrl("");
        setDeadline("");
        setDescription("");
        setIsModalOpen(true);
    };

    const openEditModal = (opp: Opportunity) => {
        setEditingOpportunity(opp);
        setTitle(opp.title);
        setCompany(opp.company);
        setCategory(opp.category);
        setApplyUrl(opp.apply_url === "#" ? "" : opp.apply_url);
        setDeadline(opp.deadline ? opp.deadline.slice(0, 10) : "");
        setDescription(opp.description);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim() || !company.trim() || !description.trim()) {
            toast.error("Please fill in all required fields (title, company, description).");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                company: company.trim(),
                category: category.trim(),
                apply_url: applyUrl.trim() || null,
                link: applyUrl.trim() || null,
                deadline: deadline ? new Date(deadline).toISOString() : null,
                description: description.trim(),
            };

            let res;
            if (editingOpportunity) {
                res = await fetch(`/api/opportunities/${editingOpportunity.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch("/api/opportunities", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) throw new Error("Failed to save opportunity");
            toast.success(editingOpportunity ? "Opportunity updated successfully!" : "Opportunity created successfully!");
            setIsModalOpen(false);
            fetchOpportunities();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save opportunity.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete opportunity "${name}"?`)) return;
        try {
            const res = await fetch(`/api/opportunities/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete opportunity");
            toast.success("Opportunity deleted successfully");
            setOpportunities(opportunities.filter(o => o.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete opportunity.");
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Open";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const totalCount = opportunities.length;
    const internshipCount = opportunities.filter(o => o.category === "internship").length;
    const attachmentCount = opportunities.filter(o => o.category === "attachment").length;
    const jobCount = opportunities.filter(o => o.category === "job" || o.category === "career").length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-950 bg-clip-text text-transparent">
                        Career & Professional Opportunities
                    </h2>
                    <p className="text-slate-500 mt-1">Post attachments, internships, coding bootcamps, and career openings for members to apply.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-855 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-855 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    New Opportunity
                </button>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">All Postings</p>
                        <Lightbulb className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-955">{totalCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Active items listed</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-700" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Internship Listings</p>
                        <Briefcase className="h-5 w-5 text-emerald-800" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-emerald-700">{internshipCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Industry placements</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-650" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Attachments</p>
                        <Compass className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-amber-600">{attachmentCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Academic assignments</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Full Jobs</p>
                        <Building2 className="h-5 w-5 text-slate-700" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-800">{jobCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Graduate opportunities</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800" />
                </div>
            </div>

            {/* List Table */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                    <span className="mt-2 text-sm">Loading opportunities...</span>
                </div>
            ) : opportunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
                    <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-850">
                        <Lightbulb className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-800">No Postings Logged</h3>
                        <p className="text-slate-500 text-sm max-w-sm">
                            Click "New Opportunity" to add a professional opportunity listing.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {opportunities.map((opp) => (
                        <div 
                            key={opp.id} 
                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-350"
                        >
                            <div className="p-5 space-y-4">
                                <div>
                                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-850 ring-1 ring-inset ring-emerald-600/10 capitalize">
                                        {opp.category}
                                    </span>
                                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-855 mt-2 line-clamp-1">
                                        {opp.title}
                                    </h4>
                                    <p className="text-sm font-semibold text-slate-500 mt-0.5">{opp.company}</p>
                                </div>

                                <p className="text-sm text-slate-505 line-clamp-4 leading-relaxed">
                                    {opp.description}
                                </p>

                                <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                        <span>Deadline: <span className="font-bold text-slate-700">{formatDate(opp.deadline)}</span></span>
                                    </div>
                                    {opp.apply_url && opp.apply_url !== "#" && (
                                        <a 
                                            href={opp.apply_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold hover:underline"
                                        >
                                            View External Link
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3 bg-slate-50/50">
                                <button
                                    onClick={() => openEditModal(opp)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(opp.id, opp.title)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-red-650 hover:text-red-750 hover:bg-red-50/50 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingOpportunity ? "Edit Posting Details" : "Create Opportunity Posting"}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Opportunity Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Frontend React Attachment"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Hiring Company *</label>
                                    <input
                                        type="text"
                                        required
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        placeholder="e.g. RiverPen Tech"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Category *</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                                    >
                                        <option value="internship">Internship</option>
                                        <option value="attachment">Attachment</option>
                                        <option value="job">Full-time Job</option>
                                        <option value="bootcamp">Bootcamp / Training</option>
                                        <option value="outreach">Outreach Program</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Apply Link / URL</label>
                                    <input
                                        type="url"
                                        value={applyUrl}
                                        onChange={(e) => setApplyUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Application Deadline</label>
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Job / Program Description *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Outline the role responsibilities, required skills, application steps..."
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
                                        "Save Posting"
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
