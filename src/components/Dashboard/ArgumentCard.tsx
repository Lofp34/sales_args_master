"use client";

import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import VotingSystem from "./VotingSystem";
import { Edit2, Trash2, Quote, Check, X as CloseIcon, Clock, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Argument } from "@/types/argument";

interface ArgumentCardProps {
    argument: Argument;
    onVote: (id: string, value: number) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onStatusChange?: (id: string, status: "APPROVED" | "REJECTED") => void;
}

const ArgumentCard = ({
    argument,
    onVote,
    onEdit,
    onDelete,
    onStatusChange,
}: ArgumentCardProps) => {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="h-full"
        >
            <GlassCard className="flex flex-col h-full group relative overflow-hidden">
                <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[var(--accent-soft)] blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[rgba(31,111,92,0.12)] blur-3xl" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <h3 className="text-xl font-semibold text-[var(--ink)] leading-tight font-display">
                        {argument.title}
                    </h3>
                    {isAdmin && (
                        <div className="flex gap-2 opacity-70 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                            {argument.status === "PENDING" && (
                                <>
                                    <button
                                        onClick={() => onStatusChange?.(argument.id, "APPROVED")}
                                        title="Valider"
                                        className="p-1.5 rounded-full bg-[rgba(31,111,92,0.15)] text-[var(--accent-2)] hover:bg-[rgba(31,111,92,0.25)] transition-colors"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => onStatusChange?.(argument.id, "REJECTED")}
                                        title="Refuser"
                                        className="p-1.5 rounded-full bg-red-500/15 text-red-500 hover:bg-red-500/25 transition-colors"
                                    >
                                        <CloseIcon size={16} />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => onEdit?.(argument.id)}
                                className="p-1.5 rounded-full hover:bg-white/70 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => onDelete?.(argument.id)}
                                className="p-1.5 rounded-full hover:bg-white/70 text-red-500/70 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4 relative z-10">
                    {argument.status === "PENDING" && (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-[0.2em] px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 border border-amber-400/30">
                            <Clock size={10} /> En attente
                        </span>
                    )}
                    {argument.status === "APPROVED" && (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-[0.2em] px-2.5 py-1 rounded-full bg-[rgba(31,111,92,0.15)] text-[var(--accent-2)] border border-[rgba(31,111,92,0.35)]">
                            <Check size={10} /> Validé
                        </span>
                    )}
                    {argument.status === "REJECTED" && (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-semibold tracking-[0.2em] px-2.5 py-1 rounded-full bg-red-500/15 text-red-500 border border-red-400/30">
                            <AlertCircle size={10} /> Refusé
                        </span>
                    )}
                </div>

                <div className="flex-1 space-y-4 relative z-10">
                    <section>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--ink-muted)] font-semibold mb-2">
                            Impact
                        </p>
                        <p className="text-[var(--ink)] italic text-sm leading-relaxed opacity-80">
                            {argument.impact}
                        </p>
                    </section>

                    <section className="bg-white/70 rounded-xl p-4 border border-[var(--line)] relative overflow-hidden">
                        <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--ink-muted)] font-semibold mb-2">
                            Maïeutique
                        </p>
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Quote size={40} />
                        </div>
                        <p className="text-[var(--accent-2)] font-medium text-base relative z-10 leading-relaxed">
                            {argument.maieutique}
                        </p>
                    </section>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--line)] relative z-10">
                    <VotingSystem
                        initialRating={argument.averageRating}
                        userVote={argument.userVote}
                        onVote={(val: number) => onVote(argument.id, val)}
                        disabled={!session || argument.status !== "APPROVED"}
                    />
                    {(!session || argument.status !== "APPROVED") && (
                        <p className="text-[11px] text-[var(--ink-muted)] mt-2">
                            Vote ouvert après validation.
                        </p>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default ArgumentCard;
