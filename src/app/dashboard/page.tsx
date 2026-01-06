"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ArgumentCard from "@/components/Dashboard/ArgumentCard";
import { Plus, Loader2, Search, X, Filter, SortAsc, Star, Clock, Check } from "lucide-react";
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
}

const DashboardPage = () => {
    const { data: session } = useSession();
    const [argumentsList, setArgumentsList] = useState<Argument[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("APPROVED");
    const [sortBy, setBy] = useState<"date" | "rating">("rating");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArgument, setEditingArgument] = useState<Argument | null>(null);
    const [isChatMode, setIsChatMode] = useState(true);
    const [chatMessages, setChatMessages] = useState<
        { role: "user" | "assistant"; content: string }[]
    >([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);

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
        } catch (err) {
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
            setChatMessages([]);
            setChatInput("");
            fetchArguments();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleChatSend = async () => {
        if (!chatInput.trim()) return;
        const nextMessages = [...chatMessages, { role: "user", content: chatInput.trim() }];
        setChatMessages(nextMessages);
        setChatInput("");
        setChatLoading(true);
        try {
            const res = await fetch("/api/arguments/assist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: nextMessages,
                    currentDraft: formData,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Assistant error");

            setChatMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.message || "D'accord, continuons." },
            ]);
            if (data.draft?.title || data.draft?.impact || data.draft?.maieutique) {
                setFormData((prev) => ({
                    title: data.draft.title ?? prev.title,
                    impact: data.draft.impact ?? prev.impact,
                    maieutique: data.draft.maieutique ?? prev.maieutique,
                }));
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setChatLoading(false);
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
            setChatMessages([]);
            setChatInput("");
            setIsChatMode(false);
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
        } catch (err) {
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
            if (sortBy === "rating") return b.averageRating - a.averageRating;
            return b.id.localeCompare(a.id); // Approximation of date if id is cuid
        });

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-semibold text-[var(--ink)] mb-2 font-display">Arguments de vente</h1>
                    <p className="text-[var(--ink-muted)] max-w-xl">Maîtrisez l'art de la maïeutique et l'impact psychologique pour transformer vos conversations.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-[var(--paper-2)] border border-[var(--line)] rounded-2xl pl-12 pr-4 py-3 text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] w-full md:w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingArgument(null);
                            setFormData({ title: "", impact: "", maieutique: "" });
                            setChatMessages([]);
                            setChatInput("");
                            setIsChatMode(true);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[#cf4f1e] text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={20} />
                        Proposer
                    </button>
                </div>
            </div>

            {isAdmin && (
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-[var(--paper-2)] p-4 rounded-2xl border border-[var(--line)] backdrop-blur-md">
                    <div className="flex gap-2 p-1 bg-white/60 rounded-xl border border-[var(--line)]">
                        {[
                            { id: "APPROVED", label: "Validés", icon: Check },
                            { id: "PENDING", label: "En attente", icon: Clock },
                            { id: "ALL", label: "Tout voir", icon: Filter },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${statusFilter === tab.id
                                    ? "bg-[var(--accent-soft)] text-[var(--ink)] shadow-sm"
                                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                                    }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[var(--ink-muted)] text-sm">
                            <SortAsc size={14} />
                            Trier par :
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setBy("date")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === "date" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-white/60 text-[var(--ink-muted)] hover:bg-white"
                                    }`}
                            >
                                Date
                            </button>
                            <button
                                onClick={() => setBy("rating")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${sortBy === "rating" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-white/60 text-[var(--ink-muted)] hover:bg-white"
                                    }`}
                            >
                                <Star size={12} /> Popularité
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!isAdmin && (
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[var(--ink-muted)] text-sm">
                            <SortAsc size={14} />
                            Trier par :
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setBy("date")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === "date" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-white/60 text-[var(--ink-muted)] hover:bg-white"
                                    }`}
                            >
                                Date
                            </button>
                            <button
                                onClick={() => setBy("rating")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${sortBy === "rating" ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-white/60 text-[var(--ink-muted)] hover:bg-white"
                                    }`}
                            >
                                <Star size={12} /> Popularité
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-[var(--accent)]" size={48} />
                </div>
            ) : sortedAndFilteredArguments.length === 0 ? (
                <div className="text-center py-32 bg-white/70 rounded-3xl border border-dashed border-[var(--line)]">
                    <p className="text-[var(--ink-muted)] italic">Aucun argument trouvé.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedAndFilteredArguments.map((arg) => (
                        <ArgumentCard
                            key={arg.id}
                            argument={arg}
                            onVote={handleVote}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <GlassCard className="w-full max-w-2xl relative z-10 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-semibold text-[var(--ink)] font-display">
                                {editingArgument ? "Modifier l'argument" : "Proposer un argument"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between mb-6 gap-4">
                            <div className="text-sm text-white/50">
                                {isChatMode ? "Assistant IA actif" : "Edition manuelle"}
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsChatMode((prev) => !prev)}
                                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold uppercase tracking-widest hover:bg-white/20 transition-all"
                            >
                                {isChatMode ? "Passer en édition" : "Activer l'assistant IA"}
                            </button>
                        </div>

                        {isChatMode && (
                            <div className="mb-6 space-y-4">
                                <div className="h-64 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-4 space-y-4">
                                    {chatMessages.length === 0 ? (
                                        <p className="text-sm text-white/40">
                                            Décrivez votre contexte commercial : cible, douleur client, bénéfice clé.
                                        </p>
                                    ) : (
                                        chatMessages.map((msg, index) => (
                                            <div
                                                key={`${msg.role}-${index}`}
                                                className={`rounded-2xl px-4 py-3 text-sm ${msg.role === "assistant"
                                                    ? "bg-indigo-500/20 text-indigo-100"
                                                    : "bg-white/10 text-white"
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Ex: Nos clients veulent réduire leurs coûts d'exploitation..."
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleChatSend}
                                        disabled={chatLoading}
                                        className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {chatLoading ? "..." : "Envoyer"}
                                    </button>
                                </div>
                                <div className="text-xs text-white/40">
                                    L'assistant prépare un brouillon automatique dans les champs ci-dessous.
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-widest ml-1">Titre (Argument)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-[var(--paper-2)] border border-[var(--line)] rounded-xl px-4 py-3 text-[var(--ink)] focus:ring-2 focus:ring-[var(--accent-soft)] outline-none transition-all"
                                    placeholder="ex: Mobilité & Accès Full Web"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-widest ml-1">Impact (Psychologie)</label>
                                <textarea
                                    required
                                    value={formData.impact}
                                    onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                    className="w-full bg-[var(--paper-2)] border border-[var(--line)] rounded-xl px-4 py-3 text-[var(--ink)] focus:ring-2 focus:ring-[var(--accent-soft)] outline-none transition-all h-24 resize-none"
                                    placeholder="La raison psychologique pour laquelle cela fonctionne..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-widest ml-1">Question Maïeutique (Action)</label>
                                <textarea
                                    required
                                    value={formData.maieutique}
                                    onChange={(e) => setFormData({ ...formData, maieutique: e.target.value })}
                                    className="w-full bg-[var(--paper-2)] border border-[var(--line)] rounded-xl px-4 py-3 text-[var(--accent-2)] font-medium focus:ring-2 focus:ring-[var(--accent-soft)] outline-none transition-all h-24 resize-none placeholder:text-[var(--accent-2)] placeholder:opacity-50"
                                    placeholder="La question ouverte que le commercial doit poser..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 rounded-xl bg-white/70 text-[var(--ink)] font-bold hover:bg-white transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 rounded-xl bg-[var(--ink)] text-[var(--paper)] font-bold hover:bg-[var(--ink-muted)] transition-all shadow-xl active:scale-95"
                                >
                                    {editingArgument ? "Enregistrer" : "Créer l'argument"}
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-[var(--ink-muted)] italic">
                                * Les nouveaux arguments sont soumis à validation par un administrateur avant d'être visibles par tous.
                            </p>
                        </form>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
