"use client";

import { useState, useTransition, useCallback } from "react";
import {
  CheckCircle2,
  Loader2,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Eye,
  AlertCircle,
  RefreshCw,
  User,
  Package,
  Calendar,
  Users,
  DollarSign,
  X,
} from "lucide-react";
import { approveBooking } from "@/lib/actions/booking-actions";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface BookingRow {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "matured" | "cancelled";
  total_price: number;
  pax_count: number;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
    passport_no: string;
  } | null;
  packages: {
    name: string;
    type: string;
    metadata?: {
      departure_date?: string;
      airline_code?: string;
    };
  } | null;
}

interface BookingTableProps {
  initialBookings: BookingRow[];
  onRefresh?: () => void;
}

type SortField = "created_at" | "total_price" | "pax_count" | "profiles.full_name";
type SortDir = "asc" | "desc";

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BookingRow["status"] }) {
  const cfg = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    matured: "bg-blue-50 text-blue-700 border-blue-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg[status]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "pending"
            ? "bg-amber-500"
            : status === "approved"
              ? "bg-green-500"
              : status === "matured"
                ? "bg-blue-500"
                : "bg-red-500"
        }`}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Booking Detail Modal ──────────────────────────────────────────────────────

function BookingDetailModal({
  booking,
  onClose,
  onApprove,
  isApproving,
}: {
  booking: BookingRow;
  onClose: () => void;
  onApprove: (id: string) => void;
  isApproving: boolean;
}) {
  const p = booking.profiles;
  const pkg = booking.packages;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#002147]">
          <div>
            <h3 className="text-white font-semibold text-sm">Booking Details</h3>
            <p className="text-slate-400 text-xs font-mono mt-0.5">{booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X size={15} className="text-white" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Customer */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-[#002147]/10 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-[#002147]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {p?.full_name ?? "—"}
              </p>
              <p className="text-xs text-slate-500">{p?.email}</p>
              <p className="text-xs text-slate-500">{p?.phone}</p>
              <p className="text-xs text-slate-400 font-mono">
                Passport: {p?.passport_no ?? "N/A"}
              </p>
            </div>
          </div>

          {/* Package */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0">
              <Package size={16} className="text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {pkg?.name ?? "—"}
              </p>
              <p className="text-xs text-slate-500 capitalize">{pkg?.type}</p>
              {pkg?.metadata?.departure_date && (
                <p className="text-xs text-slate-400">
                  Dep: {new Date(pkg.metadata.departure_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Users,
                label: "Pax",
                value: booking.pax_count,
              },
              {
                icon: DollarSign,
                label: "Total",
                value: `PKR ${booking.total_price.toLocaleString()}`,
              },
              {
                icon: Calendar,
                label: "Booked",
                value: new Date(booking.created_at).toLocaleDateString(),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center"
              >
                <Icon size={14} className="text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <StatusBadge status={booking.status} />
            {booking.status === "pending" && (
              <button
                onClick={() => onApprove(booking.id)}
                disabled={isApproving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#002147] text-white text-sm font-medium rounded-xl hover:bg-[#002147]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isApproving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                {isApproving ? "Approving..." : "Approve Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Table Header ──────────────────────────────────────────────────────────────

function ThSortable({
  label,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = sortField === field;
  return (
    <th
      onClick={() => onSort(field)}
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-[#002147] select-none group"
    >
      <span className="flex items-center gap-1">
        {label}
        <span className="text-slate-300 group-hover:text-slate-400">
          {active ? (
            sortDir === "asc" ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )
          ) : (
            <ChevronDown size={12} className="opacity-40" />
          )}
        </span>
      </span>
    </th>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function BookingTable({
  initialBookings,
  onRefresh,
}: BookingTableProps) {
  const [bookings, setBookings] = useState<BookingRow[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [detailBooking, setDetailBooking] = useState<BookingRow | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Approve handler
  const handleApprove = useCallback(
    (id: string) => {
      setApprovingId(id);
      startTransition(async () => {
        const result = await approveBooking(id);
        if (result.success) {
          setBookings((prev) =>
            prev.map((b) => (b.id === id ? { ...b, status: "approved" } : b))
          );
          setToast({ type: "success", message: result.message });
          setDetailBooking(null);
          setTimeout(() => setToast(null), 4000);
        } else {
          setToast({ type: "error", message: result.message });
          setTimeout(() => setToast(null), 4000);
        }
        setApprovingId(null);
      });
    },
    []
  );

  // Filter + sort
  const filtered = bookings
    .filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        b.profiles?.full_name?.toLowerCase().includes(q) ||
        b.profiles?.email?.toLowerCase().includes(q) ||
        b.profiles?.passport_no?.toLowerCase().includes(q) ||
        b.packages?.name?.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q);
      const matchStatus = !statusFilter || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortField === "created_at") {
        aVal = a.created_at;
        bVal = b.created_at;
      } else if (sortField === "total_price") {
        aVal = a.total_price;
        bVal = b.total_price;
      } else if (sortField === "pax_count") {
        aVal = a.pax_count;
        bVal = b.pax_count;
      } else if (sortField === "profiles.full_name") {
        aVal = a.profiles?.full_name ?? "";
        bVal = b.profiles?.full_name ?? "";
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* Detail Modal */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
          onApprove={handleApprove}
          isApproving={approvingId === detailBooking.id && isPending}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, passport, package..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#002147]/50 focus:ring-2 focus:ring-[#002147]/10 bg-white transition-all"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#002147]/50 bg-white text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="matured">Matured</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 hover:border-[#002147]/30 text-slate-400 hover:text-[#002147] transition-all"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span className="text-sm text-amber-800 font-medium">
            {pendingCount} booking{pendingCount !== 1 ? "s" : ""} awaiting
            approval
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <ThSortable
                  label="Customer"
                  field="profiles.full_name"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Package
                </th>
                <ThSortable
                  label="Pax"
                  field="pax_count"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <ThSortable
                  label="Total (PKR)"
                  field="total_price"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <ThSortable
                  label="Booked On"
                  field="created_at"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-16 text-center text-sm text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search size={24} className="text-slate-300" />
                      <span>No bookings found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {booking.profiles?.full_name ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {booking.profiles?.email}
                        </p>
                      </div>
                    </td>

                    {/* Package */}
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm text-slate-700 font-medium truncate max-w-[200px]">
                          {booking.packages?.name ?? "—"}
                        </p>
                        <p className="text-xs text-slate-400 capitalize mt-0.5">
                          {booking.packages?.type}
                          {booking.packages?.metadata?.airline_code &&
                            ` · ${booking.packages.metadata.airline_code}`}
                        </p>
                      </div>
                    </td>

                    {/* Pax */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-700">
                        {booking.pax_count}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-semibold text-slate-800">
                        {booking.total_price.toLocaleString()}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-500">
                        {new Date(booking.created_at).toLocaleDateString(
                          "en-PK",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={booking.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setDetailBooking(booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-[#002147] border border-slate-200 hover:border-[#002147]/30 rounded-lg transition-all"
                        >
                          <Eye size={12} />
                          View
                        </button>
                        {booking.status === "pending" && (
                          <button
                            onClick={() => handleApprove(booking.id)}
                            disabled={
                              approvingId === booking.id && isPending
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#002147] text-white hover:bg-[#002147]/90 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                          >
                            {approvingId === booking.id && isPending ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400">
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        )}
      </div>
    </div>
  );
}