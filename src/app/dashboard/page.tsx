"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import ArgumentCard from "@/components/Dashboard/ArgumentCard";
import { Plus, Loader2, Search, X, Filter, SortAsc, Star, Clock, Check, ChevronLeft, ChevronRight } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import toast from "react-hot-toast";

interface Argument {
    id: string;
    title: string;
    impact: string;
    maieutique: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    averageRating: number;
    userVote?: number;
    userId: string;
    userName?: string;
    createdAt?: string;
}

const DashboardPage = () => {
    const { data: session } = useSession();
    const [argumentsList, setArgumentsList] = useState<Argument[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("APPROVED");
    const [activeTab, setActiveTab] = useState<"TOP_RATED" | "RECENT">("TOP_RATED");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArgument, setEditingArgument] = useState<Argument | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

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
            if (Array.isArray(data)) {
                setArgumentsList(data);
            } else {
                console.error("API did not return an array:", data);
                setArgumentsList([]);
            }
        } catch (err) {
            console.error("Failed to fetch arguments", err);
            setArgumentsList([]);
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
            toast.error("Erreur lors du vote");
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/arguments/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error("Status update failed");

            toast.success(status === "APPROVED" ? "Argument approuvé !" : "Argument refusé.");
            fetchArguments();
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("Erreur lors de la modération");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingArgument
            ? `/api/arguments/${editingArgument.id}`
            : "/api/arguments";
        const method = editingArgument ? "PATCH" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");

            toast.success(editingArgument ? "Argument modifié !" : "Argument envoyé pour validation !");
            setIsModalOpen(false);
            setEditingArgument(null);
            setFormData({ title: "", impact: "", maieutique: "" });
            fetchArguments();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur lors de l'enregistrement";
            toast.error(message);
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
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet argument ?")) return;
        try {
            const res = await fetch(`/api/arguments/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Argument supprimé");
            fetchArguments();
        } catch (error) {
            console.error("Failed to delete argument", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    const sortedAndFilteredArguments = argumentsList
        .filter((arg) => {
            const matchesSearch =
                arg.title.toLowerCase().includes(search.toLowerCase()) ||
                arg.impact.toLowerCase().includes(search.toLowerCase()) ||
                arg.maieutique.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = isAdmin ?
                (statusFilter === "ALL" ? true : arg.status === statusFilter) :
                true; // API already filters for non-admins

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (activeTab === "TOP_RATED") return b.averageRating - a.averageRating;
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

    const scrollCarousel = (direction: "prev" | "next") => {
        const container = carouselRef.current;
        if (!container) return;
        const scrollAmount = container.clientWidth * 0.8;
        container.scrollBy({
            left: direction === "next" ? scrollAmount : -scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold">Playbook Ulysse</p>
                        <h1 className="text-4xl font-black text-white leading-tight">Arguments de Vente</h1>
                        <p className="text-white/70 text-lg">
                            Une galerie inspirée pour trouver l&apos;angle parfait : classez par meilleures notes ou dernières idées validées.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-semibold flex items-center gap-2">
                                <Star size={14} className="text-amber-300" />
                                Top rated
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-xs font-semibold flex items-center gap-2">
                                <Clock size={14} className="text-cyan-300" />
                                Plus récentes
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full lg:w-auto">
                        <div className="relative group flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Rechercher un argument..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full transition-all"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setEditingArgument(null);
                                setFormData({ title: "", impact: "", maieutique: "" });
                                setIsModalOpen(true);
                            }}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
                        >
                            <Plus size={20} />
                            Proposer
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex gap-6 border-b border-white/10">
                        {[
                            { id: "TOP_RATED", label: "Top Rated", description: "Les mieux notés" },
                            { id: "RECENT", label: "Plus récentes", description: "Les dernières" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as "TOP_RATED" | "RECENT")}
                                className={`relative pb-3 text-left transition-colors ${activeTab === tab.id ? "text-white" : "text-white/50 hover:text-white/70"}`}
                            >
                                <p className="text-base font-semibold">{tab.label}</p>
                                <p className="text-xs text-white/40">{tab.description}</p>
                                {activeTab === tab.id && (
                                    <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                    {isAdmin && (
                        <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
                            {[
                                { id: "APPROVED", label: "Validés", icon: Check },
                                { id: "PENDING", label: "En attente", icon: Clock },
                                { id: "ALL", label: "Tout voir", icon: Filter },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatusFilter(tab.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === tab.id
                                        ? "bg-white/10 text-white shadow-sm"
                                        : "text-white/50 hover:text-white/70"
                                        }`}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between text-white/50 text-sm">
                    <div className="flex items-center gap-2">
                        <SortAsc size={14} />
                        {activeTab === "TOP_RATED" ? "Classé par note moyenne décroissante" : "Classé par date de création"}
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {sortedAndFilteredArguments.length} argument{sortedAndFilteredArguments.length > 1 ? "s" : ""} affiché{sortedAndFilteredArguments.length > 1 ? "s" : ""}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-500" size={48} />
                </div>
            ) : sortedAndFilteredArguments.length === 0 ? (
                <div className="text-center py-32 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-white/40 italic">Aucun argument trouvé.</p>
                </div>
            ) : (
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center justify-start pointer-events-none">
                        <div className="w-16 h-full bg-gradient-to-r from-[#020617] to-transparent" />
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center justify-end pointer-events-none">
                        <div className="w-16 h-full bg-gradient-to-l from-[#020617] to-transparent" />
                    </div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <p className="text-white/70 text-sm">Glissez pour parcourir les arguments</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => scrollCarousel("prev")}
                                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Voir les cartes précédentes"
                            >
                                <span className="sr-only">Précédent</span>
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => scrollCarousel("next")}
                                className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Voir les cartes suivantes"
                            >
                                <span className="sr-only">Suivant</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                    <div
                        ref={carouselRef}
                        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
                        role="list"
                        aria-label="Liste des arguments en carrousel"
                    >
                        {sortedAndFilteredArguments.map((arg) => (
                            <div key={arg.id} className="snap-start min-w-[320px] max-w-[420px] flex-1">
                                <ArgumentCard
                                    argument={arg}
                                    onVote={handleVote}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onStatusChange={handleStatusChange}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <GlassCard className="w-full max-w-2xl relative z-10 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-white">
                                {editingArgument ? "Modifier l'argument" : "Proposer un argument"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest ml-1">Titre (Argument)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="ex: Mobilité & Accès Full Web"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest ml-1">Impact (Psychologie)</label>
                                <textarea
                                    required
                                    value={formData.impact}
                                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all h-24 resize-none"
                                    placeholder="La raison psychologique pour laquelle cela fonctionne..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest ml-1">Question Maïeutique (Action)</label>
                                <textarea
                                    required
                                    value={formData.maieutique}
                                    onChange={(e) => setFormData({ ...formData, maieutique: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-indigo-400 font-medium focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all h-24 resize-none placeholder:text-indigo-400/30"
                                    placeholder="La question ouverte que le commercial doit poser..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                                >
                                    {editingArgument ? "Enregistrer" : "Créer l'argument"}
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-white/30 italic">
                                * Les nouveaux arguments sont soumis à validation par un administrateur avant d&apos;être visibles par tous.
                            </p>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
