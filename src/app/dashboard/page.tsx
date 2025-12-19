"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ArgumentCard from "@/components/Dashboard/ArgumentCard";
import { Plus, Loader2, Search, X } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

interface Argument {
    id: string;
    title: string;
    impact: string;
    maieutique: string;
    averageRating: number;
    userVote?: number;
    userId: string;
    userName?: string;
}

const DashboardPage = () => {
    const { data: session } = useSession();
    const [argumentsList, setArgumentsList] = useState<Argument[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArgument, setEditingArgument] = useState<Argument | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        impact: "",
        maieutique: "",
    });

    const fetchArguments = async () => {
        try {
            const res = await fetch("/api/arguments");
            const data = await res.json();
            setArgumentsList(data);
        } catch (err) {
            console.error("Failed to fetch arguments", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArguments();
    }, []);

    const handleVote = async (argumentId: string, value: number) => {
        if (!session) return;
        try {
            await fetch("/api/votes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ argumentId, value }),
            });
            fetchArguments(); // Refresh to get new averages
        } catch (err) {
            console.error("Failed to vote", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingArgument
            ? `/api/arguments/${editingArgument.id}`
            : "/api/arguments";
        const method = editingArgument ? "PATCH" : "POST";

        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            setIsModalOpen(false);
            setEditingArgument(null);
            setFormData({ title: "", impact: "", maieutique: "" });
            fetchArguments();
        } catch (err) {
            console.error("Failed to save argument", err);
        }
    };

    const handleEdit = (id: string) => {
        const arg = argumentsList.find((a) => a.id === id);
        if (arg) {
            setEditingArgument(arg);
            setFormData({
                title: arg.title,
                impact: arg.impact,
                maieutique: arg.maieutique,
            });
            setIsModalOpen(true);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this argument?")) return;
        try {
            await fetch(`/api/arguments/${id}`, { method: "DELETE" });
            fetchArguments();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const filteredArguments = argumentsList.filter((arg) =>
        arg.title.toLowerCase().includes(search.toLowerCase()) ||
        arg.impact.toLowerCase().includes(search.toLowerCase()) ||
        arg.maieutique.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Sales Arguments</h1>
                    <p className="text-white/60">Master the art of maieutic and psychological impact.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search arguments..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingArgument(null);
                            setFormData({ title: "", impact: "", maieutique: "" });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} />
                        Add New
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredArguments.map((arg) => (
                        <ArgumentCard
                            key={arg.id}
                            argument={arg}
                            onVote={handleVote}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <GlassCard className="w-full max-w-2xl relative z-10 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">
                                {editingArgument ? "Edit Argument" : "Propose New Argument"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest ml-1">Title (Argument)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="e.g., Mobilité & Accès Full Web"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest ml-1">Impact (Psychology)</label>
                                <textarea
                                    required
                                    value={formData.impact}
                                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all h-24 resize-none"
                                    placeholder="The psychological reason why this works..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest ml-1">Maieutic Question (Action)</label>
                                <textarea
                                    required
                                    value={formData.maieutique}
                                    onChange={(e) => setFormData({ ...formData, maieutique: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-primary font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all h-24 resize-none placeholder:text-primary/30"
                                    placeholder="The open question the salesperson should ask..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                                >
                                    {editingArgument ? "Save Changes" : "Create Argument"}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
