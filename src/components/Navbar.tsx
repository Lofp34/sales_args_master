"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon, Shield, LayoutGrid, Users } from "lucide-react";

const Navbar = () => {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <>
            <nav className="sticky top-0 z-50 px-6 py-4 flex justify-center" aria-label="Navigation principale">
                <div className="glass-morphism px-6 py-3 flex items-center justify-between w-full max-w-7xl">
                    <Link href="/" className="flex items-center gap-2" aria-label="Retour à l'accueil">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                            <Shield className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Sales Mastery
                        </span>
                    </Link>

                    <div className="flex items-center gap-4 md:gap-6">
                        {session ? (
                            <>
                                <div className="hidden md:flex items-center gap-6">
                                    <Link
                                        href="/dashboard"
                                        className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2"
                                        aria-label="Accéder au tableau de bord"
                                    >
                                        <LayoutGrid size={16} />
                                        Arguments
                                    </Link>
                                    {session.user.role === "SUPER_ADMIN" && (
                                        <Link
                                            href="/team"
                                            className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2"
                                            aria-label="Gérer l'équipe"
                                        >
                                            <Users size={16} />
                                            Équipe
                                        </Link>
                                    )}
                                </div>

                                <div className="h-6 w-[1px] bg-white/10 hidden md:block" aria-hidden="true" />

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2" aria-label={`Utilisateur connecté: ${session.user.name || session.user.email}`}>
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center">
                                            <UserIcon size={16} className="text-indigo-400" />
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-xs font-medium text-white">
                                                {session.user.name || session.user.email}
                                            </p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">
                                                {session.user.role === 'USER' ? 'Utilisateur' : session.user.role}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="p-2 rounded-xl hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors"
                                        title="Déconnexion"
                                        aria-label="Se déconnecter"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-white/90 transition-all hover:scale-105"
                                aria-label="Se connecter"
                            >
                                Connexion
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
            {session && (
                <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden" aria-label="Navigation mobile">
                    <div className="glass-morphism px-3 py-2 flex items-center justify-between">
                        <Link
                            href="/dashboard"
                            aria-label="Accéder aux arguments"
                            aria-current={pathname === "/dashboard" ? "page" : undefined}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${pathname === "/dashboard"
                                    ? "bg-white/15 text-white border border-white/20"
                                    : "text-white/70 hover:text-white"
                                }`}
                        >
                            <LayoutGrid size={16} />
                            Arguments
                        </Link>
                        {session.user.role === "SUPER_ADMIN" && (
                            <Link
                                href="/team"
                                aria-label="Accéder à l'équipe"
                                aria-current={pathname === "/team" ? "page" : undefined}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${pathname === "/team"
                                        ? "bg-white/15 text-white border border-white/20"
                                        : "text-white/70 hover:text-white"
                                    }`}
                            >
                                <Users size={16} />
                                Équipe
                            </Link>
                        )}
                        <button
                            onClick={() => signOut()}
                            className="ml-2 p-2 rounded-xl text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            title="Déconnexion"
                            aria-label="Se déconnecter"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
