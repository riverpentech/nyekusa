"use client";

import React, { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
    Plus,
    Edit2,
    Trash2,
    Upload,
    X,
    Image as ImageIcon,
    RefreshCw,
    Loader2,
    FolderPlus,
    Link as LinkIcon,
    Calendar,
    ExternalLink,
    Images,
    FolderHeart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    uploadImageAction,
    updateImageAction,
    replaceImageAction,
    deleteImageAction,
    createAlbumAction,
    updateAlbumAction,
    deleteAlbumAction,
    uploadAlbumCoverAction
} from "@/actions/gallery";

type GalleryImage = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdAt: Date;
    updatedAt: Date;
};

type GalleryAlbum = {
    id: string;
    title: string | null;
    description: string | null;
    category: string | null;
    date: Date | null;
    coverImage: string | null;
    images: string; // Google Photos link
    createdAt: Date;
};

type Props = {
    initialImages: GalleryImage[];
    initialAlbums: GalleryAlbum[];
};

const CATEGORIES = [
    { value: "meetings", label: "Thursday Meetings" },
    { value: "hiking", label: "Hikes" },
    { value: "ceremony", label: "Ceremonies" },
    { value: "social", label: "Social Events" },
    { value: "induction", label: "Induction" },
    { value: "outreach", label: "Outreach" },
    { value: "other", label: "Other" }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function getCategoryLabel(cat: string | null) {
    if (!cat) return "Other";
    const found = CATEGORIES.find(c => c.value === cat);
    return found ? found.label : cat.charAt(0).toUpperCase() + cat.slice(1);
}

// Reusable dropzone with drag-and-drop + blue glow on hover/drag
function ImageDropzone({
                           id,
                           file,
                           onFileSelected,
                           compact = false,
                           label,
                           hint,
                       }: {
    id: string;
    file: File | null;
    onFileSelected: (file: File) => void;
    compact?: boolean;
    label?: string;
    hint?: string;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    const validateAndSet = (f: File) => {
        if (f.size > MAX_FILE_SIZE) {
            toast.error("File is too large. Maximum size is 10MB.");
            return;
        }
        if (!f.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            return;
        }
        onFileSelected(f);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.types.includes("Files")) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            validateAndSet(droppedFile);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSet(e.target.files[0]);
        }
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
                border-2 border-dashed rounded-lg flex flex-col items-center justify-center 
                cursor-pointer relative transition-all duration-200
                ${compact ? "p-4" : "p-6"}
                ${isDragging
                ? "border-blue-500 bg-blue-50 shadow-[0_0_0_4px_rgba(59,130,246,0.15)] scale-[1.01]"
                : "border-slate-200 hover:border-emerald-800/40 hover:bg-emerald-50/10"
            }
            `}
        >
            <input
                type="file"
                id={id}
                accept="image/*"
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {isDragging ? (
                <div className="text-center pointer-events-none">
                    <Upload className={`${compact ? "h-6 w-6" : "h-8 w-8"} text-blue-500 mb-2 mx-auto animate-bounce`} />
                    <p className={`${compact ? "text-xs" : "text-sm"} font-semibold text-blue-600`}>
                        Drop image here
                    </p>
                </div>
            ) : file ? (
                <div className="text-center pointer-events-none">
                    <p className={`${compact ? "text-xs" : "text-sm"} font-semibold text-emerald-800 truncate max-w-xs`}>
                        {file.name}
                    </p>
                    <p className={`${compact ? "text-[10px]" : "text-xs"} text-slate-500 mt-1`}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                </div>
            ) : (
                <div className="text-center pointer-events-none">
                    <Upload className={`${compact ? "h-5 w-5 mb-1" : "h-8 w-8 mb-2"} text-slate-400 mx-auto`} />
                    <p className={`${compact ? "text-xs" : "text-sm"} text-slate-600 font-medium`}>
                        {label ?? "Click or drag an image to upload"}
                    </p>
                    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
                </div>
            )}
        </div>
    );
}

function SmallAlbumCoverUpload({
    coverUrl,
    onUploadSuccess,
    disabled
}: {
    coverUrl: string;
    onUploadSuccess: (url: string) => void;
    disabled?: boolean;
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedMeta, setUploadedMeta] = useState<{ name: string; size: string } | null>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please drop or select an image file.");
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

        // Simulate upload progress bar growth
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
            const res = await uploadAlbumCoverAction(formData);

            clearInterval(interval);
            setUploadProgress(100);

            if (res.error) {
                toast.error(res.error);
                setUploadedMeta(null);
            } else if (res.url) {
                toast.success("Cover image uploaded!");
                onUploadSuccess(res.url);
            }
        } catch (err) {
            clearInterval(interval);
            console.error(err);
            toast.error("Failed to upload image.");
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
            <Label className="text-slate-700 font-medium text-xs block">Upload Custom Album Cover</Label>
            
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
                className={`
                    border border-dashed rounded-lg p-3 text-center cursor-pointer relative transition-all duration-200 flex flex-col items-center justify-center min-h-[90px]
                    ${isDragging 
                        ? "border-emerald-600 bg-emerald-50/30 shadow-[0_0_0_3px_rgba(16,185,129,0.15)] scale-[1.01]" 
                        : "border-slate-200 hover:border-emerald-750/50 hover:bg-slate-50/50 hover:shadow-[0_0_0_3px_rgba(16,185,129,0.05)]"
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
                        <p className="text-[11px] text-slate-500 font-medium">Uploading cover preview...</p>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300" 
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 w-full justify-center pointer-events-none px-2">
                        {coverUrl ? (
                            <div className="h-12 w-12 rounded border border-slate-200 overflow-hidden relative shrink-0">
                                <img src={coverUrl} alt="Cover Preview" className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <Upload className="h-5 w-5 text-slate-400 shrink-0" />
                        )}
                        <div className="text-left min-w-0">
                            <p className="text-[11px] font-semibold text-slate-700 truncate">
                                {uploadedMeta ? uploadedMeta.name : (coverUrl ? "Custom Cover Active" : "Click or drag cover here")}
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

export default function ImageManagementClient({ initialImages, initialAlbums }: Props) {
    const [activeTab, setActiveTab] = useState<"IMAGES" | "ALBUMS">("IMAGES");
    const [images, setImages] = useState<GalleryImage[]>(initialImages);
    const [albums, setAlbums] = useState<GalleryAlbum[]>(initialAlbums);

    // Image-specific modal/form state
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    // Form states (Images)
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("other");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [replaceFile, setReplaceFile] = useState<File | null>(null);

    // Album-specific modal/form state
    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);

    // Form states (Albums)
    const [albumTitle, setAlbumTitle] = useState("");
    const [albumDescription, setAlbumDescription] = useState("");
    const [albumCategory, setAlbumCategory] = useState("social");
    const [albumDate, setAlbumDate] = useState("");
    const [albumCoverImage, setAlbumCoverImage] = useState("");
    const [albumImages, setAlbumImages] = useState(""); // Google Photos Link

    const [isPending, startTransition] = useTransition();

    // IMAGE HANDLERS
    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Title is required.");
            return;
        }
        if (!selectedFile) {
            toast.error("Please select an image file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("file", selectedFile);

        startTransition(async () => {
            const res = await uploadImageAction(formData);
            if (res.error) {
                toast.error(res.error);
            } else if (res.success && res.image) {
                toast.success("Image uploaded successfully!");
                const newImg = {
                    ...res.image,
                    createdAt: new Date(res.image.createdAt),
                    updatedAt: new Date(res.image.updatedAt)
                };
                setImages(prev => [newImg, ...prev]);
                setTitle("");
                setDescription("");
                setCategory("other");
                setSelectedFile(null);
                setIsUploadOpen(false);
            }
        });
    };

    const handleEditClick = (image: GalleryImage) => {
        setSelectedImage(image);
        setTitle(image.title);
        setDescription(image.description || "");
        setCategory(image.category || "other");
        setReplaceFile(null);
        setIsEditOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedImage) return;
        if (!title.trim()) {
            toast.error("Title is required.");
            return;
        }

        startTransition(async () => {
            let res;
            if (replaceFile) {
                const formData = new FormData();
                formData.append("title", title);
                formData.append("description", description);
                formData.append("category", category);
                formData.append("file", replaceFile);
                res = await replaceImageAction(selectedImage.id, formData);
            } else {
                res = await updateImageAction({
                    id: selectedImage.id,
                    title,
                    description,
                    category
                });
            }

            if (res.error) {
                toast.error(res.error);
            } else if (res.success && res.image) {
                toast.success("Image updated successfully!");
                const updatedImg = {
                    ...res.image,
                    createdAt: new Date(res.image.createdAt),
                    updatedAt: new Date(res.image.updatedAt)
                };
                setImages(prev => prev.map(img => img.id === selectedImage.id ? updatedImg : img));
                setIsEditOpen(false);
                setSelectedImage(null);
                setReplaceFile(null);
            }
        });
    };

    const handleDeleteClick = (id: string) => {
        if (!confirm("Are you sure you want to delete this image permanently from storage and database? This action cannot be undone.")) {
            return;
        }

        startTransition(async () => {
            const res = await deleteImageAction(id);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Image deleted successfully!");
                setImages(prev => prev.filter(img => img.id !== id));
            }
        });
    };

    // ALBUM HANDLERS
    const handleAlbumEditClick = (album: GalleryAlbum) => {
        setEditingAlbum(album);
        setAlbumTitle(album.title || "");
        setAlbumDescription(album.description || "");
        setAlbumCategory(album.category || "social");
        setAlbumDate(album.date ? new Date(album.date).toISOString().split("T")[0] : "");
        setAlbumCoverImage(album.coverImage || "");
        setAlbumImages(album.images || "");
        setIsAlbumModalOpen(true);
    };

    const handleAlbumSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!albumTitle.trim()) {
            toast.error("Album title is required.");
            return;
        }
        if (!albumImages.trim()) {
            toast.error("Google Photos album link is required.");
            return;
        }

        const payload = {
            title: albumTitle.trim(),
            description: albumDescription.trim(),
            category: albumCategory,
            date: albumDate ? new Date(albumDate).toISOString() : undefined,
            coverImage: albumCoverImage.trim(),
            images: albumImages.trim()
        };

        startTransition(async () => {
            let res;
            if (editingAlbum) {
                res = await updateAlbumAction({
                    id: editingAlbum.id,
                    ...payload
                });
            } else {
                res = await createAlbumAction(payload);
            }

            if (res.error) {
                toast.error(res.error);
            } else if (res.success && res.album) {
                toast.success(editingAlbum ? "Album updated successfully!" : "Album created successfully!");
                
                const formattedAlbum: GalleryAlbum = {
                    id: res.album.id,
                    title: res.album.title,
                    description: res.album.description,
                    category: res.album.category,
                    date: res.album.date ? new Date(res.album.date) : null,
                    coverImage: res.album.coverImage,
                    images: res.album.images,
                    createdAt: new Date(res.album.createdAt)
                };

                if (editingAlbum) {
                    setAlbums(prev => prev.map(a => a.id === editingAlbum.id ? formattedAlbum : a));
                } else {
                    setAlbums(prev => [formattedAlbum, ...prev]);
                }
                setIsAlbumModalOpen(false);
            }
        });
    };

    const handleAlbumDeleteClick = (id: string, titleStr: string) => {
        if (!confirm(`Are you sure you want to delete album "${titleStr}"? This action cannot be undone.`)) {
            return;
        }

        startTransition(async () => {
            const res = await deleteAlbumAction(id);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Album deleted successfully!");
                setAlbums(prev => prev.filter(a => a.id !== id));
            }
        });
    };

    const sortedAlbums = [...albums].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
    });

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Gallery & Image Management</h2>
                    <p className="text-slate-500 mt-1">Manage public landing page images and member-only Google Photo albums.</p>
                </div>
                
                {activeTab === "IMAGES" ? (
                    <Button
                        onClick={() => {
                            setTitle("");
                            setDescription("");
                            setCategory("other");
                            setSelectedFile(null);
                            setIsUploadOpen(true);
                        }}
                        className="bg-emerald-800 hover:bg-emerald-950 text-white font-medium self-start sm:self-auto gap-2"
                    >
                        <Plus className="h-4 w-4" /> Upload Image
                    </Button>
                ) : (
                    <Button
                        onClick={() => {
                            setEditingAlbum(null);
                            setAlbumTitle("");
                            setAlbumDescription("");
                            setAlbumCategory("social");
                            setAlbumDate(new Date().toISOString().split("T")[0]);
                            setAlbumCoverImage("");
                            setAlbumImages("");
                            setIsAlbumModalOpen(true);
                        }}
                        className="bg-emerald-800 hover:bg-emerald-950 text-white font-medium self-start sm:self-auto gap-2"
                    >
                        <FolderPlus className="h-4 w-4" /> Add Member Album
                    </Button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("IMAGES")}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === "IMAGES"
                            ? "border-emerald-800 text-emerald-800"
                            : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                    }`}
                >
                    <Images size={16} />
                    Public Gallery Images ({images.length})
                </button>
                <button
                    onClick={() => setActiveTab("ALBUMS")}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === "ALBUMS"
                            ? "border-emerald-800 text-emerald-800"
                            : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                    }`}
                >
                    <FolderHeart size={16} />
                    Member Albums (Google Photos) ({albums.length})
                </button>
            </div>

            {/* TAB CONTENT: IMAGES */}
            {activeTab === "IMAGES" && (
                <>
                    {images.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {images.map((image) => (
                                <div key={image.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                                    <div>
                                        <div className="h-48 overflow-hidden relative bg-slate-100">
                                            <Image
                                                src={image.url}
                                                alt={image.title}
                                                width={600}
                                                height={400}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                            <Badge className="absolute top-3 left-3 bg-emerald-800 text-white border-0 hover:bg-emerald-800 shadow-sm capitalize">
                                                {getCategoryLabel(image.category)}
                                            </Badge>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <h3 className="font-heading text-lg font-bold text-slate-800 line-clamp-1">{image.title}</h3>
                                            {image.description ? (
                                                <p className="text-sm text-slate-500 line-clamp-2">{image.description}</p>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">No description provided</p>
                                            )}
                                            <div className="text-xs text-slate-400 font-medium">
                                                Size: {(image.fileSize / 1024 / 1024).toFixed(2)} MB • {image.mimeType.split("/")[1].toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditClick(image)}
                                            className="flex-1 gap-1.5 text-slate-700 hover:text-emerald-800"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" /> Edit / Replace
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteClick(image.id)}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-slate-200 hover:border-red-200"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
                            <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-800">No images uploaded yet</h3>
                            <p className="text-slate-500 mt-1 max-w-sm mx-auto">Upload the first image stored directly in Supabase Storage to show on the public gallery.</p>
                        </div>
                    )}
                </>
            )}

            {/* TAB CONTENT: ALBUMS */}
            {activeTab === "ALBUMS" && (
                <>
                    {sortedAlbums.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {sortedAlbums.map((album) => (
                                <div key={album.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                                    <div>
                                        <div className="h-48 overflow-hidden relative bg-slate-100">
                                            <Image
                                                src={album.coverImage || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=400&fit=crop"}
                                                alt={album.title || "Album Cover"}
                                                width={600}
                                                height={400}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                            <Badge className="absolute top-3 left-3 bg-emerald-800 text-white border-0 hover:bg-emerald-800 shadow-sm capitalize">
                                                {getCategoryLabel(album.category)}
                                            </Badge>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-heading text-lg font-bold text-slate-800 line-clamp-1">{album.title}</h3>
                                                <a
                                                    href={album.images}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-slate-400 hover:text-emerald-800 shrink-0"
                                                    title="View album photos"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            </div>
                                            {album.description ? (
                                                <p className="text-sm text-slate-500 line-clamp-2">{album.description}</p>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">No description provided</p>
                                            )}
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                <Calendar size={13} />
                                                {album.date ? new Date(album.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "No date"}
                                            </div>
                                            <div className="text-[11px] text-slate-400 truncate max-w-full font-medium" title={album.images}>
                                                Link: <span className="text-emerald-850 hover:underline">{album.images}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAlbumEditClick(album)}
                                            className="flex-1 gap-1.5 text-slate-700 hover:text-emerald-800"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" /> Edit Album
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAlbumDeleteClick(album.id, album.title || "")}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-slate-200 hover:border-red-200"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
                            <FolderHeart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-800">No member albums created yet</h3>
                            <p className="text-slate-500 mt-1 max-w-sm mx-auto">Link Google Photos albums for members to easily view, find, and download photos.</p>
                        </div>
                    )}
                </>
            )}

            {/* MODAL: IMAGE UPLOAD */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Upload className="h-5 w-5 text-emerald-800" /> Upload Image
                            </h3>
                            <button
                                onClick={() => setIsUploadOpen(false)}
                                className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-slate-700 font-medium">Image Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter a descriptive title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Provide a description or location details"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-slate-700 font-medium">Category</Label>
                                <select
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-800"
                                    disabled={isPending}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="file" className="text-slate-700 font-medium">File Upload *</Label>
                                <ImageDropzone
                                    id="file"
                                    file={selectedFile}
                                    onFileSelected={setSelectedFile}
                                    hint="JPEG, PNG, WEBP, AVIF or GIF up to 10MB"
                                    label="Click or drag an image here to upload"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsUploadOpen(false)}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-emerald-800 hover:bg-emerald-950 text-white font-medium gap-1.5"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                                        </>
                                    ) : (
                                        "Upload"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: IMAGE EDIT / REPLACE */}
            {isEditOpen && selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <Edit2 className="h-5 w-5 text-emerald-800" /> Edit Image Details
                            </h3>
                            <button
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setSelectedImage(null);
                                    setReplaceFile(null);
                                }}
                                className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-title" className="text-slate-700 font-medium">Image Title *</Label>
                                <Input
                                    id="edit-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-description" className="text-slate-700 font-medium">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-category" className="text-slate-700 font-medium">Category</Label>
                                <select
                                    id="edit-category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-800"
                                    disabled={isPending}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <Label className="text-slate-700 font-semibold block">Replace Image File (Optional)</Label>
                                <p className="text-xs text-slate-500 mb-2">Leave empty to keep the current file. Uploading a new file will delete the old file from storage.</p>

                                <div className="flex items-center gap-4 mb-3">
                                    <div className="h-16 w-16 relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                                        <Image
                                            src={selectedImage.url}
                                            alt="Current image preview"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="text-xs text-slate-400">
                                        <p className="font-medium text-slate-500">Current file size:</p>
                                        <p>{(selectedImage.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>

                                <ImageDropzone
                                    id="replace-file"
                                    file={replaceFile}
                                    onFileSelected={setReplaceFile}
                                    compact
                                    label="Click or drag a new image here to replace it"
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditOpen(false);
                                        setSelectedImage(null);
                                        setReplaceFile(null);
                                    }}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-emerald-800 hover:bg-emerald-950 text-white font-medium gap-1.5"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: ALBUM ADD / EDIT */}
            {isAlbumModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <FolderPlus className="h-5 w-5 text-emerald-800" /> {editingAlbum ? "Edit Member Album" : "Add Member Album"}
                            </h3>
                            <button
                                onClick={() => setIsAlbumModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAlbumSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="album-title" className="text-slate-700 font-medium">Album Title *</Label>
                                <Input
                                    id="album-title"
                                    placeholder="e.g. Hiking Adventure in Aberdares"
                                    value={albumTitle}
                                    onChange={(e) => setAlbumTitle(e.target.value)}
                                    required
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="album-description" className="text-slate-700 font-medium">Description</Label>
                                <Textarea
                                    id="album-description"
                                    placeholder="Brief description about what this album contains"
                                    value={albumDescription}
                                    onChange={(e) => setAlbumDescription(e.target.value)}
                                    rows={3}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="album-category" className="text-slate-700 font-medium">Category</Label>
                                    <select
                                        id="album-category"
                                        value={albumCategory}
                                        onChange={(e) => setAlbumCategory(e.target.value)}
                                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-800"
                                        disabled={isPending}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="album-date" className="text-slate-700 font-medium">Event Date</Label>
                                    <Input
                                        id="album-date"
                                        type="date"
                                        value={albumDate}
                                        onChange={(e) => setAlbumDate(e.target.value)}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="album-cover" className="text-slate-700 font-medium">Cover Image URL (Optional)</Label>
                                <Input
                                    id="album-cover"
                                    placeholder="https://images.unsplash.com/... or empty for default cover"
                                    value={albumCoverImage}
                                    onChange={(e) => setAlbumCoverImage(e.target.value)}
                                    disabled={isPending}
                                />
                            </div>

                            <SmallAlbumCoverUpload
                                coverUrl={albumCoverImage}
                                onUploadSuccess={(url) => setAlbumCoverImage(url)}
                                disabled={isPending}
                            />

                            <div className="space-y-1.5">
                                <Label htmlFor="album-link" className="text-slate-700 font-medium">Google Photos Link *</Label>
                                <div className="relative">
                                    <Input
                                        id="album-link"
                                        placeholder="https://photos.app.goo.gl/..."
                                        value={albumImages}
                                        onChange={(e) => setAlbumImages(e.target.value)}
                                        required
                                        className="pl-9"
                                        disabled={isPending}
                                    />
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium">Members will open this link when viewing the album from their dashboard.</p>
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAlbumModalOpen(false)}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-emerald-800 hover:bg-emerald-950 text-white font-medium gap-1.5"
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        "Save Album"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}