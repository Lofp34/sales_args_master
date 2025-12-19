"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User as UserIcon, Shield, LayoutGrid, Users } from "lucide-react";

const Navbar = () => {
    const { data: session } = useSession();

    return (
        <nav className="sticky top-0 z-50 px-6 py-4 flex justify-center">
            <div className="glass-morphism px-6 py-3 flex items-center justify-between w-full max-w-7xl">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Shield className="text-white" size={18} />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Sales Mastery
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    {session ? (
                        <>
                            <div className="hidden md:flex items-center gap-6">
                                <Link
                                    href="/dashboard"
                                    className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <LayoutGrid size={16} />
                                    Dashboard
                                </Link>
                                {session.user.role === "SUPER_ADMIN" && (
                                    <Link
                                        href="/team"
                                        className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <Users size={16} />
                                        Team
                                    </Link>
                                )}
                            </div>

                            <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <UserIcon size={16} className="text-white/60" />
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-xs font-medium text-white">
                                            {session.user.name || session.user.email}
                                        </p>
                                        <p className="text-[10px] text-white/40 uppercase tracking-widest">
                                            {session.user.role}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="px-5 py-2 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-white/90 transition-all hover:scale-105"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
