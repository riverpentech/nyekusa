"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export const COURSES = [
    "Bachelor of Business Administration (BBA)",
    "Bachelor of Commerce (BCom)",
    "Bachelor of Science in Actuarial Science",
    "Bachelor of Purchasing and Supplies Management",
    "Bachelor of Business Information Technology (BBIT)",
    "Bachelor of Science in Computer Science",
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Software Engineering",
    "Bachelor of Science in Cybersecurity",
    "Bachelor of Science in Data Science/AI",
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Electrical and Electronic Engineering",
    "Bachelor of Science in Mechanical Engineering",
    "Bachelor of Science in Mechatronics Engineering",
    "Bachelor of Science in Chemical Engineering",
    "Bachelor of Education Technology in Civil Engineering",
    "Bachelor of Education Technology in Electrical and Electronic Engineering",
    "Bachelor of Education Technology in Mechanical Engineering",
    "Bachelor of Technology in Building Technology",
    "Bachelor of Science in Geomatics Engineering and Geospatial Information Systems",
    "Bachelor of Science in Geospatial Information Science and Remote Sensing",
    "Bachelor of Science in Geology",
    "Bachelor of Science in Industrial Chemistry",
    "Bachelor of Science in Food Science and Technology",
    "Bachelor of Science in Nutrition and Dietetics",
    "Bachelor of Science in Nursing",
    "Bachelor of Science in Nursing (Upgrading for Registered Nurses)",
    "Bachelor of Science in Leather Technology",
    "Bachelor of Sustainable Tourism and Hospitality Management",
    "Bachelor of Science in Criminology and Security Management",
    "Master of Business Administration (MBA)",
    "Master of Science in Economics",
    "Master of Science in Supply Chain Management",
    "Master of Science in Telecommunication Engineering",
    "Master of Science in Data Science",
    "Master of Science in Manufacturing Systems and Automation",
    "Doctor of Philosophy (PhD) in Business Administration and Management",
    "Doctor of Philosophy (PhD) in Economics",
    "Doctor of Philosophy (PhD) in Engineering (various disciplines)",
    "Postgraduate Diploma in Business Administration",
    "Postgraduate Diploma in Education",
    "Diploma in Building Technology",
    "Diploma in Sustainable Tourism and Hospitality Management",
    "Diploma in Coffee Technology",
    "Certificate in Building Technology",
    "Certificate in Coffee Technology",
    "CPA (Sections I–VI)",
    "ACCA (Association of Chartered Certified Accountants)",
    "Accounting Technicians Certificate (ATC)",
    "Associate in Procurement and Supply of Kenya (APS-K)",
    "Certified Procurement and Supply Professional of Kenya (CPSP-K)",
    "Siemens Mechatronics Systems Certification Program (SMSCP) Levels 1–3",
    "Dedan Kimathi University Course..."
];

interface CourseSelectProps {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
    error?: string;
    placeholder?: string;
}

export default function CourseSelect({
    value,
    onChange,
    disabled,
    error,
    placeholder = "Select your course..."
}: CourseSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [customFallback, setCustomFallback] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize custom input state if value is custom or matched to fallback
    useEffect(() => {
        if (value) {
            const isDefaultCourse = COURSES.includes(value);
            if (!isDefaultCourse) {
                setShowCustomInput(true);
                setCustomFallback(value);
            } else if (value === "Dedan Kimathi University Course...") {
                setShowCustomInput(true);
                setCustomFallback("");
            } else {
                setShowCustomInput(false);
            }
        } else {
            setShowCustomInput(false);
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCourses = COURSES.filter(course =>
        course.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (course: string) => {
        if (course === "Dedan Kimathi University Course...") {
            setShowCustomInput(true);
            onChange("Dedan Kimathi University Course...");
        } else {
            setShowCustomInput(false);
            onChange(course);
        }
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomFallback(val);
        onChange(val || "Dedan Kimathi University Course...");
    };

    return (
        <div ref={containerRef} className="relative w-full text-left">
            {!showCustomInput ? (
                <div>
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        disabled={disabled}
                        className={`flex w-full items-center justify-between rounded-lg border bg-transparent px-3 py-2 text-sm outline-none transition-all cursor-pointer ${
                            error ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"
                        } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-slate-350"}`}
                    >
                        <span className={`truncate ${value ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                            {value || placeholder}
                        </span>
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2 animate-none" />
                    </button>
                </div>
            ) : (
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        required
                        value={customFallback}
                        onChange={handleCustomChange}
                        disabled={disabled}
                        placeholder="Enter your course title..."
                        className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none transition-all ${
                            error ? "border-red-500 focus:border-red-500" : "border-slate-200 focus:border-emerald-500"
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setShowCustomInput(false);
                            onChange("");
                        }}
                        className="p-2 border border-slate-200 hover:border-red-500 hover:text-red-500 rounded-lg text-slate-400 transition-colors"
                        title="Choose from list"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {isOpen && !showCustomInput && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-150 bg-white p-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150 max-h-60 flex flex-col">
                    <div className="relative flex items-center border-b border-slate-100 px-2.5 py-1.5 shrink-0">
                        <Search className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder-slate-400"
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 py-1 divide-y divide-slate-50/50">
                        {filteredCourses.length === 0 ? (
                            <p className="p-3 text-xs text-slate-400 text-center">No matching courses found.</p>
                        ) : (
                            filteredCourses.map((course, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelect(course)}
                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 hover:text-emerald-950 transition-colors ${
                                        value === course ? "bg-emerald-50/70 font-semibold text-emerald-900" : "text-slate-700"
                                    }`}
                                >
                                    {course}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
