"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBooking, type Package, type BookingFormData } from "@/lib/actions/customer-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookingModalProps {
  package: Package;
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4; // 4 = success

interface FormState {
  full_name: string;
  phone: string;
  email: string;
  passport_no: string;
  passport_expiry: string;
  nationality: string;
  num_travelers: number;
  special_requests: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

// ─── Step slide variants ──────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const transition = { duration: 0.32, ease: [0.4, 0, 0.2, 1] as const };

// ─── Validation ───────────────────────────────────────────────────────────────

function validateStep1(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.full_name.trim()) errors.full_name = "Full name is required.";
  if (!/^\+?[\d\s\-]{7,15}$/.test(form.phone))
    errors.phone = "Enter a valid phone number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address.";
  return errors;
}

function validateStep2(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.passport_no.trim()) errors.passport_no = "Passport number is required.";
  if (!form.passport_expiry) errors.passport_expiry = "Expiry date is required.";
  else if (new Date(form.passport_expiry) <= new Date())
    errors.passport_expiry = "Passport must not be expired.";
  if (!form.nationality.trim()) errors.nationality = "Nationality is required.";
  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({
  label,
  id,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#002147",
          fontFamily: "'Cormorant Garamond', Georgia, serif",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        {...props}
        style={{
          padding: "11px 14px",
          border: `1.5px solid ${error ? "#c0392b" : "#d0d7e2"}`,
          borderRadius: 8,
          fontSize: 15,
          color: "#002147",
          background: "#fff",
          outline: "none",
          fontFamily: "'DM Sans', sans-serif",
          transition: "border-color 0.2s",
          width: "100%",
          boxSizing: "border-box",
          ...props.style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#D4AF37";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "#c0392b" : "#d0d7e2";
        }}
      />
      {error && (
        <span style={{ fontSize: 12, color: "#c0392b", marginTop: 2 }}>
          {error}
        </span>
      )}
    </div>
  );
}

function StepIndicator({ current, total }: { current: Step; total: number }) {
  const steps = [
    { n: 1, label: "Details" },
    { n: 2, label: "Passport" },
    { n: 3, label: "Confirm" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: 28,
      }}
    >
      {steps.map((s, i) => {
        const isDone = (current as number) > s.n;
        const isActive = current === s.n;
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isDone ? "#D4AF37" : isActive ? "#002147" : "#f0f2f5",
                  border: `2px solid ${isDone || isActive ? "transparent" : "#d0d7e2"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                }}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: isActive ? "#fff" : "#9aa5b4",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {s.n}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: isActive ? "#002147" : isDone ? "#D4AF37" : "#9aa5b4",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 56,
                  height: 2,
                  background: (current as number) > s.n ? "#D4AF37" : "#e8eaed",
                  marginBottom: 22,
                  transition: "background 0.3s",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BookingModal({ package: pkg, isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    full_name: "",
    phone: "",
    email: "",
    passport_no: "",
    passport_expiry: "",
    nationality: "",
    num_travelers: 1,
    special_requests: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});

  const update = useCallback(
    (field: keyof FormState, value: string | number) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const goNext = useCallback(() => {
    if (step === 1) {
      const e = validateStep1(form);
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    if (step === 2) {
      const e = validateStep2(form);
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setDirection(1);
    setStep((s) => (s + 1) as Step);
  }, [step, form]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => (s - 1) as Step);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const payload: BookingFormData = {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      passport_no: form.passport_no,
      passport_expiry: form.passport_expiry,
      nationality: form.nationality,
      package_id: pkg.id,
      num_travelers: form.num_travelers,
      special_requests: form.special_requests || undefined,
    };

    const result = await createBooking(payload);

    if (result.success && result.booking_id) {
      setBookingId(result.booking_id);
      setDirection(1);
      setStep(4);
    } else {
      setSubmitError(result.error ?? "Something went wrong.");
    }

    setIsSubmitting(false);
  }, [form, pkg.id]);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setForm({
        full_name: "", phone: "", email: "",
        passport_no: "", passport_expiry: "", nationality: "",
        num_travelers: 1, special_requests: "",
      });
      setErrors({});
      setSubmitError(null);
      setBookingId(null);
    }, 300);
  }, [onClose]);

  if (!isOpen) return null;

  const totalPrice = pkg.price * form.num_travelers;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,33,71,0.55)",
              backdropFilter: "blur(4px)",
              zIndex: 999,
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={transition}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(520px, 95vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 24px 80px rgba(0,33,71,0.22), 0 4px 16px rgba(0,33,71,0.08)",
              zIndex: 1000,
              padding: "32px 32px 28px",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4AF37", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                  Book Package
                </p>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#002147", fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.2 }}>
                  {pkg.name}
                </h2>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#9aa5b4", flexShrink: 0 }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                </svg>
              </button>
            </div>

            {/* Package pill info */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { icon: "✈", text: pkg.airline ?? "TBA" },
                { icon: "🕐", text: `${pkg.duration_days} days` },
                { icon: "💰", text: `$${pkg.price.toLocaleString()} / person` },
              ].map((item) => (
                <span key={item.text} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 20,
                  background: "#f5f7fa", fontSize: 12, color: "#002147",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                }}>
                  <span>{item.icon}</span> {item.text}
                </span>
              ))}
            </div>

            {/* Step indicator (hidden on success) */}
            {step !== 4 && <StepIndicator current={step} total={3} />}

            {/* ── Steps ── */}
            <div style={{ overflow: "hidden", position: "relative", minHeight: 280 }}>
              <AnimatePresence custom={direction} mode="wait">

                {/* Step 1: Basic Details */}
                {step === 1 && (
                  <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition}>
                    <h3 style={stepTitleStyle}>Your Details</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                      <InputField label="Full Name" id="full_name" type="text" placeholder="As on passport" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} error={errors.full_name} />
                      <InputField label="Phone Number" id="phone" type="tel" placeholder="+92 300 0000000" value={form.phone} onChange={(e) => update("phone", e.target.value)} error={errors.phone} />
                      <InputField label="Email Address" id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} error={errors.email} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={labelStyle}>Number of Travelers</label>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <button onClick={() => update("num_travelers", Math.max(1, form.num_travelers - 1))} style={counterBtnStyle}>−</button>
                          <span style={{ fontSize: 18, fontWeight: 700, color: "#002147", minWidth: 28, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>{form.num_travelers}</span>
                          <button onClick={() => update("num_travelers", Math.min(pkg.max_capacity ?? 20, form.num_travelers + 1))} style={counterBtnStyle}>+</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Passport Info */}
                {step === 2 && (
                  <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition}>
                    <h3 style={stepTitleStyle}>Passport Information</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                      <InputField label="Passport Number" id="passport_no" type="text" placeholder="e.g. AA1234567" value={form.passport_no} onChange={(e) => update("passport_no", e.target.value.toUpperCase())} error={errors.passport_no} />
                      <InputField label="Passport Expiry Date" id="passport_expiry" type="date" value={form.passport_expiry} onChange={(e) => update("passport_expiry", e.target.value)} error={errors.passport_expiry} />
                      <InputField label="Nationality" id="nationality" type="text" placeholder="e.g. Pakistani" value={form.nationality} onChange={(e) => update("nationality", e.target.value)} error={errors.nationality} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={labelStyle}>Special Requests (Optional)</label>
                        <textarea
                          placeholder="Wheelchair, dietary needs, etc."
                          value={form.special_requests}
                          onChange={(e) => update("special_requests", e.target.value)}
                          rows={3}
                          style={{ padding: "11px 14px", border: "1.5px solid #d0d7e2", borderRadius: 8, fontSize: 14, color: "#002147", fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirmation Summary */}
                {step === 3 && (
                  <motion.div key="step3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition}>
                    <h3 style={stepTitleStyle}>Confirm Booking</h3>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 0 }}>
                      <SummarySection title="Package">
                        <SummaryRow label="Package" value={pkg.name} />
                        <SummaryRow label="Airline" value={pkg.airline ?? "TBA"} />
                        <SummaryRow label="Duration" value={`${pkg.duration_days} days`} />
                        {pkg.departure_date && <SummaryRow label="Departure" value={new Date(pkg.departure_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />}
                      </SummarySection>
                      <SummarySection title="Traveler">
                        <SummaryRow label="Name" value={form.full_name} />
                        <SummaryRow label="Email" value={form.email} />
                        <SummaryRow label="Phone" value={form.phone} />
                        <SummaryRow label="Passport No." value={form.passport_no} />
                        <SummaryRow label="Nationality" value={form.nationality} />
                      </SummarySection>
                      {/* Price Breakdown */}
                      <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "14px 16px", marginTop: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={summaryLabelStyle}>Price per person</span>
                          <span style={summaryValueStyle}>${pkg.price.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                          <span style={summaryLabelStyle}>Travelers</span>
                          <span style={summaryValueStyle}>× {form.num_travelers}</span>
                        </div>
                        <div style={{ borderTop: "1.5px solid #e2e5ec", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: "#002147", fontFamily: "'DM Sans', sans-serif" }}>Total Amount</span>
                          <span style={{ fontWeight: 800, fontSize: 20, color: "#D4AF37", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>${totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 11, color: "#9aa5b4", marginTop: 8, textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
                        Your booking will be placed with status <strong style={{ color: "#002147" }}>Pending</strong> and our team will contact you shortly.
                      </p>
                      {submitError && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ background: "#fff5f5", border: "1px solid #fcc", borderRadius: 8, padding: "10px 14px", marginTop: 8, fontSize: 13, color: "#c0392b", fontFamily: "'DM Sans', sans-serif" }}>
                          ⚠ {submitError}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Success */}
                {step === 4 && (
                  <motion.div key="step4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition} style={{ textAlign: "center", padding: "20px 0 8px" }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }} style={{ width: 72, height: 72, borderRadius: "50%", background: "#D4AF37", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M6 16L12.5 22.5L26 9" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                    <h3 style={{ fontSize: 24, fontWeight: 700, color: "#002147", fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: 8 }}>Booking Confirmed!</h3>
                    <p style={{ fontSize: 14, color: "#556070", fontFamily: "'DM Sans', sans-serif", marginBottom: 8, lineHeight: 1.6 }}>
                      Your request has been received. Our team will contact you shortly to finalize your journey.
                    </p>
                    {bookingId && (
                      <div style={{ background: "#f5f7fa", borderRadius: 8, padding: "10px 16px", display: "inline-block", marginBottom: 20 }}>
                        <span style={{ fontSize: 11, color: "#9aa5b4", fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>Booking Reference</span>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#002147", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{bookingId.slice(0, 8).toUpperCase()}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer Actions ── */}
            <div style={{ display: "flex", justifyContent: step === 1 ? "flex-end" : "space-between", alignItems: "center", marginTop: 24, gap: 12, borderTop: "1px solid #f0f2f5", paddingTop: 20 }}>
              {step > 1 && step < 4 && (
                <button onClick={goBack} style={backBtnStyle}>
                  ← Back
                </button>
              )}

              {step === 4 ? (
                <button onClick={handleClose} style={{ ...primaryBtnStyle, width: "100%" }}>
                  Close
                </button>
              ) : step === 3 ? (
                <button onClick={handleSubmit} disabled={isSubmitting} style={{ ...primaryBtnStyle, opacity: isSubmitting ? 0.7 : 1, minWidth: 160 }}>
                  {isSubmitting ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }} />
                      Submitting...
                    </span>
                  ) : "Confirm Booking →"}
                </button>
              ) : (
                <button onClick={goNext} style={primaryBtnStyle}>
                  Continue →
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#D4AF37", fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>{title}</p>
      <div style={{ borderRadius: 10, border: "1px solid #e8eaed", overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderBottom: "1px solid #f0f2f5", gap: 12 }}>
      <span style={summaryLabelStyle}>{label}</span>
      <span style={{ ...summaryValueStyle, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const stepTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#002147",
  fontFamily: "'Cormorant Garamond', Georgia, serif",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#002147",
  fontFamily: "'Cormorant Garamond', Georgia, serif",
};

const summaryLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#7a8699",
  fontFamily: "'DM Sans', sans-serif",
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#002147",
  fontFamily: "'DM Sans', sans-serif",
};

const primaryBtnStyle: React.CSSProperties = {
  background: "#D4AF37",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
  cursor: "pointer",
  letterSpacing: "0.02em",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  transition: "background 0.2s, transform 0.15s",
};

const backBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1.5px solid #d0d7e2",
  borderRadius: 8,
  padding: "11px 20px",
  fontSize: 14,
  fontWeight: 600,
  color: "#556070",
  fontFamily: "'DM Sans', sans-serif",
  cursor: "pointer",
};

const counterBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1.5px solid #d0d7e2",
  background: "#fff",
  fontSize: 18,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#002147",
  fontWeight: 600,
};