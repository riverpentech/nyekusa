"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    User as UserIcon,
    BookOpen,
    Heart,
    FileText,
    Globe,
    Save,
    CheckCircle,
    Loader2
} from "lucide-react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "MALE", // Gender Enum
        course: "",
        status: "SINGLE", // RelationshipStatus Enum
        yearOfStudy: "",
        quotes: "",
        bio: "",
        twitter: "",
        linkedin: "",
        facebook: "",
        instagram: "",
        tiktok: "",
        github: "",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const userId = session?.user?.id;
        if (!userId) return;

        let isMounted = true;
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`/api/members/${userId}`);
                if (!response.ok) {
                    throw new Error("Failed to load profile details");
                }
                const data = await response.json();
                if (isMounted) {
                    setFormData({
                        name: data.full_name ?? "",
                        email: data.email ?? "",
                        phone: data.phone ?? "",
                        gender: data.gender ?? "MALE",
                        course: data.course ?? "",
                        status: data.relationshipStatus ?? "SINGLE",
                        yearOfStudy: data.year_of_study ?? "",
                        quotes: data.quotes ?? "",
                        bio: data.bio ?? "",
                        twitter: data.twitter ?? "",
                        linkedin: data.linkedin ?? "",
                        facebook: data.facebook ?? "",
                        instagram: data.instagram ?? "",
                        tiktok: data.tiktok ?? "",
                        github: data.github ?? "",
                    });
                }
            } catch (err) {
                console.error("Error loading profile:", err);
                if (isMounted) {
                    setError("Failed to load profile. Please refresh the page.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [session?.user?.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userId = session?.user?.id;
        if (!userId) return;

        setIsSaving(true);
        setError(null);
        setSuccessMessage("");

        try {
            const payload = {
                full_name: formData.name,
                phone: formData.phone,
                gender: formData.gender,
                course: formData.course,
                status: formData.status,
                year_of_study: formData.yearOfStudy,
                quotes: formData.quotes,
                bio: formData.bio,
                twitter: formData.twitter,
                linkedin: formData.linkedin,
                facebook: formData.facebook,
                instagram: formData.instagram,
                tiktok: formData.tiktok,
                github: formData.github,
            };

            const response = await fetch(`/api/members/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to update profile");
            }

            setSuccessMessage("Profile updated successfully!");
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (err) {
            console.error("Error saving profile:", err);
            setError(err instanceof Error ? err.message : "Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !session?.user?.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                <p className="text-sm text-slate-500 font-medium">Loading your profile details...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h2>
                    <p className="text-slate-500 mt-1">
                        Manage your personal data, academic settings, and public directory information.
                    </p>
                </div>
            </div>

            {successMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-800 border border-emerald-200 animate-fade-in">
                    <CheckCircle size={18} className="text-emerald-600" />
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-800 border border-red-200 animate-fade-in">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
                {/* Left Column: Avatar & Summary Bio */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
                        <div className="mx-auto h-24 w-24 rounded-full bg-emerald-800 flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-inner">
                            {formData.name ? formData.name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase() : "U"}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{formData.name || "Member Profile"}</h3>
                        <p className="text-xs text-amber-600 font-semibold tracking-wide uppercase mt-0.5">Member Tier</p>

                        <div className="mt-4 pt-4 border-t border-slate-100 text-left">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Personal Quote</label>
                            <textarea
                                name="quotes"
                                value={formData.quotes}
                                onChange={handleChange}
                                rows={2}
                                className="w-full text-sm italic text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-200 focus:outline-emerald-800 resize-none"
                                placeholder="Write a catchphrase or quote..."
                            />
                        </div>
                    </div>
                    {/* Social Presence Links matching Schema fields */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            {/* Generic Lucide Globe icon works perfectly here */}
                            <Globe size={16} className="text-slate-400" />
                            Social Handles
                        </h3>

                        <div className="space-y-3">
                            {/* LinkedIn Field */}
                            <div className="flex rounded-md shadow-sm">
      <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-200 bg-slate-50 px-3 text-slate-500">
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </span>
                                <input
                                    type="text"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    placeholder="LinkedIn Profile URL"
                                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-emerald-800"
                                />
                            </div>

                            {/* X / Twitter Field */}
                            <div className="flex rounded-md shadow-sm">
      <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-200 bg-slate-50 px-3 text-slate-500">
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </span>
                                <input
                                    type="text"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    placeholder="X (Twitter) Link"
                                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-emerald-800"
                                />
                            </div>

                            {/* GitHub Field */}
                            <div className="flex rounded-md shadow-sm">
      <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-200 bg-slate-50 px-3 text-slate-500">
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.024A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.293 2.747-1.024 2.747-1.024.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      </span>
                                <input
                                    type="text"
                                    name="github"
                                    value={formData.github}
                                    onChange={handleChange}
                                    placeholder="GitHub Profile"
                                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-slate-200 px-3 py-1.5 text-sm focus:outline-emerald-800"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Forms fields */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section 1: Core Details */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                            <UserIcon size={18} className="text-emerald-800" />
                            General Details
                        </h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-emerald-800"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-emerald-800 bg-white"
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                    <option value="RATHER_NOT_SAY">Rather Not Say</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-emerald-800"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Academic & Demographics */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                            <BookOpen size={18} className="text-emerald-800" />
                            Academic / Relationship Status
                        </h3>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Course Registered</label>
                                <input
                                    type="text"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-emerald-800"
                                    placeholder="e.g., BSc. Civil Engineering"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Year of Study</label>
                                <input
                                    type="text"
                                    name="yearOfStudy"
                                    value={formData.yearOfStudy}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-emerald-800"
                                    placeholder="e.g., 4.1"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Relationship Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-emerald-800 bg-white"
                                >
                                    <option value="SINGLE">Single</option>
                                    <option value="DATING">Dating</option>
                                    <option value="MARRIED">Married</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Profile Biography text info */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                            <FileText size={18} className="text-emerald-800" />
                            Detailed Bio
                        </h3>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Bio Description</label>
                            <textarea
                                name="bio"
                                value={formData.bio || ""}
                                onChange={handleChange}
                                rows={4}
                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-emerald-800"
                                placeholder="Tell your team and associates about yourself..."
                            />
                        </div>
                    </div>

                    {/* Form Actions footer alignment */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isSaving ? "Saving..." : "Save System Profile"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}