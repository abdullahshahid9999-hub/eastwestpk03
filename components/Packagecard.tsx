// components/PackageCard.tsx
"use client";

import Link from "next/link";

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  category: "umrah" | "tours";
  image_url?: string;
  duration_days?: number;
}

const categoryLabel: Record<string, string> = {
  umrah: "Umrah",
  tours: "Tour",
};

const categoryColor: Record<string, { bg: string; text: string }> = {
  umrah: { bg: "#002147", text: "#D4AF37" },
  tours: { bg: "#D4AF37", text: "#002147" },
};

export function PackageCard({ pkg }: { pkg: Package }) {
  const colors = categoryColor[pkg.category] ?? categoryColor.tours;

  return (
    <div className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col h-full">
      {/* Image */}
      <div className="relative overflow-hidden h-52 bg-gray-100">
        {pkg.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pkg.image_url}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: "#002147" + "10" }}
          >
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12c1.8 0 3.508-.397 5.04-1.108C17.92 25.49 14 21.12 14 16s3.92-9.49 7.04-10.892A11.95 11.95 0 0016 4z"
                fill="#D4AF37"
                opacity="0.4"
              />
            </svg>
          </div>
        )}

        {/* Duration badge */}
        {pkg.duration_days && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-medium text-gray-700">
            {pkg.duration_days} days
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category Badge */}
        <span
          className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-3 self-start"
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {categoryLabel[pkg.category]}
        </span>

        {/* Title */}
        <h3
          style={{ fontFamily: "'Playfair Display', serif", color: "#002147" }}
          className="text-lg font-semibold leading-snug mb-2"
        >
          {pkg.title}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
          {pkg.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">From</p>
            <p
              style={{ color: "#002147", fontFamily: "'Playfair Display', serif" }}
              className="text-xl font-bold"
            >
              PKR {pkg.price.toLocaleString()}
            </p>
          </div>

          <Link
            href={`/packages/${pkg.id}`}
            style={{ backgroundColor: "#002147", color: "#D4AF37", borderColor: "#D4AF37" }}
            className="border px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#002f63] transition-colors duration-200"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}