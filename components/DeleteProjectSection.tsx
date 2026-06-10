// components/DeleteProjectSection.tsx
"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteProjectSectionProps {
    projectTitle: string;
    status: string;
    deleteProjectAction: () => Promise<void>;
}

export default function DeleteProjectSection({
    projectTitle,
    status,
    deleteProjectAction,
}: DeleteProjectSectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmationInput, setConfirmationInput] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [isPending, startTransition] = useTransition();

    const isInProgress = status === "in-progress";

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (isInProgress && (confirmationInput !== projectTitle || !isChecked)) {
            return;
        }
        startTransition(async () => {
            await deleteProjectAction();
        });
    };

    const isConfirmDisabled =
        isPending ||
        (isInProgress && (confirmationInput !== projectTitle || !isChecked));

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900/20 hover:border-red-500/40 px-5 py-3 text-sm font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.02)] cursor-pointer"
            >
                <Trash2 className="h-4 w-4" /> Delete Project
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="relative glass-card max-w-md w-full rounded-2xl p-6 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] flex flex-col gap-4">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-2.5 text-red-400 font-bold text-lg">
                                <AlertTriangle className="h-5.5 w-5.5 shrink-0" />
                                <h3>Delete Active Project?</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-900"
                            >
                                <X className="h-4.5 w-4.5" />
                            </button>
                        </div>

                        {/* Message */}
                        <div className="text-sm text-gray-400 leading-relaxed flex flex-col gap-3">
                            <p>
                                You are about to permanently delete the project <span className="text-white font-semibold">"{projectTitle}"</span>. 
                                This action is <span className="text-red-400 font-semibold">irreversible</span> and will delete all application histories and close active workspace chats.
                            </p>
                            {isInProgress && (
                                <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-xs text-red-300 flex flex-col gap-2">
                                    <span className="font-bold uppercase tracking-wider text-[10px]">⚠️ Collaboration in Progress</span>
                                    This project is currently active with an accepted student collaborator. 
                                    Deleting it requires confirmation that you have aligned with them.
                                </div>
                            )}
                        </div>

                        {/* Confirmation Form */}
                        <form onSubmit={handleDelete} className="flex flex-col gap-4 mt-2">
                            {isInProgress && (
                                <>
                                    <div className="flex items-start gap-2.5">
                                        <input
                                            type="checkbox"
                                            id="confirm-check"
                                            checked={isChecked}
                                            onChange={(e) => setIsChecked(e.target.checked)}
                                            className="mt-1 rounded border-gray-800 bg-gray-900 text-indigo-600 focus:ring-indigo-500/50"
                                        />
                                        <label htmlFor="confirm-check" className="text-xs text-gray-400 leading-normal select-none cursor-pointer">
                                            I confirm that I have obtained my collaborator's consent to delete this active project.
                                        </label>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="confirm-title" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Type project title to confirm:
                                        </label>
                                        <input
                                            type="text"
                                            id="confirm-title"
                                            value={confirmationInput}
                                            onChange={(e) => setConfirmationInput(e.target.value)}
                                            className="w-full rounded-xl border border-gray-900 bg-gray-900/10 p-3 text-sm text-gray-200 placeholder-gray-700 focus:border-red-500/50 focus:ring-0 focus:outline-none focus:bg-gray-900/20 transition-all"
                                            placeholder={projectTitle}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-800 bg-gray-950/40 text-xs font-semibold text-gray-300 hover:bg-gray-900/60 hover:text-white transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isConfirmDisabled}
                                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-xs font-bold text-white transition-all shadow-[0_4px_15px_rgba(239,68,68,0.25)] flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    {isPending ? "Deleting..." : "Permanently Delete"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
