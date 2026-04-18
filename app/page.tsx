import Link from "next/link";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import PackageCard from "@/components/PackageCard";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("is_featured", true)
    .order("price", { ascending: true })
    .limit(6);

  return (
    <main className="min-h-screen bg-[#F8F6F1] font-serif">
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-[#002147]/95 backdrop-blur border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-[#D4AF37] text-xl tracking-widest font-bold uppercase">
            East &amp; West Travel
          </span>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#packages" className="text-white/70 hover:text-[#D4AF37] transition-colors tracking-wide">
              Packages
            </Link>
            <Link href="#services" className="text-white/70 hover:text-[#D4AF37] transition-colors tracking-wide">
              Services
            </Link>
            <Link
              href="/book"
              className="px-5 py-2 bg-[#D4AF37] text-[#002147] text-xs font-bold tracking-widest uppercase rounded hover:bg-[#b8942a] transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#002147]">
        {/* Decorative grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow */}
        <div className="absolute inset-0 bg-gradient-radial from-[#D4AF37]/10 via-transparent to-transparent" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-6">
            Crafting Extraordinary Journeys Since 1998
          </p>
          <h1 className="text-white text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
            Where East Meets West,
            <br />
            <span className="text-[#D4AF37]">Adventure Begins.</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Bespoke travel experiences from the Silk Road to the Atlantic coast — curated for the discerning explorer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#packages"
              className="px-8 py-4 bg-[#D4AF37] text-[#002147] font-bold text-sm tracking-widest uppercase rounded hover:bg-[#b8942a] transition-all hover:scale-105"
            >
              Explore Packages
            </Link>
            <Link
              href="/book"
              className="px-8 py-4 border border-[#D4AF37]/50 text-[#D4AF37] font-bold text-sm tracking-widest uppercase rounded hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
            >
              Custom Journey
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs tracking-widest uppercase">
          <span>Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#D4AF37]/50 to-transparent animate-pulse" />
        </div>
      </section>

      {/* STATS BAR */}
      <div className="bg-[#002147] border-y border-[#D4AF37]/20 py-8">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "120+", label: "Destinations" },
            { value: "25K+", label: "Happy Travellers" },
            { value: "26", label: "Years of Excellence" },
            { value: "4.9★", label: "Average Rating" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[#D4AF37] text-3xl font-bold">{s.value}</p>
              <p className="text-white/50 text-xs tracking-widest uppercase mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED PACKAGES */}
      <section id="packages" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-3">Handpicked For You</p>
          <h2 className="text-[#002147] text-4xl md:text-5xl font-bold tracking-tight">
            Featured Packages
          </h2>
          <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-6 rounded" />
        </div>

        {packages && packages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <PackageSkeleton key={i} />
            ))}
          </div>
        )}

        <div className="text-center mt-14">
          <Link
            href="/packages"
            className="inline-block px-10 py-4 border-2 border-[#002147] text-[#002147] font-bold text-sm tracking-widest uppercase rounded hover:bg-[#002147] hover:text-white transition-all"
          >
            View All Packages
          </Link>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="bg-[#002147] py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-3">What We Offer</p>
            <h2 className="text-white text-4xl md:text-5xl font-bold tracking-tight">Our Services</h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-6 rounded" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((svc) => (
              <div
                key={svc.title}
                className="border border-[#D4AF37]/20 rounded-xl p-8 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/20 transition-colors text-2xl">
                  {svc.icon}
                </div>
                <h3 className="text-white text-xl font-bold mb-3">{svc.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{svc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 px-6 bg-[#F8F6F1]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[#002147] text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-[#002147]/60 text-lg mb-10">
            Our travel consultants are available 24/7 to craft the perfect itinerary for you.
          </p>
          <Link
            href="/book"
            className="inline-block px-12 py-5 bg-[#002147] text-white font-bold text-sm tracking-widest uppercase rounded hover:bg-[#001530] transition-all hover:scale-105"
          >
            Book Your Trip
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#001530] py-10 px-6 text-center text-white/30 text-xs tracking-wide border-t border-[#D4AF37]/10">
        <p className="text-[#D4AF37] font-bold text-base mb-2">East &amp; West Travel Services</p>
        <p>© {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </main>
  );
}

function PackageSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 animate-pulse">
      <div className="h-52 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mt-4" />
      </div>
    </div>
  );
}

const SERVICES = [
  {
    icon: "✈️",
    title: "Flight Bookings",
    description:
      "Economy to first-class ticketing across all major carriers. Best fare guarantees with flexible change policies.",
  },
  {
    icon: "🏨",
    title: "Hotel Reservations",
    description:
      "Curated selection of boutique hotels, luxury resorts, and serviced apartments worldwide.",
  },
  {
    icon: "🗺️",
    title: "Custom Itineraries",
    description:
      "Bespoke travel plans designed around your interests, pace, and budget by our expert consultants.",
  },
  {
    icon: "🛂",
    title: "Visa Assistance",
    description:
      "End-to-end visa documentation support for 80+ countries, including express processing options.",
  },
  {
    icon: "🚌",
    title: "Ground Transport",
    description:
      "Airport transfers, private chauffeurs, and guided tour buses arranged seamlessly.",
  },
  {
    icon: "🛡️",
    title: "Travel Insurance",
    description:
      "Comprehensive coverage plans including medical, trip cancellation, and baggage protection.",
  },
];