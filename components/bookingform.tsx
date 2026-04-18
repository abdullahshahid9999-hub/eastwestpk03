// components/BookingForm.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ButtonSpinner } from "@/components/ButtonSpinner";

interface BookingFormProps {
  packageId: string;
  packageTitle: string;
  packagePrice: number;
}

interface FormData {
  // Step 1: Traveller Info
  full_name: string;
  email: string;
  phone: string;
  // Step 2: Passport Details
  passport_number: string;
  passport_expiry: string;
  nationality: string;
  // Step 3: Payment
  payment_method: string;
  special_requests: string;
}

const STEPS = [
  { id: 1, label: "Traveller Info" },
  { id: 2, label: "Passport" },
  { id: 3, label: "Payment" },
];

const INITIAL_FORM: FormData = {
  full_name: "",
  email: "",
  phone: "",
  passport_number: "",
  passport_expiry: "",
  nationality: "",
  payment_method: "bank_transfer",
  special_requests: "",
};

export function BookingForm({ packageId, packageTitle, packagePrice }: BookingFormProps) {
  const supabase = createClientComponentClient();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const goNext = () => {
    if (!validateStep()) return;
    setDirection("forward");
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection("back");
    setStep((s) => s - 1);
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.full_name || !formData.email || !formData.phone) {
        toast.error("Please fill in all traveller details.");
        return false;
      }
    }
    if (step === 2) {
      const passportRegex = /^[A-Z0-9]{6,9}$/;
      if (!passportRegex.test(formData.passport_number.toUpperCase())) {
        toast.error("Passport Validation Failed", {
          description: "Please enter a valid passport number (6–9 alphanumeric characters).",
        });
        return false;
      }
      if (!formData.passport_expiry || !formData.nationality) {
        toast.error("Passport Validation Failed", {
          description: "Passport expiry and nationality are required.",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Validate payment method
      if (!formData.payment_method) {
        toast.error("Payment Validation Failed", {
          description: "Please select a payment method.",
        });
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("bookings").insert({
        package_id: packageId,
        user_id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        passport_number: formData.passport_number.toUpperCase(),
        passport_expiry: formData.passport_expiry,
        nationality: formData.nationality,
        payment_method: formData.payment_method,
        special_requests: formData.special_requests,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Booking Confirmed! 🎉", {
        description: `Your booking for "${packageTitle}" has been submitted. We'll be in touch shortly.`,
      });

      // Reset
      setFormData(INITIAL_FORM);
      setStep(1);
    } catch {
      toast.error("Booking Failed", {
        description: "Something went wrong. Please try again or contact support.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Framer Motion variants for slide transition
  const variants = {
    enter: (dir: string) => ({
      x: dir === "forward" ? 80 : -80,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: string) => ({
      x: dir === "forward" ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-lg mx-auto">
      {/* Package Summary */}
      <div
        className="rounded-xl p-4 mb-8"
        style={{ backgroundColor: "#002147" + "08", borderLeft: "3px solid #D4AF37" }}
      >
        <p className="text-xs text-gray-500 uppercase tracking-wide">Booking for</p>
        <p
          style={{ fontFamily: "'Playfair Display', serif", color: "#002147" }}
          className="font-semibold text-lg"
        >
          {packageTitle}
        </p>
        <p style={{ color: "#D4AF37" }} className="font-bold text-xl mt-1">
          PKR {packagePrice.toLocaleString()}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300"
                style={
                  step >= s.id
                    ? { backgroundColor: "#002147", color: "#D4AF37" }
                    : { backgroundColor: "#e5e7eb", color: "#9ca3af" }
                }
              >
                {step > s.id ? "✓" : s.id}
              </div>
              <span className="text-xs mt-1 text-gray-500 hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 transition-colors duration-300"
                style={{ backgroundColor: step > s.id ? "#D4AF37" : "#e5e7eb" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Animated Step Content */}
      <div className="overflow-hidden min-h-[220px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {step === 1 && (
              <StepTravellerInfo formData={formData} update={update} />
            )}
            {step === 2 && (
              <StepPassport formData={formData} update={update} />
            )}
            {step === 3 && (
              <StepPayment formData={formData} update={update} packagePrice={packagePrice} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        {step > 1 ? (
          <button
            onClick={goBack}
            className="text-sm text-gray-500 hover:text-[#002147] transition-colors px-4 py-2"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <ButtonSpinner variant="primary" onClick={goNext}>
            Continue →
          </ButtonSpinner>
        ) : (
          <ButtonSpinner
            variant="secondary"
            loading={submitting}
            loadingText="Confirming..."
            onClick={handleSubmit}
          >
            Confirm Booking
          </ButtonSpinner>
        )}
      </div>
    </div>
  );
}

/* ── Step 1: Traveller Info ── */
function StepTravellerInfo({
  formData,
  update,
}: {
  formData: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 style={{ color: "#002147", fontFamily: "'Playfair Display', serif" }} className="text-xl font-semibold">
        Traveller Information
      </h2>
      <Field label="Full Name" value={formData.full_name} onChange={(v) => update("full_name", v)} placeholder="As on passport" />
      <Field label="Email Address" type="email" value={formData.email} onChange={(v) => update("email", v)} placeholder="you@example.com" />
      <Field label="Phone Number" type="tel" value={formData.phone} onChange={(v) => update("phone", v)} placeholder="+92 300 000 0000" />
    </div>
  );
}

/* ── Step 2: Passport ── */
function StepPassport({
  formData,
  update,
}: {
  formData: FormData;
  update: (k: keyof FormData, v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 style={{ color: "#002147", fontFamily: "'Playfair Display', serif" }} className="text-xl font-semibold">
        Passport Details
      </h2>
      <Field label="Passport Number" value={formData.passport_number} onChange={(v) => update("passport_number", v)} placeholder="AB1234567" />
      <Field label="Expiry Date" type="date" value={formData.passport_expiry} onChange={(v) => update("passport_expiry", v)} />
      <Field label="Nationality" value={formData.nationality} onChange={(v) => update("nationality", v)} placeholder="Pakistani" />
    </div>
  );
}

/* ── Step 3: Payment ── */
function StepPayment({
  formData,
  update,
  packagePrice,
}: {
  formData: FormData;
  update: (k: keyof FormData, v: string) => void;
  packagePrice: number;
}) {
  return (
    <div className="space-y-4">
      <h2 style={{ color: "#002147", fontFamily: "'Playfair Display', serif" }} className="text-xl font-semibold">
        Payment & Final Details
      </h2>

      {/* Payment Method */}
      <div>
        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
          Payment Method
        </label>
        <select
          value={formData.payment_method}
          onChange={(e) => update("payment_method", e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "#D4AF37" } as React.CSSProperties}
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="installment">Installment Plan</option>
        </select>
      </div>

      {/* Price Summary */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: "#002147" + "06", border: "1px solid #D4AF37" + "50" }}
      >
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Package Price</span>
          <span>PKR {packagePrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span>Service Fee</span>
          <span>PKR 0</span>
        </div>
        <div className="flex justify-between font-bold" style={{ color: "#002147" }}>
          <span>Total</span>
          <span style={{ color: "#D4AF37" }}>PKR {packagePrice.toLocaleString()}</span>
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
          Special Requests (Optional)
        </label>
        <textarea
          value={formData.special_requests}
          onChange={(e) => update("special_requests", e.target.value)}
          rows={3}
          placeholder="Dietary requirements, accessibility needs, etc."
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "#D4AF37" } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

/* ── Shared Field ── */
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": "#D4AF37" } as React.CSSProperties}
      />
    </div>
  );
}