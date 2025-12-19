"use client";

import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import VotingSystem from "./VotingSystem";
import { Edit2, Trash2, Quote, Check, X as CloseIcon, Clock, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

interface ArgumentCardProps {
    argument: {
        id: string;
        title: string;
        impact: string;
        maieutique: string;
        status: "PENDING" | "APPROVED" | "REJECTED";
        averageRating: number;
        userVote?: number;
        userId: string;
    };
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
            <GlassCard className="flex flex-col h-full group">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white leading-tight">
                        {argument.title}
                    </h3>
                    {isAdmin && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {argument.status === "PENDING" && (
                                <>
                                    <button
                                        onClick={() => onStatusChange?.(argument.id, "APPROVED")}
                                        title="Valider"
                                        className="p-1.5 rounded-full bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => onStatusChange?.(argument.id, "REJECTED")}
                                        title="Refuser"
                                        className="p-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                    >
                                        <CloseIcon size={16} />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => onEdit?.(argument.id)}
                                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                onClick={() => onDelete?.(argument.id)}
                                className="p-1.5 rounded-full hover:bg-white/10 text-red-400/60 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mb-4">
                    {argument.status === "PENDING" && (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/20">
                            <Clock size={10} /> En attente
                        </span>
                    )}
                    {argument.status === "REJECTED" && (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/20">
                            <AlertCircle size={10} /> Refusé
                        </span>
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <section>
                        <p className="text-white/70 italic text-sm leading-relaxed">
                            {argument.impact}
                        </p>
                    </section>

                    <section className="bg-white/5 rounded-xl p-4 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Quote size={40} />
                        </div>
                        <p className="text-primary font-medium text-base relative z-10">
                            {argument.maieutique}
                        </p>
                    </section>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                    <VotingSystem
                        initialRating={argument.averageRating}
                        userVote={argument.userVote}
                        onVote={(val: number) => onVote(argument.id, val)}
                        disabled={!session || argument.status !== "APPROVED"}
                    />
                </div>
            </GlassCard>
        </motion.div>
    );
};

export default ArgumentCard;
