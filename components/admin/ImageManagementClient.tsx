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
    Loader2
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
    deleteImageAction
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

type Props = {
    initialImages: GalleryImage[];
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

export default function ImageManagementClient({ initialImages }: Props) {
    const [images, setImages] = useState<GalleryImage[]>(initialImages);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [isPending, startTransition] = useTransition();

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("other");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [replaceFile, setReplaceFile] = useState<File | null>(null);

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Image Management</h2>
                    <p className="text-slate-500 mt-1">Upload, edit details, replace, and organize public gallery images.</p>
                </div>
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
            </div>

            {/* Gallery Image Grid */}
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

            {/* Custom Upload Modal */}
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

            {/* Custom Edit / Replace Modal */}
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
        </div>
    );
}