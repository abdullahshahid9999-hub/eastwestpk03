"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface TravelerUpsertPayload {
  full_name: string;
  passport_no: string;
  nationality: string;
  date_of_birth: string;
  phone: string;
  email: string;
  booking_id: string;
  user_id: string;
}

export interface BookingApprovalResult {
  success: boolean;
  message: string;
  bookingId?: string;
}

export interface PackageMetadata {
  airline_code: string;
  flight_no: string;
  departure_city: string;
  arrival_city: string;
  departure_date: string;
  return_date?: string;
  hotels: HotelRow[];
  visa_included: boolean;
  transport_included: boolean;
  notes?: string;
}

export interface HotelRow {
  city: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  room_type: string;
  nights: number;
}

export interface PackageUpsertPayload {
  id?: string;
  name: string;
  type: "umrah" | "tour" | "hajj";
  price: number;
  duration_days: number;
  max_seats: number;
  metadata: PackageMetadata;
  status: "active" | "inactive" | "sold_out";
}

// ─── Approve Booking ───────────────────────────────────────────────────────────

export async function approveBooking(
  bookingId: string
): Promise<BookingApprovalResult> {
  try {
    // 1. Fetch full booking with profile data
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        profiles (
          full_name,
          passport_no,
          nationality,
          date_of_birth,
          phone,
          email,
          user_id
        )
      `
      )
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return {
        success: false,
        message: fetchError?.message ?? "Booking not found",
      };
    }

    if (booking.status === "approved") {
      return { success: false, message: "Booking is already approved." };
    }

    const profile = booking.profiles;

    // 2. UPSERT into travelers table (check passport_no to avoid duplicates)
    if (profile?.passport_no) {
      const travelerPayload: TravelerUpsertPayload = {
        full_name: profile.full_name ?? "",
        passport_no: profile.passport_no,
        nationality: profile.nationality ?? "",
        date_of_birth: profile.date_of_birth ?? "",
        phone: profile.phone ?? "",
        email: profile.email ?? "",
        booking_id: bookingId,
        user_id: profile.user_id,
      };

      const { error: upsertError } = await supabase
        .from("travelers")
        .upsert(travelerPayload, {
          onConflict: "passport_no",
          ignoreDuplicates: false,
        });

      if (upsertError) {
        return {
          success: false,
          message: `Traveler upsert failed: ${upsertError.message}`,
        };
      }
    }

    // 3. Update booking status → 'approved'
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      return {
        success: false,
        message: `Status update failed: ${updateError.message}`,
      };
    }

    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Booking approved and traveler record saved.",
      bookingId,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, message };
  }
}

// ─── Upsert Package ────────────────────────────────────────────────────────────

export async function upsertPackage(
  payload: PackageUpsertPayload
): Promise<{ success: boolean; message: string; id?: string }> {
  try {
    const record = {
      ...(payload.id ? { id: payload.id } : {}),
      name: payload.name,
      type: payload.type,
      price: payload.price,
      duration_days: payload.duration_days,
      max_seats: payload.max_seats,
      metadata: payload.metadata,
      status: payload.status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("packages")
      .upsert(record, { onConflict: "id" })
      .select("id")
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/admin/dashboard");

    return { success: true, message: "Package saved successfully.", id: data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, message };
  }
}

// ─── Export Matured Bookings CSV ───────────────────────────────────────────────

export async function fetchMaturedBookingsForExport(): Promise<{
  success: boolean;
  data?: string;
  message?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        created_at,
        approved_at,
        total_price,
        pax_count,
        status,
        packages ( name, type ),
        profiles ( full_name, email, phone, passport_no )
      `
      )
      .eq("status", "matured")
      .order("approved_at", { ascending: false });

    if (error) return { success: false, message: error.message };
    if (!data || data.length === 0)
      return { success: false, message: "No matured bookings found." };

    const headers = [
      "Booking ID",
      "Customer Name",
      "Email",
      "Phone",
      "Passport No",
      "Package",
      "Type",
      "Pax",
      "Total Price",
      "Approved At",
    ].join(",");

    const rows = data.map((b) => {
      const pkg = Array.isArray(b.packages) ? b.packages[0] : b.packages;
      const prof = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
      return [
        b.id,
        `"${prof?.full_name ?? ""}"`,
        prof?.email ?? "",
        prof?.phone ?? "",
        prof?.passport_no ?? "",
        `"${pkg?.name ?? ""}"`,
        pkg?.type ?? "",
        b.pax_count,
        b.total_price,
        b.approved_at ?? "",
      ].join(",");
    });

    return { success: true, data: [headers, ...rows].join("\n") };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, message };
  }
}

// ─── Fetch Monthly Analytics ───────────────────────────────────────────────────

export interface MonthlyAnalytics {
  month: string;
  total: number;
  matured: number;
  approved: number;
}

export async function fetchMonthlyAnalytics(): Promise<{
  success: boolean;
  data?: MonthlyAnalytics[];
  message?: string;
}> {
  try {
    const { data, error } = await supabase.rpc("get_monthly_booking_analytics");

    if (error) {
      // Fallback: raw query if RPC doesn't exist
      const { data: raw, error: rawError } = await supabase
        .from("bookings")
        .select("created_at, status")
        .gte(
          "created_at",
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (rawError) return { success: false, message: rawError.message };

      const map: Record<string, MonthlyAnalytics> = {};
      (raw ?? []).forEach((b) => {
        const key = b.created_at?.slice(0, 7) ?? "";
        if (!map[key])
          map[key] = { month: key, total: 0, matured: 0, approved: 0 };
        map[key].total++;
        if (b.status === "matured") map[key].matured++;
        if (b.status === "approved") map[key].approved++;
      });

      return {
        success: true,
        data: Object.values(map).sort((a, b) =>
          a.month.localeCompare(b.month)
        ),
      };
    }

    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, message };
  }
}