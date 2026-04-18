// components/EmptyState.tsx
"use client";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: "#002147" + "12" }}
      >
        {icon ?? (
          <svg
            width="36"
            height="36"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#D4AF37"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
            />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3
        style={{ fontFamily: "'Playfair Display', serif", color: "#002147" }}
        className="text-2xl font-semibold mb-2"
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-500 text-sm max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {/* CTA */}
      {action && <div>{action}</div>}
    </div>
  );
}

/* ── Preset: No Packages ── */
export function NoPackagesState({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      title="No Packages Found"
      description="We couldn't find any packages matching your search. Try adjusting your filters or browse all available options."
      icon={
        <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12c1.8 0 3.508-.397 5.04-1.108C17.92 25.49 14 21.12 14 16s3.92-9.49 7.04-10.892A11.95 11.95 0 0016 4z"
            fill="#D4AF37"
            opacity="0.5"
          />
        </svg>
      }
      action={
        onReset ? (
          <button
            onClick={onReset}
            style={{ backgroundColor: "#002147", color: "#D4AF37", borderColor: "#D4AF37" }}
            className="border px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Clear Filters
          </button>
        ) : undefined
      }
    />
  );
}

/* ── Preset: No Bookings ── */
export function NoBookingsState() {
  return (
    <EmptyState
      title="No Bookings Yet"
      description="You haven't made any bookings yet. Explore our packages and start planning your journey."
      icon={
        <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      }
      action={
        <a
          href="/packages"
          style={{ backgroundColor: "#D4AF37", color: "#002147" }}
          className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Browse Packages
        </a>
      }
    />
  );
}