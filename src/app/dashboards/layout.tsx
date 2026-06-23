"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MagneticCursor } from "@/components/ui/magnetic-cursor";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboards" },
  { label: "Leads", href: "/dashboards/leads" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Derive the activeNav label based on the current pathname
  const activeNav = NAV_LINKS.find((link) => pathname === link.href)?.label || "Dashboard";

  useEffect(() => {
    // Fix: use /api/auth/me (HTTP-only cookie) instead of localStorage
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          router.replace("/login");
        } else {
          setChecking(false);
        }
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const renderSidebarContent = (isMobileView: boolean) => {
    return (
      <>
        {/* Brand */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <Image src="/logo.svg" alt="Voxora" width={22} height={22} />
            <span className="text-base font-semibold text-foreground">Voxora</span>
            <span className="ml-2 text-[10px] font-semibold text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 tracking-wider uppercase">
              ADMIN
            </span>
          </Link>
          {isMobileView && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none p-1"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-grow flex flex-col gap-1">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-2 pl-2">
            Navigation
          </p>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => {
                if (isMobileView) setMobileSidebarOpen(false);
              }}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150 no-underline ${
                activeNav === link.label
                  ? "font-semibold text-foreground bg-muted border border-border"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <button
          id="dashboard-logout"
          onClick={() => {
            handleLogout();
            if (isMobileView) setMobileSidebarOpen(false);
          }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground bg-transparent border border-border cursor-pointer transition-colors duration-150 w-full hover:text-destructive hover:border-destructive/30 mt-auto font-sans"
        >
          ↩ Logout
        </button>
      </>
    );
  };

  if (checking) {
    return (
      <MagneticCursor magneticFactor={0.3} cursorSize={28} blendMode="exclusion">
        <div className="min-h-screen bg-background flex items-center justify-center font-sans">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Verifying session…</span>
          </div>
        </div>
      </MagneticCursor>
    );
  }

  return (
    <MagneticCursor magneticFactor={0.3} cursorSize={28} blendMode="exclusion">
      <div className="flex flex-col lg:flex-row min-h-screen bg-background font-sans max-w-[100vw] overflow-clip">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-[240px] flex-shrink-0 bg-card border-r border-border flex-col p-6 h-screen sticky top-0">
          {renderSidebarContent(false)}
        </aside>

        {/* Mobile Top Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-40">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <Image src="/logo.svg" alt="Voxora" width={22} height={22} />
            <span className="text-base font-semibold text-foreground">Voxora</span>
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted border border-border rounded px-1.5 py-0.5 tracking-wider uppercase">
              ADMIN
            </span>
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none p-2"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              />
              {/* Drawer Content */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[260px] bg-card border-r border-border p-6 flex flex-col z-50 lg:hidden shadow-2xl"
              >
                {renderSidebarContent(true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-grow overflow-x-clip pt-16 lg:pt-0 min-h-screen max-w-[100vw]">
          {children}
        </main>
      </div>
    </MagneticCursor>
  );
}
