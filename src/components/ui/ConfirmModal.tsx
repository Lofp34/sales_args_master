"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    variant = "danger",
}: ConfirmModalProps) {
    const variantColors = {
        danger: "bg-red-600 hover:bg-red-500 text-white",
        warning: "bg-amber-500 hover:bg-amber-400 text-white",
        info: "bg-[var(--ink)] hover:bg-[var(--ink-muted)] text-[var(--paper)]",
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-600'}`}>
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--ink)] font-display">{title}</h3>
                        </div>

                        <p className="text-[var(--ink-muted)] text-sm mb-6 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 rounded-xl bg-white/70 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-white"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all active:scale-[0.98] ${variantColors[variant]}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
