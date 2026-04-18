// components/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        // Fetch full name from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .single();

        setDisplayName(profile?.full_name ?? session.user.email ?? "User");
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .single();

        setDisplayName(profile?.full_name ?? session.user.email ?? "User");

        if (event === "SIGNED_IN") {
          toast.success("Login Successful", {
            description: `Welcome back, ${profile?.full_name ?? "traveller"}!`,
            icon: "✈️",
          });
        }
      } else {
        setUser(null);
        setDisplayName("");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav
      style={{ backgroundColor: "#002147", borderBottom: "2px solid #D4AF37" }}
      className="sticky top-0 z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Crescent icon */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12c1.8 0 3.508-.397 5.04-1.108C17.92 25.49 14 21.12 14 16s3.92-9.49 7.04-10.892A11.95 11.95 0 0016 4z"
                fill="#D4AF37"
              />
              <path
                d="M24 8l.5 2 2 .5-2 .5L24 13l-.5-2-2-.5 2-.5L24 8z"
                fill="#D4AF37"
                opacity="0.7"
              />
            </svg>
            <div>
              <span
                style={{ fontFamily: "'Playfair Display', serif", color: "#D4AF37" }}
                className="text-lg font-bold leading-none block"
              >
                East & West
              </span>
              <span className="text-[10px] text-gray-300 tracking-widest uppercase leading-none">
                Travel Services
              </span>
            </div>
          </Link>

          {/* Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="/packages">Packages</NavLink>
            {user && <NavLink href="/bookings">My Bookings</NavLink>}
            {user && isAdmin(user) && <NavLink href="/admin">Admin</NavLink>}
          </div>

          {/* Right side: user info + logout */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    style={{ backgroundColor: "#D4AF37" }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#002147] font-bold text-sm"
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-200 max-w-[140px] truncate">
                    {displayName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ borderColor: "#D4AF37", color: "#D4AF37" }}
                  className="border rounded px-3 py-1.5 text-sm font-medium hover:bg-[#D4AF37] hover:text-[#002147] transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                style={{ backgroundColor: "#D4AF37", color: "#002147" }}
                className="px-4 py-1.5 rounded text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#D4AF37]/30 py-3 space-y-2">
            <MobileNavLink href="/packages" onClick={() => setMenuOpen(false)}>Packages</MobileNavLink>
            {user && <MobileNavLink href="/bookings" onClick={() => setMenuOpen(false)}>My Bookings</MobileNavLink>}
            {user && isAdmin(user) && <MobileNavLink href="/admin" onClick={() => setMenuOpen(false)}>Admin</MobileNavLink>}
            {user && (
              <div className="px-3 pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between">
                <span className="text-gray-300 text-sm">{displayName}</span>
                <button onClick={handleLogout} style={{ color: "#D4AF37" }} className="text-sm font-medium">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ color: "#D4AF37" }}
      className="text-sm font-medium hover:opacity-80 transition-opacity tracking-wide"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 text-gray-200 hover:text-[#D4AF37] transition-colors text-sm"
    >
      {children}
    </Link>
  );
}

function isAdmin(user: User): boolean {
  return user.user_metadata?.role === "admin";
}