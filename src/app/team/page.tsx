"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { Shield, User, Loader2, UserPlus, Trash2, Power, PowerOff, Mail, Info, Search } from "lucide-react";
import AddMemberModal from "@/components/team/AddMemberModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import toast from "react-hot-toast";

interface UserData {
    id: string;
    email: string;
    name: string | null;
    role: string;
    active: boolean;
    createdAt: string;
}

const TeamPage = () => {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
            toast.error("Erreur lors de la récupération des membres");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user.role === "SUPER_ADMIN") {
            fetchUsers();
        }
    }, [session]);

    if (status === "loading") return null;
    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect("/dashboard");
    }

    const handleUpdateUser = async (id: string, updates: Partial<UserData>) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!res.ok) throw new Error("Update failed");

            toast.success("Membre mis à jour");
            fetchUsers();
        } catch (err) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Delete failed");

            toast.success("Membre supprimé");
            fetchUsers();
        } catch (err) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const RoleBadge = ({ role }: { role: string }) => {
        const styles = {
            SUPER_ADMIN: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30",
            ADMIN: "bg-amber-500/15 text-amber-600 border-amber-500/30",
            USER: "bg-[var(--paper-2)] text-[var(--ink-muted)] border-[var(--line)]",
        };
        return (
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${styles[role as keyof typeof styles]}`}>
                {role === 'USER' ? 'Utilisateur' : role}
            </span>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-semibold text-[var(--ink)] mb-2 font-display">Gestion de l'équipe</h1>
                    <p className="text-[var(--ink-muted)]">Gérez les membres, les rôles et les permissions de votre équipe.</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-muted)]" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[var(--paper-2)] border border-[var(--line)] rounded-xl py-2 pl-10 pr-4 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] min-w-[240px]"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[#cf4f1e] text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl active:scale-95 border border-[var(--line)]"
                    >
                        <UserPlus size={20} />
                        Ajouter un membre
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-[var(--accent)]" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map((user) => (
                        <GlassCard key={user.id} className={`flex flex-col gap-4 relative overflow-hidden ${!user.active ? 'opacity-60 saturate-50' : ''}`}>
                            {!user.active && (
                                <div className="absolute top-0 right-0 bg-red-500 text-[10px] text-white px-3 py-1 font-bold uppercase tracking-tighter rounded-bl-lg">
                                    Inactif
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${user.active ? 'bg-[var(--accent-soft)] border-[var(--line)] text-[var(--accent)]' : 'bg-[var(--paper-2)] border-[var(--line)] text-[var(--ink-muted)]'}`}>
                                    <User size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-[var(--ink)] truncate">{user.name || "Sans nom"}</h3>
                                    <p className="text-sm text-[var(--ink-muted)] truncate flex items-center gap-1">
                                        <Mail size={12} />
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 items-center">
                                <RoleBadge role={user.role} />
                                <span className="text-[10px] text-[var(--ink-muted)]">Créé le {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center justify-between pt-4 mt-auto border-t border-[var(--line)]">
                                <div className="flex gap-2">
                                    {user.id !== session.user.id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateUser(user.id, { active: !user.active })}
                                                title={user.active ? "Désactiver le compte" : "Réactiver le compte"}
                                                className={`p-2 rounded-lg transition-colors ${user.active ? 'hover:bg-red-500/10 text-[var(--ink-muted)] hover:text-red-500' : 'hover:bg-green-500/10 text-[var(--ink-muted)] hover:text-green-600'}`}
                                            >
                                                {user.active ? <Power size={18} /> : <PowerOff size={18} />}
                                            </button>

                                            <button
                                                onClick={() => setConfirmDelete({ id: user.id, name: user.name || user.email })}
                                                title="Supprimer définitivement"
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--ink-muted)] hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] text-[var(--accent)] font-medium px-2 py-1 bg-[var(--accent-soft)] rounded-lg">
                                            <Info size={10} /> C'est vous
                                        </span>
                                    )}
                                </div>

                                {user.id !== session.user.id && user.role !== "SUPER_ADMIN" && (
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                                        className="bg-transparent text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] border-none focus:ring-0 cursor-pointer text-right outline-none"
                                    >
                                        <option value="USER" className="bg-[var(--paper)]">Utilisateur</option>
                                        <option value="ADMIN" className="bg-[var(--paper)]">Administrateur</option>
                                    </select>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchUsers}
            />

            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => confirmDelete && handleDeleteUser(confirmDelete.id)}
                title="Supprimer le membre"
                message={`Êtes-vous sûr de vouloir supprimer ${confirmDelete?.name} ? Cette action est irréversible.`}
                confirmText="Supprimer"
                variant="danger"
            />

            <div className="mt-12 p-6 rounded-2xl border border-[var(--line)] bg-white/70 backdrop-blur-md">
                <h4 className="text-sm font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[var(--accent)]" />
                    Guide des rôles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-[var(--ink-muted)] uppercase tracking-tighter">Utilisateur (USER)</p>
                        <p className="text-xs text-[var(--ink-muted)]">Peut consulter les arguments validés et proposer ses propres arguments (soumis à validation).</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-tighter">Administrateur (ADMIN)</p>
                        <p className="text-xs text-[var(--ink-muted)]">Peut valider, refuser, modifier ou supprimer tous les arguments. Ses propres ajouts sont auto-validés.</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-tighter">Super Admin</p>
                        <p className="text-xs text-[var(--ink-muted)]">Possède tous les droits d'admin, plus la gestion de l'équipe (invitations, rôles, désactivation).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamPage;
