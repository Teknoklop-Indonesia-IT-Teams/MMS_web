import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    hasError?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Pilih...",
    disabled = false,
    className = "",
    hasError = false,
}) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedLabel = options.find((o) => o.value === value)?.label || "";

    const filtered = query.trim()
        ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 50);
    }, [open]);

    const handleSelect = (val: string) => {
        onChange(val);
        setOpen(false);
        setQuery("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setQuery("");
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setOpen((p) => !p)}
                className={`w-full flex items-center justify-between px-3 py-2 border rounded-md text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                    ${hasError ? "border-red-500" : "border-gray-300 dark:border-gray-500"}
                    ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700" : "bg-white hover:bg-gray-50 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white cursor-pointer"}
                    ${open ? "ring-2 ring-blue-500 border-blue-500" : ""}`}
            >
                <span className={selectedLabel ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                    {disabled ? "Memuat data..." : (selectedLabel || placeholder)}
                </span>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                    {value && !disabled && (
                        <span onClick={handleClear} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-400 hover:text-gray-600">
                            <X size={12} />
                        </span>
                    )}
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg dark:bg-gray-700 dark:border-gray-600">
                    {/* Search input */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-600">
                        <Search size={14} className="text-gray-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Cari..."
                            className="w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none dark:text-white"
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 shrink-0">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Options list */}
                    <ul className="overflow-y-auto max-h-48">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-center text-gray-400">Tidak ditemukan</li>
                        ) : (
                            filtered.map((opt) => (
                                <li
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`px-3 py-2 text-sm cursor-pointer transition-colors
                                        ${opt.value === value
                                            ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900 dark:text-blue-200"
                                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"}`}
                                >
                                    {opt.label}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;