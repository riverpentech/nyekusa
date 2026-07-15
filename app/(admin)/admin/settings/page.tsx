"use client";

import React, { useState, useEffect } from "react";
import { 
    Settings, 
    Save, 
    Loader2, 
    Globe, 
    CreditCard, 
    Mail, 
    Phone, 
    Link2, 
    FileText 
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        orgName: "NYEKUSA Association",
        registrationFee: "50",
        contactEmail: "info@nyekusa.or.ke",
        contactPhone: "+254 700 000000",
        mpesaPaybill: "123456",
        mpesaAccountName: "NYEKUSA",
        instagramUrl: "https://instagram.com/nyekusa",
        linkedinUrl: "https://linkedin.com/company/nyekusa",
        constitutionUrl: "",
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/admin/settings");
                if (!res.ok) throw new Error("Failed to load settings");
                const data = await res.json();
                
                // Merge loaded settings with defaults
                setSettings(prev => ({
                    ...prev,
                    ...data
                }));
            } catch (error) {
                console.error(error);
                toast.error("Could not load settings from database.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error("Failed to update settings");
            const data = await res.json();
            
            setSettings(prev => ({
                ...prev,
                ...data
            }));
            toast.success("System configurations updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                <span className="mt-2 text-sm">Loading configurations...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-950 bg-clip-text text-transparent">
                        Global System Settings
                    </h2>
                    <p className="text-slate-500 mt-1">Configure variables, fees, registration defaults, contact emails, and socials across the site.</p>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-855 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-855 transition-all disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* General Settings */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Globe className="h-5 w-5 text-emerald-700" />
                        <h3 className="text-lg font-bold text-slate-900">Organization Settings</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Association / Org Name</label>
                            <input
                                type="text"
                                name="orgName"
                                value={settings.orgName}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Constitution File URL</label>
                            <input
                                type="text"
                                name="constitutionUrl"
                                value={settings.constitutionUrl}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Financials & Payments */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <CreditCard className="h-5 w-5 text-emerald-700" />
                        <h3 className="text-lg font-bold text-slate-900">Fees & STK Configuration</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Registration Fee (KES)</label>
                            <input
                                type="number"
                                name="registrationFee"
                                value={settings.registrationFee}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">M-Pesa Paybill</label>
                                <input
                                    type="text"
                                    name="mpesaPaybill"
                                    value={settings.mpesaPaybill}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Account ID Name</label>
                                <input
                                    type="text"
                                    name="mpesaAccountName"
                                    value={settings.mpesaAccountName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contacts & Support */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Mail className="h-5 w-5 text-emerald-700" />
                        <h3 className="text-lg font-bold text-slate-900">Support Channels</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Contact Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={settings.contactEmail}
                                    onChange={handleChange}
                                    className="w-full pl-10 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Contact Phone Line</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="contactPhone"
                                    value={settings.contactPhone}
                                    onChange={handleChange}
                                    className="w-full pl-10 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Profiles */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Link2 className="h-5 w-5 text-emerald-700" />
                        <h3 className="text-lg font-bold text-slate-900">Social Accounts</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Instagram Page URL</label>
                            <input
                                type="url"
                                name="instagramUrl"
                                value={settings.instagramUrl}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">LinkedIn Company Page</label>
                            <input
                                type="url"
                                name="linkedinUrl"
                                value={settings.linkedinUrl}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
