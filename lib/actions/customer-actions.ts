"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  airline: string | null;
  hotel_makkah: string | null;
  hotel_madinah: string | null;
  departure_city: string | null;
  departure_date: string | null;
  return_date: string | null;
  inclusions: string[] | null;
  max_capacity: number | null;
  current_bookings: number | null;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
}

export interface BookingFormData {
  // Step 1: Basic Details
  full_name: string;
  phone: string;
  email: string;
  // Step 2: Passport Info
  passport_no: string;
  passport_expiry: string;
  nationality: string;
  // Meta
  package_id: string;
  num_travelers: number;
  special_requests?: string;
}

export interface BookingResult {
  success: boolean;
  booking_id?: string;
  error?: string;
  duplicate?: boolean;
}

// ─── Fetch all active packages ────────────────────────────────────────────────

export async function getActivePackages(): Promise<Package[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching packages:", error);
    return [];
  }

  return data ?? [];
}

// ─── Fetch a single package by ID ────────────────────────────────────────────

export async function getPackageById(id: string): Promise<Package | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching package:", error);
    return null;
  }

  return data;
}

// ─── Check for duplicate passport ────────────────────────────────────────────

export async function checkDuplicatePassport(
  passportNo: string,
  profileId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("travelers")
    .select("id")
    .eq("passport_no", passportNo)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.error("Error checking duplicate passport:", error);
    return false;
  }

  return !!data;
}

// ─── Create a new booking ─────────────────────────────────────────────────────

export async function createBooking(
  formData: BookingFormData
): Promise<BookingResult> {
  const supabase = await createClient();

  // Get the current authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be signed in to make a booking." };
  }

  // Fetch or create the user's profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "User profile not found." };
  }

  const profileId = profile.id;

  // ── Duplicate passport check ──────────────────────────────────────────────
  const isDuplicate = await checkDuplicatePassport(
    formData.passport_no,
    profileId
  );

  if (isDuplicate) {
    return {
      success: false,
      duplicate: true,
      error:
        "A traveler with this passport number already exists on your account.",
    };
  }

  // ── Create traveler record ────────────────────────────────────────────────
  const { data: traveler, error: travelerError } = await supabase
    .from("travelers")
    .insert({
      profile_id: profileId,
      full_name: formData.full_name,
      passport_no: formData.passport_no,
      passport_expiry: formData.passport_expiry,
      nationality: formData.nationality,
      phone: formData.phone,
      email: formData.email,
    })
    .select("id")
    .single();

  if (travelerError || !traveler) {
    console.error("Error creating traveler:", travelerError);
    return { success: false, error: "Failed to save traveler information." };
  }

  // ── Create booking record ─────────────────────────────────────────────────
  const totalPrice = await calculateTotalPrice(
    formData.package_id,
    formData.num_travelers
  );

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      profile_id: profileId,
      package_id: formData.package_id,
      primary_traveler_id: traveler.id,
      status: "Pending",
      num_travelers: formData.num_travelers,
      total_price: totalPrice,
      special_requests: formData.special_requests ?? null,
      booking_date: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    console.error("Error creating booking:", bookingError);
    // Rollback traveler if booking fails
    await supabase.from("travelers").delete().eq("id", traveler.id);
    return { success: false, error: "Failed to create booking. Please try again." };
  }

  revalidatePath("/packages");

  return { success: true, booking_id: booking.id };
}

// ─── Helper: Calculate total price ───────────────────────────────────────────

async function calculateTotalPrice(
  packageId: string,
  numTravelers: number
): Promise<number> {
  const pkg = await getPackageById(packageId);
  if (!pkg) return 0;
  return pkg.price * numTravelers;
}