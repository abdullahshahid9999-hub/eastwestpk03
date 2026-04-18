// components/AdminBookingRow.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ButtonSpinner } from "@/components/ButtonSpinner";

interface Booking {
  id: string;
  full_name: string;
  email: string;
  package_title?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export function AdminBookingRow({
  booking,
  onStatusChange,
}: {
  booking: Booking;
  onStatusChange?: (id: string, status: string) => void;
}) {
  const supabase = createClientComponentClient();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const updateStatus = async (newStatus: "approved" | "rejected") => {
    if (newStatus === "approved") setApproving(true);
    else setRejecting(true);

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", booking.id);

    if (error) {
      toast.error("Action Failed", { description: error.message });
    } else {
      toast.success(
        newStatus === "approved" ? "Booking Approved ✓" : "Booking Rejected",
        {
          description: `${booking.full_name}'s booking has been ${newStatus}.`,
        }
      );
      onStatusChange?.(booking.id, newStatus);
    }

    setApproving(false);
    setRejecting(false);
  };

  const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
    approved: { bg: "#D1FAE5", text: "#065F46", label: "Approved" },
    rejected: { bg: "#FEE2E2", text: "#991B1B", label: "Rejected" },
  };

  const badge = statusBadge[booking.status];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Info */}
      <div className="flex-1">
        <p
          style={{ color: "#002147", fontFamily: "'Playfair Display', serif" }}
          className="font-semibold"
        >
          {booking.full_name}
        </p>
        <p className="text-sm text-gray-500">{booking.email}</p>
        {booking.package_title && (
          <p className="text-xs text-gray-400 mt-0.5">{booking.package_title}</p>
        )}
      </div>

      {/* Status Badge */}
      <span
        className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: badge.bg, color: badge.text }}
      >
        {badge.label}
      </span>

      {/* Actions (only for pending) */}
      {booking.status === "pending" && (
        <div className="flex gap-2">
          <ButtonSpinner
            variant="secondary"
            loading={approving}
            loadingText="Approving..."
            onClick={() => updateStatus("approved")}
            className="!px-3 !py-1.5 !text-xs"
          >
            Approve
          </ButtonSpinner>
          <ButtonSpinner
            variant="danger"
            loading={rejecting}
            loadingText="Rejecting..."
            onClick={() => updateStatus("rejected")}
            className="!px-3 !py-1.5 !text-xs"
          >
            Reject
          </ButtonSpinner>
        </div>
      )}
    </div>
  );
}