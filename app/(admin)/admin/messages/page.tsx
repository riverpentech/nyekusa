"use client";

import React, { useState, useEffect } from "react";
import { 
    Mail, 
    MailOpen, 
    Trash2, 
    Clock, 
    Search, 
    Filter, 
    RefreshCw, 
    Loader2, 
    AlertCircle,
    User,
    ChevronRight,
    X,
    CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const fetchMessages = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch("/api/admin/messages");
            if (!res.ok) throw new Error("Failed to fetch messages");
            const data = await res.json();
            setMessages(data.messages || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Could not load contact messages. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleToggleRead = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setActionLoadingId(id);
        try {
            const res = await fetch(`/api/admin/messages/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isRead: !currentStatus }),
            });
            if (!res.ok) throw new Error("Failed to update message status");
            
            const updated = await res.json();
            setMessages(messages.map(m => m.id === id ? { ...m, isRead: updated.isRead } : m));
            
            // Sync selected message view if open
            if (selectedMessage && selectedMessage.id === id) {
                setSelectedMessage({ ...selectedMessage, isRead: updated.isRead });
            }

            toast.success(updated.isRead ? "Message marked as read" : "Message marked as unread");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update message status");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm("Are you sure you want to delete this message?")) return;
        setActionLoadingId(id);
        try {
            const res = await fetch(`/api/admin/messages/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete message");
            
            setMessages(messages.filter(m => m.id !== id));
            if (selectedMessage && selectedMessage.id === id) {
                setSelectedMessage(null);
            }
            toast.success("Message deleted successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete message");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleOpenMessage = async (msg: ContactMessage) => {
        setSelectedMessage(msg);
        // Automatically mark as read if it is currently unread
        if (!msg.isRead) {
            try {
                const res = await fetch(`/api/admin/messages/${msg.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isRead: true }),
                });
                if (res.ok) {
                    const updated = await res.json();
                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: updated.isRead } : m));
                }
            } catch (err) {
                console.error("Failed to auto-mark message as read:", err);
            }
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Filter and search messages
    const filteredMessages = messages.filter(msg => {
        const matchesFilter = 
            filter === "ALL" || 
            (filter === "UNREAD" && !msg.isRead) || 
            (filter === "READ" && msg.isRead);
            
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            msg.name.toLowerCase().includes(query) ||
            msg.email.toLowerCase().includes(query) ||
            (msg.subject && msg.subject.toLowerCase().includes(query)) ||
            msg.message.toLowerCase().includes(query);

        return matchesFilter && matchesSearch;
    });

    const unreadCount = messages.filter(m => !m.isRead).length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-950 bg-clip-text text-transparent">
                        Contact Messages
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Read, organize, and manage inquiries sent through the public website contact form.
                    </p>
                </div>
                <Button 
                    onClick={() => fetchMessages()} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-1.5 self-start sm:self-center"
                    disabled={loading}
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-emerald-800" : ""}`} />
                    Refresh Messages
                </Button>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unread Inquiries</div>
                    <div className="text-3xl font-extrabold text-slate-950 mt-1.5 flex items-center gap-2">
                        {unreadCount > 0 ? (
                            <>
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                                {unreadCount}
                            </>
                        ) : (
                            <span className="text-slate-400 text-2xl font-bold">0</span>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Received</div>
                    <div className="text-3xl font-extrabold text-slate-950 mt-1.5">{messages.length}</div>
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Read Messages</div>
                    <div className="text-3xl font-extrabold text-slate-950 mt-1.5">
                        {messages.filter(m => m.isRead).length}
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                    {error}
                </div>
            )}

            {/* Main Content Layout */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">
                
                {/* Messages List Card */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
                    {/* Search & Filter Header */}
                    <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
                        {/* Search */}
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, subject..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-800 transition-colors"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-lg">
                            {(["ALL", "UNREAD", "READ"] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                                        filter === f 
                                            ? "bg-white text-slate-900 shadow-sm" 
                                            : "text-slate-500 hover:text-slate-900"
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Messages Stack */}
                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                                <span className="mt-2 text-xs">Loading inquiries...</span>
                            </div>
                        ) : filteredMessages.length > 0 ? (
                            filteredMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => handleOpenMessage(msg)}
                                    className={`p-4 hover:bg-slate-50/40 transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                                        selectedMessage?.id === msg.id ? "bg-slate-50" : ""
                                    }`}
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                            msg.isRead ? "bg-slate-100 text-slate-400" : "bg-emerald-50 text-emerald-800"
                                        }`}>
                                            {msg.isRead ? <MailOpen size={16} /> : <Mail size={16} />}
                                        </div>
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`text-sm font-semibold text-slate-900 ${msg.isRead ? "font-normal text-slate-600" : ""}`}>
                                                    {msg.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {formatDate(msg.createdAt)}
                                                </span>
                                            </div>
                                            <div className={`text-xs text-slate-700 font-bold truncate ${msg.isRead ? "font-normal text-slate-500" : ""}`}>
                                                {msg.subject || "(No Subject)"}
                                            </div>
                                            <p className="text-xs text-slate-400 truncate max-w-lg">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons on Row hover */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={(e) => handleToggleRead(msg.id, msg.isRead, e)}
                                            disabled={actionLoadingId === msg.id}
                                            className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                                                msg.isRead ? "text-slate-400 hover:text-slate-600" : "text-emerald-700 hover:text-emerald-900"
                                            }`}
                                            title={msg.isRead ? "Mark as unread" : "Mark as read"}
                                        >
                                            {msg.isRead ? <Mail size={16} /> : <CheckCircle size={16} />}
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(msg.id, e)}
                                            disabled={actionLoadingId === msg.id}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Delete message"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <ChevronRight size={16} className="text-slate-300" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-slate-400 italic text-sm">
                                No messages matching the query.
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Details Preview Panel */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6 h-fit min-h-[300px] relative">
                    {selectedMessage ? (
                        <div className="space-y-6 animate-scale-up">
                            {/* Panel Header */}
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-4">
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                                        <User size={18} className="text-emerald-800" />
                                        {selectedMessage.name}
                                    </h3>
                                    <a 
                                        href={`mailto:${selectedMessage.email}`}
                                        className="text-xs text-emerald-800 hover:underline font-medium block"
                                    >
                                        {selectedMessage.email}
                                    </a>
                                </div>
                                <button 
                                    onClick={() => setSelectedMessage(null)}
                                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Details body */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Subject</label>
                                    <p className="text-sm font-semibold text-slate-900 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                                        {selectedMessage.subject || "(No Subject)"}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Inquiry Description</label>
                                    <div className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap min-h-[150px]">
                                        {selectedMessage.message}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                    <Clock size={14} />
                                    Received: {formatDate(selectedMessage.createdAt)}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex gap-2 pt-2 border-t border-slate-100">
                                <Button
                                    onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.isRead)}
                                    variant="outline"
                                    className="flex-1 text-xs font-semibold text-slate-700"
                                >
                                    {selectedMessage.isRead ? "Mark Unread" : "Mark Read"}
                                </Button>
                                <Button
                                    onClick={() => handleDelete(selectedMessage.id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                                >
                                    Delete Message
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-24 text-slate-400 space-y-3">
                            <Mail className="h-10 w-10 text-slate-300 stroke-[1.5]" />
                            <div>
                                <h4 className="font-semibold text-slate-700 text-sm">No message selected</h4>
                                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                                    Click any row item in the list panel to preview message details.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
