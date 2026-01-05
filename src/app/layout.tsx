import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import InteractiveBackground from "@/components/ui/InteractiveBackground";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const bodyFont = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sales Mastery | Expert Sales Enablement",
  description: "Share, vote, and master the best sales arguments in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} antialiased min-h-screen selection:bg-[var(--accent-soft)]`}
      >
        <Providers>
          <InteractiveBackground />
          <Navbar />
          <main className="relative z-10 pb-24 md:pb-0">
            {children}
          </main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(248, 243, 235, 0.92)',
                color: '#1c1b17',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(28, 27, 23, 0.12)',
                borderRadius: '14px',
                boxShadow: '0 18px 40px -28px rgba(28, 27, 23, 0.45)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
