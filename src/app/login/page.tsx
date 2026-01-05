"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { Shield, ArrowRight, Loader2 } from "lucide-react";

const LoginPage = () => {
    const [email, setEmail] = useState("ls@laurentserre.com");
    const [password, setPassword] = useState("admin123");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid credentials");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-6">
            <GlassCard className="w-full max-w-md p-8 sm:p-10">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-6 shadow-lg">
                        <Shield className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-semibold text-[var(--ink)] mb-2 font-display">Bienvenue</h1>
                    <p className="text-[var(--ink-muted)]">Connectez-vous pour accéder à Sales Mastery.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-widest ml-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[var(--paper-2)] border border-[var(--line)] rounded-xl px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-muted)] placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] focus:border-transparent transition-all"
                            placeholder="name@company.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-widest ml-1">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[var(--paper-2)] border border-[var(--line)] rounded-xl px-4 py-3 text-[var(--ink)] placeholder:text-[var(--ink-muted)] placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-[var(--ink)] text-[var(--paper)] font-bold hover:bg-[var(--ink-muted)] transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Se connecter
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-[var(--line)] text-center">
                    <p className="text-[var(--ink-muted)] text-sm">
                        Besoin d'accès ? Contactez votre responsable.
                    </p>
                </div>
            </GlassCard>
        </div>
    );
};

export default LoginPage;
