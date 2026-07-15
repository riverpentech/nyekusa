"use client";

import React, { useState, useEffect } from "react";
import { 
    Calendar, 
    Plus, 
    MapPin, 
    Clock, 
    Edit3, 
    Trash2, 
    X, 
    Loader2, 
    Image as ImageIcon 
} from "lucide-react";
import { toast } from "sonner";

interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    eventDate: string;
    image: string | null;
    createdAt: string;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    // Form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [image, setImage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/events?limit=100");
            if (!res.ok) throw new Error("Failed to fetch events");
            const data = await res.json();
            setEvents(data.events || []);
        } catch (error) {
            console.error(error);
            toast.error("Could not load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const openCreateModal = () => {
        setEditingEvent(null);
        setTitle("");
        setDescription("");
        setLocation("");
        setEventDate("");
        setImage("");
        setIsModalOpen(true);
    };

    const openEditModal = (event: Event) => {
        setEditingEvent(event);
        setTitle(event.title);
        setDescription(event.description);
        setLocation(event.location);
        // Format Date to YYYY-MM-DDThh:mm for datetime-local input
        const dateObj = new Date(event.eventDate);
        const formattedDate = dateObj.toISOString().slice(0, 16);
        setEventDate(formattedDate);
        setImage(event.image || "");
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !location.trim() || !eventDate) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title: title.trim(),
                description: description.trim(),
                location: location.trim(),
                eventDate: new Date(eventDate).toISOString(),
                image: image.trim() || null,
            };

            let res;
            if (editingEvent) {
                // Update
                res = await fetch(`/api/events/${editingEvent.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                // Create
                res = await fetch("/api/events", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }

            if (!res.ok) throw new Error("Failed to save event");
            toast.success(editingEvent ? "Event updated successfully!" : "Event created successfully!");
            setIsModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while saving the event.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete event");
            toast.success("Event deleted successfully");
            setEvents(events.filter(e => e.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete event.");
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-emerald-950 bg-clip-text text-transparent">
                        Gatherings & Events Manager
                    </h2>
                    <p className="text-slate-500 mt-1">Schedule new gatherings, manage details, and display upcoming sessions on the main website.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 transition-all"
                >
                    <Plus className="h-5 w-5" />
                    New Event
                </button>
            </div>

            {/* Events Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
                    <span className="mt-2 text-sm">Loading scheduled events...</span>
                </div>
            ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
                    <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-850">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-800">No Events Scheduled</h3>
                        <p className="text-slate-500 text-sm max-w-sm">
                            Click "New Event" above to create and schedule your first event.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <div 
                            key={event.id}
                            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div>
                                {/* Card Image placeholder or cover */}
                                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                                    {event.image ? (
                                        <img 
                                            src={event.image} 
                                            alt={event.title} 
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                                            <ImageIcon className="h-10 w-10" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-sm border border-slate-100">
                                        Active
                                    </div>
                                </div>

                                <div className="p-5 space-y-3">
                                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-emerald-850 transition-colors line-clamp-1">
                                        {event.title}
                                    </h4>
                                    
                                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                                        {event.description}
                                    </p>

                                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                            <span className="truncate">{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                            <span>{formatDate(event.eventDate)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3 bg-slate-50/50">
                                <button
                                    onClick={() => openEditModal(event)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 transition-colors"
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id, event.title)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-red-650 hover:text-red-700 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Event Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden border border-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="text-lg font-bold text-slate-900">
                                {editingEvent ? "Edit Event Details" : "Schedule New Event"}
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
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Annual Hiking & Networking"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g. Aberdare Ranges / Karura Forest"
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Cover Image URL</label>
                                    <input
                                        type="url"
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        placeholder="e.g. https://images.unsplash.com/..."
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Event Description *</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide detailed description of the event, scheduled plans, costs, etc..."
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
                                        "Save Event"
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
