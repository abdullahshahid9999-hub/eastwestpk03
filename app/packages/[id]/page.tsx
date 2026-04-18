"use client";

// NOTE: This file uses a client component so BookingModal state can be managed.
// For SEO-critical apps, move data fetching to a parent Server Component
// and pass pkg as a prop to this Client Component.

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPackageById, type Package } from "@/lib/actions/customer-actions";
import BookingModal from "@/components/booking/BookingModal";

// ─── Inclusion badge ──────────────────────────────────────────────────────────

function InclusionBadge({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        background: "#f5f7fa",
        borderRadius: 8,
        borderLeft: "3px solid #D4AF37",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7L5.5 10.5L12 3.5" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span
        style={{
          fontSize: 13,
          color: "#334155",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid #f0f2f5",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: "#fff8e8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: 11,
            color: "#9aa5b4",
            fontFamily: "'DM Sans', sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 2,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#002147",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      {[200, 400, 100].map((h, i) => (
        <div
          key={i}
          style={{
            height: h,
            background: "#f5f7fa",
            borderRadius: 12,
            marginBottom: 24,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [pkg, setPkg] = useState<Package | null | undefined>(undefined);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPackageById(id).then((data) => setPkg(data));
  }, [id]);

  if (pkg === undefined) return <DetailSkeleton />;

  if (pkg === null) {
    return (
      <main style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <span style={{ fontSize: 48 }}>404</span>
        <p style={{ fontSize: 16, color: "#6b7a8d", fontFamily: "'DM Sans', sans-serif" }}>Package not found.</p>
        <Link href="/packages" style={{ color: "#D4AF37", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14 }}>← Back to Packages</Link>
      </main>
    );
  }

  const spotsLeft =
    pkg.max_capacity != null && pkg.current_bookings != null
      ? pkg.max_capacity - pkg.current_bookings
      : null;

  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          background: "#FFFFFF",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Back nav */}
        <div style={{ background: "#002147", padding: "14px 24px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <Link
              href="/packages"
              style={{
                color: "rgba(255,255,255,0.7)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← All Packages
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 80px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr min(340px, 100%)",
              gap: 32,
              alignItems: "start",
            }}
            className="detail-grid"
          >
            {/* ── Left Column ── */}
            <div>
              {/* Hero image */}
              <div
                style={{
                  height: 260,
                  borderRadius: 14,
                  background: pkg.image_url
                    ? `url(${pkg.image_url}) center/cover`
                    : "#f0f3f8",
                  marginBottom: 28,
                  display: pkg.image_url ? "block" : "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,33,71,0.1)",
                }}
              >
                {!pkg.image_url && <span style={{ fontSize: 64 }}>🕌</span>}
              </div>

              {/* Title */}
              <div style={{ marginBottom: 8 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#D4AF37",
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: 6,
                  }}
                >
                  Umrah Package
                </p>
                <h1
                  style={{
                    fontSize: "clamp(24px, 3vw, 34px)",
                    fontWeight: 700,
                    color: "#002147",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    lineHeight: 1.2,
                    marginBottom: 14,
                  }}
                >
                  {pkg.name}
                </h1>
                {pkg.description && (
                  <p
                    style={{
                      fontSize: 15,
                      color: "#556070",
                      lineHeight: 1.65,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {pkg.description}
                  </p>
                )}
              </div>

              {/* Package Details */}
              <div style={{ marginTop: 28 }}>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#002147",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    marginBottom: 4,
                    letterSpacing: "0.02em",
                  }}
                >
                  Package Details
                </h2>
                <div>
                  {pkg.airline && <InfoRow icon="✈" label="Airline" value={pkg.airline} />}
                  <InfoRow icon="🕐" label="Duration" value={`${pkg.duration_days} Days`} />
                  {pkg.departure_city && <InfoRow icon="📍" label="Departure City" value={pkg.departure_city} />}
                  {pkg.departure_date && (
                    <InfoRow icon="📅" label="Departure Date" value={new Date(pkg.departure_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
                  )}
                  {pkg.return_date && (
                    <InfoRow icon="🔁" label="Return Date" value={new Date(pkg.return_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} />
                  )}
                  {pkg.hotel_makkah && <InfoRow icon="🏨" label="Hotel — Makkah" value={pkg.hotel_makkah} />}
                  {pkg.hotel_madinah && <InfoRow icon="🏩" label="Hotel — Madinah" value={pkg.hotel_madinah} />}
                </div>
              </div>

              {/* Inclusions */}
              {pkg.inclusions && pkg.inclusions.length > 0 && (
                <div style={{ marginTop: 28 }}>
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#002147",
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      marginBottom: 12,
                    }}
                  >
                    What's Included
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {pkg.inclusions.map((item, i) => (
                      <InclusionBadge key={i} text={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Booking Card ── */}
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                boxShadow: "0 4px 24px rgba(0,33,71,0.1), 0 1px 4px rgba(0,33,71,0.05)",
                border: "1px solid #eef0f4",
                padding: "24px",
                position: "sticky",
                top: 24,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "#9aa5b4",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 4,
                }}
              >
                Starting From
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: "#002147",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    lineHeight: 1,
                  }}
                >
                  ${pkg.price.toLocaleString()}
                </span>
                <span style={{ fontSize: 13, color: "#9aa5b4", fontFamily: "'DM Sans', sans-serif" }}>
                  / person
                </span>
              </div>

              {/* Spot availability */}
              {spotsLeft !== null && (
                <div
                  style={{
                    background: spotsLeft <= 5 ? "#fff8e8" : "#f0faf5",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: spotsLeft <= 5 ? "#D4AF37" : "#22c55e",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: spotsLeft <= 5 ? "#92400e" : "#166534",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {spotsLeft > 0
                      ? `${spotsLeft} spots remaining`
                      : "Fully booked"}
                  </span>
                </div>
              )}

              {/* Summary bullets */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 20,
                  padding: "16px",
                  background: "#f8f9fb",
                  borderRadius: 10,
                }}
              >
                {[
                  { icon: "✈", text: pkg.airline ?? "TBA", label: "Airline" },
                  { icon: "🕐", text: `${pkg.duration_days} days`, label: "Duration" },
                  ...(pkg.departure_city ? [{ icon: "📍", text: pkg.departure_city, label: "From" }] : []),
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9aa5b4", fontFamily: "'DM Sans', sans-serif" }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#002147", fontFamily: "'DM Sans', sans-serif" }}>
                      {item.icon} {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={() => setIsBookingOpen(true)}
                disabled={spotsLeft === 0}
                style={{
                  width: "100%",
                  background: spotsLeft === 0 ? "#d0d7e2" : "#D4AF37",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "14px",
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: spotsLeft === 0 ? "not-allowed" : "pointer",
                  letterSpacing: "0.02em",
                  transition: "background 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (spotsLeft !== 0)
                    (e.currentTarget as HTMLButtonElement).style.background = "#c9a430";
                }}
                onMouseLeave={(e) => {
                  if (spotsLeft !== 0)
                    (e.currentTarget as HTMLButtonElement).style.background = "#D4AF37";
                }}
              >
                {spotsLeft === 0 ? "Fully Booked" : "Book This Package →"}
              </button>

              <p
                style={{
                  fontSize: 11,
                  color: "#9aa5b4",
                  textAlign: "center",
                  marginTop: 10,
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.5,
                }}
              >
                No payment required now. Our team will contact you to finalize.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        package={pkg}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 700px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}