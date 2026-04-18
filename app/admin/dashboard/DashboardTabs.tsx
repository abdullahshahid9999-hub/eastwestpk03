"use client";

import { useState } from "react";
import { CalendarCheck, PlusCircle, BarChart3 } from "lucide-react";
import BookingTable, {
  type BookingRow,
} from "@/components/dashboard/BookingTable";
import PackageForm from "@/components/dashboard/PackageForm";
import AnalyticsChart from "@/components/dashboard/AnalyticsChart";
import { type MonthlyAnalytics } from "@/lib/actions/booking-actions";

// ─── Tab Config ────────────────────────────────────────────────────────────────

type Tab = "bookings" | "new-package" | "analytics";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ElementType;
  roles: ("admin" | "staff")[];
}

const TABS: TabConfig[] = [
  {
    id: "bookings",
    label: "Bookings",
    icon: CalendarCheck,
    roles: ["admin", "staff"],
  },
  {
    id: "new-package",
    label: "New Package",
    icon: PlusCircle,
    roles: ["admin", "staff"],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["admin"],
  },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface DashboardTabsProps {
  role: "admin" | "staff";
  bookings: BookingRow[];
  analytics: MonthlyAnalytics[];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DashboardTabs({
  role,
  bookings,
  analytics,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("bookings");

  const visibleTabs = TABS.filter((t) => t.roles.includes(role));

  return (
    <div className="space-y-5">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-fit">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  active
                    ? "bg-[#002147] text-white shadow-sm"
                    : "text-slate-500 hover:text-[#002147] hover:bg-slate-50"
                }
              `}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "bookings" && (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#002147]">
              Booking Management
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Review and approve pending customer bookings
            </p>
          </div>
          <BookingTable initialBookings={bookings} />
        </div>
      )}

      {activeTab === "new-package" && (
        <div>
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#002147]">
              Create Package
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Define a new Umrah, Hajj, or Tour package with full flight and
              hotel details
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <PackageForm
              onSuccess={() => {
                // Optionally switch back to bookings tab after save
              }}
            />
          </div>
        </div>
      )}

      {activeTab === "analytics" && role === "admin" && (
        <div>
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[#002147]">
              Analytics & Reporting
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Monthly booking performance and CSV export of matured bookings
            </p>
          </div>
          <AnalyticsChart data={analytics} />
        </div>
      )}
    </div>
  );
}