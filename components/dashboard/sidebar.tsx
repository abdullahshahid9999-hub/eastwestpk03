"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Package,
  Users,
  BarChart3,
  FileDown,
  Settings,
  Menu,
  X,
  Plane,
  ChevronRight,
  LogOut,
  Shield,
  UserCog,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: ("admin" | "staff")[];
  badge?: string;
}

interface SidebarProps {
  role: "admin" | "staff";
  userName: string;
  userEmail: string;
}

// ─── Nav Config ────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "staff"],
  },
  {
    label: "Bookings",
    href: "/admin/dashboard/bookings",
    icon: CalendarCheck,
    roles: ["admin", "staff"],
    badge: "pending",
  },
  {
    label: "Packages",
    href: "/admin/dashboard/packages",
    icon: Package,
    roles: ["admin", "staff"],
  },
  {
    label: "Travelers",
    href: "/admin/dashboard/travelers",
    icon: Users,
    roles: ["admin", "staff"],
  },
  {
    label: "Analytics",
    href: "/admin/dashboard/analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    label: "Export",
    href: "/admin/dashboard/export",
    icon: FileDown,
    roles: ["admin"],
  },
  {
    label: "Staff Management",
    href: "/admin/dashboard/staff",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    label: "Settings",
    href: "/admin/dashboard/settings",
    icon: Settings,
    roles: ["admin", "staff"],
  },
];

// ─── NavLink ───────────────────────────────────────────────────────────────────

function NavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-150 relative
        ${
          active
            ? "bg-[#D4AF37] text-[#002147]"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <Icon
        size={18}
        className={`flex-shrink-0 transition-colors ${
          active ? "text-[#002147]" : "text-slate-400 group-hover:text-white"
        }`}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {active && (
        <ChevronRight size={14} className="text-[#002147] opacity-70" />
      )}
    </Link>
  );
}

// ─── Sidebar Content ───────────────────────────────────────────────────────────

function SidebarContent({
  role,
  userName,
  userEmail,
  pathname,
  onNavClick,
}: SidebarProps & { pathname: string; onNavClick?: () => void }) {
  const filtered = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex flex-col h-full bg-[#002147]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
          <Plane size={18} className="text-[#002147]" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm leading-tight truncate">
            Al-Safar Travel
          </p>
          <p className="text-slate-400 text-xs truncate">Management Suite</p>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          <Shield size={13} className="text-[#D4AF37] flex-shrink-0" />
          <span className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
            {role === "admin" ? "Administrator" : "Staff Member"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {/* Section: General */}
        <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          General
        </p>
        {filtered
          .filter((i) =>
            ["Dashboard", "Bookings", "Packages", "Travelers"].includes(i.label)
          )
          .map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              onClick={onNavClick}
            />
          ))}

        {/* Section: Admin Only */}
        {role === "admin" && (
          <>
            <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Administration
            </p>
            {filtered
              .filter((i) =>
                ["Analytics", "Export", "Staff Management"].includes(i.label)
              )
              .map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  onClick={onNavClick}
                />
              ))}
          </>
        )}

        {/* Section: System */}
        <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          System
        </p>
        {filtered
          .filter((i) => i.label === "Settings")
          .map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              onClick={onNavClick}
            />
          ))}
      </nav>

      {/* User Profile */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center flex-shrink-0">
            <span className="text-[#D4AF37] text-xs font-bold">
              {userName?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{userName}</p>
            <p className="text-slate-500 text-[11px] truncate">{userEmail}</p>
          </div>
          <LogOut
            size={14}
            className="text-slate-500 group-hover:text-slate-300 flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent
          role={role}
          userName={userName}
          userEmail={userEmail}
          pathname={pathname}
        />
      </aside>

      {/* ── Mobile Topbar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#002147] flex items-center px-4 gap-3 border-b border-white/10">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} className="text-white" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#D4AF37] flex items-center justify-center">
            <Plane size={13} className="text-[#002147]" />
          </div>
          <span className="text-white text-sm font-semibold">Al-Safar</span>
        </div>
      </div>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative w-72 flex-shrink-0 h-full shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close navigation"
            >
              <X size={16} className="text-white" />
            </button>

            <SidebarContent
              role={role}
              userName={userName}
              userEmail={userEmail}
              pathname={pathname}
              onNavClick={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}