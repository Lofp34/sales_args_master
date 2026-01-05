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
            <nav className="sticky top-0 z-50 px-4 sm:px-6 py-4 flex justify-center" aria-label="Navigation principale">
                <div className="glass-morphism px-5 sm:px-7 py-3 flex items-center justify-between w-full max-w-6xl">
                    <Link href="/" className="flex items-center gap-3" aria-label="Retour à l'accueil">
                        <div className="w-9 h-9 rounded-2xl bg-[var(--accent)] flex items-center justify-center shadow-sm">
                            <Shield className="text-white" size={18} />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-semibold text-[var(--ink)] font-display">
                                Sales Mastery
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--ink-muted)]">
                                Argument Lab
                            </span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3 sm:gap-5">
                        {session ? (
                            <>
                                <div className="hidden md:flex items-center gap-6">
                                    <Link
                                        href="/dashboard"
                                        className="text-sm font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors flex items-center gap-2"
                                        aria-label="Accéder au tableau de bord"
                                    >
                                        <LayoutGrid size={16} />
                                        Arguments
                                    </Link>
                                    {session.user.role === "SUPER_ADMIN" && (
                                        <Link
                                            href="/team"
                                            className="text-sm font-semibold text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors flex items-center gap-2"
                                            aria-label="Gérer l'équipe"
                                        >
                                            <Users size={16} />
                                            Équipe
                                        </Link>
                                    )}
                                </div>

                                <div className="h-6 w-[1px] bg-[var(--line)] hidden md:block" aria-hidden="true" />

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2" aria-label={`Utilisateur connecté: ${session.user.name || session.user.email}`}>
                                        <div className="w-9 h-9 rounded-full bg-[var(--paper-2)] border border-[var(--line)] flex items-center justify-center">
                                            <UserIcon size={16} className="text-[var(--ink-muted)]" />
                                        </div>
                                        <div className="hidden sm:block">
                                            <p className="text-xs font-semibold text-[var(--ink)]">
                                                {session.user.name || session.user.email}
                                            </p>
                                            <p className="text-[10px] text-[var(--ink-muted)] uppercase tracking-widest">
                                                {session.user.role === "USER" ? "Utilisateur" : session.user.role}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="p-2 rounded-xl hover:bg-[var(--accent-soft)] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
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
                                className="px-5 py-2 rounded-xl bg-[var(--ink)] text-[var(--paper)] text-sm font-bold hover:bg-[var(--ink-muted)] transition-all hover:scale-[1.02]"
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
                                    ? "bg-[var(--accent-soft)] text-[var(--ink)] border border-[var(--line)]"
                                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
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
                                        ? "bg-[var(--accent-soft)] text-[var(--ink)] border border-[var(--line)]"
                                        : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                                    }`}
                            >
                                <Users size={16} />
                                Équipe
                            </Link>
                        )}
                        <button
                            onClick={() => signOut()}
                            className="ml-2 p-2 rounded-xl text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--accent-soft)] transition-colors"
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
