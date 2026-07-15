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
    Loader2,
    Plus,
    Edit3,
    Upload
} from "lucide-react";
import { toast } from "sonner";
import { uploadProfilePictureAction } from "@/actions/gallery";
import CourseSelect from "@/components/shared/CourseSelect";

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
    photo_url?: string;
    gender?: string;
    relationshipStatus?: string;
}

function ProfilePictureUpload({
    photoUrl,
    onUploadSuccess,
    disabled
}: {
    photoUrl: string;
    onUploadSuccess: (url: string) => void;
    disabled?: boolean;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedMeta, setUploadedMeta] = useState<{ name: string; size: string } | null>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image file size exceeds the 10MB limit.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);
        setUploadedMeta({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB"
        });

        // Simulate upload progress
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 15;
            });
        }, 150);

        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await uploadProfilePictureAction(formData);

            clearInterval(interval);
            setUploadProgress(100);

            if (res.error) {
                toast.error(res.error);
                setUploadedMeta(null);
            } else if (res.url) {
                toast.success("Profile picture uploaded!");
                onUploadSuccess(res.url);
            }
        } catch (err) {
            clearInterval(interval);
            console.error(err);
            toast.error("Failed to upload profile picture.");
            setUploadedMeta(null);
        } finally {
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
            }, 600);
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Profile Picture</label>
            
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
                className={`
                    border border-dashed rounded-xl p-3 text-center cursor-pointer relative transition-all duration-200 flex flex-col items-center justify-center min-h-[90px]
                    ${isDragging 
                        ? "border-emerald-600 bg-emerald-50/30 shadow-[0_0_0_3px_rgba(16,185,129,0.15)] scale-[1.01]" 
                        : "border-slate-200 hover:border-emerald-700/50 hover:bg-slate-50/50 hover:shadow-[0_0_0_3px_rgba(16,185,129,0.05)]"
                    }
                `}
            >
                <input
                    type="file"
                    accept="image/*"
                    disabled={disabled || isUploading}
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {isUploading ? (
                    <div className="w-full space-y-2 px-4 pointer-events-none">
                        <Loader2 className="h-4 w-4 text-emerald-800 animate-spin mx-auto" />
                        <p className="text-[11px] text-slate-500 font-medium">Uploading avatar...</p>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 w-full justify-center pointer-events-none px-2">
                        {photoUrl ? (
                            <div className="h-12 w-12 rounded-full border border-slate-250 overflow-hidden relative shrink-0">
                                <img src={photoUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-slate-150 flex items-center justify-center shrink-0">
                                <Upload className="h-5 w-5 text-slate-400" />
                            </div>
                        )}
                        <div className="text-left min-w-0">
                            <p className="text-[11px] font-semibold text-slate-700 truncate">
                                {uploadedMeta ? uploadedMeta.name : (photoUrl ? "Uploaded Avatar Active" : "Click or drag photo here")}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                                {uploadedMeta ? uploadedMeta.size : "JPEG, PNG, WEBP up to 10MB"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminUsersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [actionId, setActionId] = useState<string | null>(null);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    // Form inputs
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [course, setCourse] = useState("");
    const [yearOfStudy, setYearOfStudy] = useState("1.1");
    const [gender, setGender] = useState("MALE");
    const [relationshipStatus, setRelationshipStatus] = useState("SINGLE");
    const [role, setRole] = useState("MEMBER");
    const [isVerified, setIsVerified] = useState(true);
    const [photoUrl, setPhotoUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);

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

    const openCreateModal = () => {
        setEditingMember(null);
        setFullName("");
        setEmail("");
        setPhone("");
        setCourse("");
        setYearOfStudy("1.1");
        setGender("MALE");
        setRelationshipStatus("SINGLE");
        setRole("MEMBER");
        setIsVerified(true);
        setPhotoUrl("");
        setIsAddModalOpen(true);
    };

    const openEditModal = async (member: Member) => {
        setEditingMember(member);
        setFullName(member.full_name);
        setEmail(member.email);
        setPhone(member.phone);
        setCourse(member.course);
        setYearOfStudy(member.year_of_study);
        setRole(member.role);
        setIsVerified(member.is_verified);
        setPhotoUrl(member.photo_url || "");
        setGender(member.gender || "MALE");
        setRelationshipStatus(member.relationshipStatus || "SINGLE");

        setIsEditModalOpen(true);

        try {
            const res = await fetch(`/api/members/${member.id}`);
            if (res.ok) {
                const details = await res.json();
                setGender(details.gender || "MALE");
                setRelationshipStatus(details.relationshipStatus || "SINGLE");
                setPhotoUrl(details.photo_url || "");
            }
        } catch (error) {
            console.error("Failed to fetch detailed member data:", error);
        }
    };

    const handleSaveMember = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!fullName.trim() || !email.trim() || !phone.trim() || !course.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                full_name: fullName.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                course: course.trim(),
                year_of_study: yearOfStudy,
                gender: gender,
                status: relationshipStatus,
                role: role,
                is_verified: isVerified,
                photo_url: photoUrl.trim() || null,
            };

            const url = editingMember ? `/api/members/${editingMember.id}` : "/api/members";
            const method = editingMember ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to save member");
            }

            toast.success(editingMember ? "Member details updated!" : "New member created successfully!");
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to save member record.");
        } finally {
            setSubmitting(false);
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
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white font-semibold py-2.5 px-4 shadow-sm text-sm transition-all shrink-0"
                >
                    <Plus className="h-4 w-4" /> Add New Member
                </button>
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
                        className="text-sm border border-slate-200 rounded-lg bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700 animate-none cursor-pointer"
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
                                                <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
                                                    {member.photo_url ? (
                                                        <img src={member.photo_url} alt={member.full_name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full bg-emerald-55 text-emerald-800 flex items-center justify-center font-bold text-sm">
                                                            {getInitials(member.full_name)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 leading-none">{member.full_name}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">ID: {member.id}</p>
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
                                                className="text-xs font-semibold rounded-lg bg-slate-105 hover:bg-slate-200 border-none px-2 py-1 focus:ring-2 focus:ring-emerald-500/20 text-slate-700 cursor-pointer disabled:opacity-50"
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
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(member)}
                                                    disabled={actionId === member.id}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-800 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-50"
                                                    title="Edit member details"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(member.id, member.full_name)}
                                                    disabled={actionId === member.id}
                                                    className="p-1.5 text-slate-400 hover:text-red-605 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Add or Edit Member */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Users className="h-5 w-5 text-emerald-800" /> {editingMember ? "Edit Member Details" : "Add New Member"}
                            </h3>
                            <button
                                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveMember} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <ProfilePictureUpload
                                photoUrl={photoUrl}
                                onUploadSuccess={(url) => setPhotoUrl(url)}
                                disabled={submitting}
                            />

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    disabled={submitting}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Email Address *</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="e.g. member@nyekusa.com"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="e.g. 0712345678"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Course *</label>
                                    <CourseSelect
                                        value={course}
                                        onChange={(val) => setCourse(val)}
                                        disabled={submitting}
                                        placeholder="Select Course"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Year of Study *</label>
                                    <select
                                        value={yearOfStudy}
                                        onChange={(e) => setYearOfStudy(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        disabled={submitting}
                                    >
                                        <option value="1.1">Year 1 Semester 1</option>
                                        <option value="1.2">Year 1 Semester 2</option>
                                        <option value="2.1">Year 2 Semester 1</option>
                                        <option value="2.2">Year 2 Semester 2</option>
                                        <option value="3.1">Year 3 Semester 1</option>
                                        <option value="3.2">Year 3 Semester 2</option>
                                        <option value="4.1">Year 4 Semester 1</option>
                                        <option value="4.2">Year 4 Semester 2</option>
                                        <option value="ALUMNI">Alumni</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Gender</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        disabled={submitting}
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                        <option value="RATHER_NOT_SAY">Rather Not Say</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Relationship Status</label>
                                    <select
                                        value={relationshipStatus}
                                        onChange={(e) => setRelationshipStatus(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        disabled={submitting}
                                    >
                                        <option value="SINGLE">Single</option>
                                        <option value="DATING">Dating</option>
                                        <option value="MARRIED">Married</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        disabled={submitting}
                                    >
                                        <option value="USER">User</option>
                                        <option value="MEMBER">Member</option>
                                        <option value="LEADER">Leader</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider block">Verification Status</label>
                                    <select
                                        value={isVerified ? "true" : "false"}
                                        onChange={(e) => setIsVerified(e.target.value === "true")}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                        disabled={submitting}
                                    >
                                        <option value="true">Verified (Active)</option>
                                        <option value="false">Pending Verification</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                    className="rounded-lg border border-slate-250 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 transition-all disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Member Details"
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
