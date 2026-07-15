"use client";

import React, { useState, useEffect } from "react";
import { 
    Briefcase, 
    Plus, 
    Trash2, 
    Edit3, 
    X, 
    Loader2, 
    DollarSign, 
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    Play
} from "lucide-react";
import { toast } from "sonner";

interface Project {
    id: string;
    title: string;
    description: string;
    status: "PLANNING" | "ONGOING" | "COMPLETED" | "ON_HOLD";
    startDate: string | null;
    endDate: string | null;
    budget: number;
    createdAt: string;
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Form inputs
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("PLANNING");
    const [budget, setBudget] = useState("0");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/projects?limit=100");
            if (!res.ok) throw new Error("Failed to fetch projects");
            const data = await res.json();
            setProjects(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Could not load projects data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const openCreateModal = () => {
        setEditingProject(null);
        setTitle("");
        setDescription("");
        setStatus("PLANNING");
        setBudget("0");
        setStartDate("");
        setEndDate("");
        setIsModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setTitle(project.title);
        setDescription(project.description);
        setStatus(project.status);
        setBudget(String(project.budget));
        setStartDate(project.startDate ? project.startDate.slice(0, 10) : "");
        setEndDate(project.endDate ? project.endDate.slice(0, 10) : "");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim() || !description.trim()) {
            toast.error("Please fill in the title and description.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                status,
                budget: parseFloat(budget) || 0.0,
                startDate: startDate ? new Date(startDate).toISOString() : null,
                endDate: endDate ? new Date(endDate).toISOString() : null,
            };

            let res;
            if (editingProject) {
                res = await fetch(`/api/projects/${editingProject.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch("/api/projects", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) throw new Error("Failed to save project");
            toast.success(editingProject ? "Project updated successfully!" : "Project created successfully!");
            setIsModalOpen(false);
            fetchProjects();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save project.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        setActionId(id);
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update project status");
            
            toast.success(`Project status updated to ${newStatus}`);
            setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
        } catch (error) {
            console.error(error);
            toast.error("Failed to change project status");
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete project "${name}"?`)) return;
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete project");
            toast.success("Project deleted successfully");
            setProjects(projects.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete project.");
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(val);
    };

    const getStatusIcon = (status: string) => {
        switch(status) {
            case "PLANNING": return <Clock className="h-4 w-4 text-amber-600" />;
            case "ONGOING": return <Play className="h-4 w-4 text-emerald-600" />;
            case "COMPLETED": return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
            case "ON_HOLD": return <AlertCircle className="h-4 w-4 text-slate-500" />;
            default: return <Clock className="h-4 w-4 text-slate-500" />;
        }
    };

    const getStatusClass = (status: string) => {
        switch(status) {
            case "PLANNING": return "bg-amber-50 text-amber-700 ring-amber-600/10";
            case "ONGOING": return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
            case "COMPLETED": return "bg-blue-50 text-blue-700 ring-blue-600/10";
            case "ON_HOLD": return "bg-slate-50 text-slate-650 ring-slate-500/10";
            default: return "bg-slate-50 text-slate-650 ring-slate-500/10";
        }
    };

    // Metrics
    const totalCount = projects.length;
    const totalBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);
    const ongoingCount = projects.filter(p => p.status === "ONGOING").length;
    const completedCount = projects.filter(p => p.status === "COMPLETED").length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-950 bg-clip-text text-transparent">
                        Club Projects & Budget Tracker
                    </h2>
                    <p className="text-slate-500 mt-1">Manage ongoing and completed development projects, allocate financial budgets, and log timelines.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-855 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    New Project
                </button>
            </div>

            {/* Metrics cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Total Projects</p>
                        <Briefcase className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-950">{totalCount}</div>
                        <p className="text-xs text-slate-500 mt-1">In active database</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-700" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Total Budget Allocated</p>
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-emerald-800">{formatCurrency(totalBudget)}</div>
                        <p className="text-xs text-slate-500 mt-1">All project estimates</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Ongoing Projects</p>
                        <Play className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-amber-600">{ongoingCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Currently in progress</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-2">
                        <p className="text-sm font-semibold text-slate-500">Completed Projects</p>
                        <CheckCircle2 className="h-5 w-5 text-slate-700" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-slate-800">{completedCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Archived or finalized</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800" />
                </div>
            </div>

            {/* Project List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                    <span className="mt-2 text-sm">Loading projects...</span>
                </div>
            ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
                    <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-850">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-800">No Projects Logged</h3>
                        <p className="text-slate-500 text-sm max-w-sm">
                            Click "New Project" to register the first activity.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Project</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Budget</th>
                                    <th className="px-6 py-4">Timeline</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm text-slate-650">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 max-w-[300px]">
                                            <p className="font-semibold text-slate-900 text-base">{project.title}</p>
                                            <p className="text-xs text-slate-450 mt-1 line-clamp-2 leading-relaxed">{project.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={project.status}
                                                    onChange={(e) => handleStatusChange(project.id, e.target.value)}
                                                    disabled={actionId === project.id}
                                                    className={`text-xs font-bold rounded-lg border-none px-2 py-1.5 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 cursor-pointer disabled:opacity-50 ring-1 ring-inset ${getStatusClass(project.status)}`}
                                                >
                                                    <option value="PLANNING">PLANNING</option>
                                                    <option value="ONGOING">ONGOING</option>
                                                    <option value="COMPLETED">COMPLETED</option>
                                                    <option value="ON_HOLD">ON HOLD</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {formatCurrency(project.budget)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                <span>
                                                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"}
                                                    {" to "}
                                                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(project)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-slate-50 rounded-lg transition-all"
                                                    title="Edit project"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id, project.title)}
                                                    className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete project"
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
                                {editingProject ? "Edit Project Details" : "Create New Project"}
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
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Project Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Nyekusa Tech Hub Hub Integration"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Status *</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                                    >
                                        <option value="PLANNING">PLANNING</option>
                                        <option value="ONGOING">ONGOING</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                        <option value="ON_HOLD">ON HOLD</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Allocated Budget (KES)</label>
                                    <input
                                        type="number"
                                        required
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        placeholder="e.g. 15000"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Project Description *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Write a clear statement of objectives, scope of work, stakeholders, etc..."
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
                                        "Save Project"
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
