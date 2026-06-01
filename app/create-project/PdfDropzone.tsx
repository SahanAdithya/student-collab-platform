"use client";

import { useState, useRef } from "react";
import { FileUp, FileText, X } from "lucide-react";

export default function PdfDropzone() {
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                setFileName(file.name);
                if (inputRef.current) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    inputRef.current.files = dataTransfer.files;
                }
            } else {
                alert("Please upload a PDF file only.");
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === "application/pdf") {
                setFileName(file.name);
            } else {
                alert("Please upload a PDF file only.");
                if (inputRef.current) inputRef.current.value = "";
            }
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFileName(null);
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Project Specifications (PDF)
            </label>
            <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                className={`relative flex flex-col items-center justify-center rounded-xl border border-dashed p-6 transition-all cursor-pointer ${
                    dragActive
                        ? "border-indigo-500 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                        : "border-gray-800 bg-gray-900/10 hover:border-gray-700 hover:bg-gray-900/15"
                }`}
            >
                {/* Hidden File Input */}
                <input
                    ref={inputRef}
                    type="file"
                    name="specification"
                    accept="application/pdf"
                    onChange={handleChange}
                    className="hidden"
                />

                {fileName ? (
                    <div className="flex items-center gap-3 w-full max-w-sm bg-gray-950/40 border border-gray-900 rounded-xl p-3.5 relative z-10 backdrop-blur-sm">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-200 truncate">{fileName}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest font-semibold font-mono">PDF SPECIFICATION</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-900 bg-gray-950 hover:bg-gray-900 hover:border-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900/40 border border-gray-800 text-gray-400 shadow-inner">
                            <FileUp className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-gray-300">Drag & drop your PDF file here</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-semibold">or click to browse local files</p>
                    </div>
                )}
            </div>
        </div>
    );
}
