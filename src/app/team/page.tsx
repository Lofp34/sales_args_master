"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { Shield, User, Loader2, Check, ArrowUpCircle } from "lucide-react";

interface UserData {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
}

const TeamPage = () => {
    const { data: session, status } = useSession();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users", err);
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

    const handlePromote = async (id: string, newRole: string) => {
        try {
            await fetch(`/api/users/${id}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            fetchUsers();
        } catch (err) {
            console.error("Failed to update role", err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-2 text-center sm:text-left">Team Management</h1>
                <p className="text-white/60 text-center sm:text-left">Manage user roles and permissions.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <GlassCard key={user.id} className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/40">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{user.name || "Anonymous"}</h3>
                                    <p className="text-sm text-white/40">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div>
                                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-md font-bold ${user.role === 'SUPER_ADMIN' ? 'bg-primary/20 text-primary' :
                                            user.role === 'ADMIN' ? 'bg-secondary/20 text-secondary' :
                                                'bg-white/5 text-white/40'
                                        }`}>
                                        {user.role}
                                    </span>
                                </div>

                                {user.id !== session.user.id && (
                                    <div className="flex gap-2">
                                        {user.role === "USER" ? (
                                            <button
                                                onClick={() => handlePromote(user.id, "ADMIN")}
                                                className="flex items-center gap-1 text-xs font-bold text-secondary hover:text-white transition-colors"
                                            >
                                                <ArrowUpCircle size={14} />
                                                Make Admin
                                            </button>
                                        ) : user.role === "ADMIN" ? (
                                            <button
                                                onClick={() => handlePromote(user.id, "USER")}
                                                className="flex items-center gap-1 text-xs font-bold text-white/40 hover:text-red-400 transition-colors"
                                            >
                                                Demote to User
                                            </button>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamPage;
