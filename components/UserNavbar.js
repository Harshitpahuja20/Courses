"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function UserNavbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
  try {
    await fetch("/api/auth/sync-cookie", { method: "DELETE", credentials: "include" });
  } catch {}
  localStorage.removeItem("token");
  router.push("/");
};

  return (
    <nav className="sticky top-0 z-50 border-b border-token nav-surface backdrop-blur">
      <div className="mx-auto max-w-8xl px-4 md:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/user/dashboard" className="flex items-center gap-3">
            {/* If you don't have /logo.svg, remove the <img> */}
            <img src="/logo.svg" alt="" className="h-7 w-7" />
            <span className="text-foreground font-extrabold text-lg tracking-tight">
              Data<span style={{ color: "var(--brand)" }}>Courses</span>
            </span>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Add links later if needed */}
            <button
              onClick={handleLogout}
              className="btn btn-ghost border border-token"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-token text-foreground hover:bg-[var(--elev-2)]"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
          >
            {/* hamburger */}
            <svg
              className={`${open ? "hidden" : "block"} h-5 w-5`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {/* close */}
            <svg
              className={`${open ? "block" : "hidden"} h-5 w-5`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        className={`${open ? "block" : "hidden"} md:hidden border-t border-token`}
      >
        <div className="px-4 py-3 space-y-2">
          {/* Add mobile links here if you need */}
          <button
            onClick={handleLogout}
            className="btn btn-ghost w-full border border-token"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
