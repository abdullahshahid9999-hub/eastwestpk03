"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/database.types";
import { bookingSchema, type BookingFormData } from "@/lib/validations";
import { generateReferenceNumber } from "@/lib/referenceNumber";

type FieldErrors = Partial<Record<keyof BookingFormData, string>>;

export default function BookingPage() {
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get("package") ?? "";

  const [form, setForm] = useState<Partial<BookingFormData>>({
    package_id: packageId,
    num_travellers: 1,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (field: keyof BookingFormData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    setServerError("");
    const result = bookingSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof BookingFormData;
        if (!fieldErrors[field]) fieldErrors[field] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const ref = generateReferenceNumber();

    const { error } = await supabase.from("bookings").insert({
      ...result.data,
      reference_number: ref,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    router.push(`/thank-you?ref=${ref}&name=${encodeURIComponent(result.data.full_name)}`);
  };

  return (
    <main className="min-h-screen bg-[#F8F6F1] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-3">
            East &amp; West Travel Services
          </p>
          <h1 className="text-[#002147] text-4xl font-bold">Book Your Journey</h1>
          <div className="w-12 h-1 bg-[#D4AF37] mx-auto mt-4 rounded" />
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {serverError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* Personal Details */}
          <Section title="Personal Details">
            <Field label="Full Name" error={errors.full_name}>
              <input
                type="text"
                placeholder="As on passport"
                value={form.full_name ?? ""}
                onChange={(e) => set("full_name", e.target.value)}
                className={inputClass(!!errors.full_name)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputClass(!!errors.email)}
                />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input
                  type="tel"
                  placeholder="+92300000000"
                  value={form.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputClass(!!errors.phone)}
                />
              </Field>
            </div>

            <Field label="Passport Number" error={errors.passport_number}>
              <input
                type="text"
                placeholder="AB1234567"
                value={form.passport_number ?? ""}
                onChange={(e) =>
                  set("passport_number", e.target.value.toUpperCase())
                }
                className={inputClass(!!errors.passport_number)}
              />
            </Field>
          </Section>

          {/* Trip Details */}
          <Section title="Trip Details">
            <Field label="Package ID" error={errors.package_id}>
              <input
                type="text"
                placeholder="UUID from packages"
                value={form.package_id ?? ""}
                onChange={(e) => set("package_id", e.target.value)}
                className={inputClass(!!errors.package_id)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Travel Date" error={errors.travel_date}>
                <input
                  type="date"
                  value={form.travel_date ?? ""}
                  onChange={(e) => set("travel_date", e.target.value)}
                  className={inputClass(!!errors.travel_date)}
                />
              </Field>
              <Field label="No. of Travellers" error={errors.num_travellers}>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.num_travellers ?? 1}
                  onChange={(e) =>
                    set("num_travellers", parseInt(e.target.value, 10))
                  }
                  className={inputClass(!!errors.num_travellers)}
                />
              </Field>
            </div>

            <Field label="Special Requests (optional)" error={errors.special_requests}>
              <textarea
                rows={3}
                placeholder="Dietary requirements, accessibility needs, etc."
                value={form.special_requests ?? ""}
                onChange={(e) => set("special_requests", e.target.value)}
                className={inputClass(!!errors.special_requests) + " resize-none"}
              />
            </Field>
          </Section>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-[#002147] text-white font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-[#001530] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing..." : "Confirm Booking"}
          </button>

          <p className="text-center text-gray-400 text-xs">
            By booking you agree to our Terms &amp; Conditions. Your reference number will be generated instantly.
          </p>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-[#002147] font-bold text-sm tracking-widest uppercase mb-4 pb-2 border-b border-gray-100">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 tracking-wide mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-lg border text-sm focus:outline-none transition-colors ${
    hasError
      ? "border-red-300 focus:border-red-500 bg-red-50"
      : "border-gray-200 focus:border-[#002147] bg-white"
  }`;