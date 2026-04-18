import { Suspense } from "react";
import Link from "next/link";
import { getActivePackages, type Package } from "@/lib/actions/customer-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Package Card ─────────────────────────────────────────────────────────────

function PackageCard({ pkg }: { pkg: Package }) {
  const spotsLeft =
    pkg.max_capacity != null && pkg.current_bookings != null
      ? pkg.max_capacity - pkg.current_bookings
      : null;

  const isAlmostFull = spotsLeft !== null && spotsLeft <= 5;

  return (
    <Link
      href={`/packages/${pkg.id}`}
      style={{ textDecoration: "none", display: "block" }}
      className="package-card"
    >
      <article
        style={{
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 2px 12px rgba(0,33,71,0.08), 0 1px 3px rgba(0,33,71,0.04)",
          overflow: "hidden",
          border: "1px solid #eef0f4",
          transition: "box-shadow 0.25s, transform 0.25s",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 12px 40px rgba(0,33,71,0.14), 0 2px 8px rgba(0,33,71,0.06)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 2px 12px rgba(0,33,71,0.08), 0 1px 3px rgba(0,33,71,0.04)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }}
      >
        {/* Image / Placeholder */}
        <div
          style={{
            height: 180,
            background: pkg.image_url
              ? `url(${pkg.image_url}) center/cover`
              : "#f0f3f8",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {!pkg.image_url && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 36 }}>🕌</span>
              <span
                style={{
                  fontSize: 11,
                  color: "#9aa5b4",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Umrah Package
              </span>
            </div>
          )}

          {/* Airline badge */}
          {pkg.airline && (
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                background: "rgba(255,255,255,0.95)",
                borderRadius: 20,
                padding: "4px 10px",
                display: "flex",
                alignItems: "center",
                gap: 5,
                boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              }}
            >
              <span style={{ fontSize: 12 }}>✈</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#002147",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {pkg.airline}
              </span>
            </div>
          )}

          {/* Almost full badge */}
          {isAlmostFull && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "#D4AF37",
                borderRadius: 20,
                padding: "4px 10px",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Only {spotsLeft} left
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "20px 20px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#002147",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              marginBottom: 6,
              lineHeight: 1.3,
            }}
          >
            {pkg.name}
          </h3>

          {pkg.description && (
            <p
              style={{
                fontSize: 13,
                color: "#6b7a8d",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.55,
                marginBottom: 14,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {pkg.description}
            </p>
          )}

          {/* Meta chips */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 16,
              marginTop: "auto",
            }}
          >
            <MetaChip icon="🕐" label={`${pkg.duration_days} days`} />
            {pkg.departure_city && <MetaChip icon="📍" label={pkg.departure_city} />}
            {pkg.hotel_makkah && <MetaChip icon="🏨" label={pkg.hotel_makkah} />}
          </div>

          {/* Price + CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #f0f2f5",
              paddingTop: 14,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 10,
                  color: "#9aa5b4",
                  fontFamily: "'DM Sans', sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "block",
                }}
              >
                Per Person
              </span>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#002147",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  lineHeight: 1,
                }}
              >
                ${pkg.price.toLocaleString()}
              </span>
            </div>
            <div
              style={{
                background: "#D4AF37",
                color: "#fff",
                borderRadius: 8,
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: "0.02em",
              }}
            >
              View Details →
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function MetaChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 20,
        background: "#f5f7fa",
        fontSize: 11,
        color: "#4a5568",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500,
      }}
    >
      <span>{icon}</span> {label}
    </span>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function PackageGridSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 24,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#f5f7fa",
            borderRadius: 14,
            height: 360,
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

async function PackagesGrid() {
  const packages = await getActivePackages();

  if (packages.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          color: "#9aa5b4",
        }}
      >
        <span style={{ fontSize: 48 }}>🕌</span>
        <p
          style={{
            marginTop: 16,
            fontSize: 16,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          No packages available at the moment. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 24,
      }}
    >
      {packages.map((pkg) => (
        <PackageCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
}

export default function PackagesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#FFFFFF",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#002147",
          padding: "48px 24px 40px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#D4AF37",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 10,
          }}
        >
          Trusted Umrah & Tour Specialists
        </p>
        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          Available Packages
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.65)",
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Choose from our carefully curated Umrah and tour packages, designed
          for a seamless sacred journey.
        </p>
      </div>

      {/* Gold divider */}
      <div style={{ height: 4, background: "#D4AF37" }} />

      {/* Grid */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        <Suspense fallback={<PackageGridSkeleton />}>
          <PackagesGrid />
        </Suspense>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </main>
  );
}