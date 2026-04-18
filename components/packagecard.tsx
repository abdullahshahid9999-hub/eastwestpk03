import Link from "next/link";
import Image from "next/image";
import type { Database } from "@/lib/database.types";

type Package = Database["public"]["Tables"]["packages"]["Row"];

export default function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <div className="group rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 bg-white">
      <div className="relative h-52 overflow-hidden">
        {pkg.image_url ? (
          <Image
            src={pkg.image_url}
            alt={pkg.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#002147] to-[#003580]" />
        )}
        {pkg.is_featured && (
          <span className="absolute top-3 right-3 bg-[#D4AF37] text-[#002147] text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">
            Featured
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-[#002147] font-bold text-lg leading-snug mb-1">{pkg.name}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{pkg.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#D4AF37] text-xl font-bold">
              ${pkg.price?.toLocaleString()}
            </span>
            <span className="text-gray-400 text-xs ml-1">/ person</span>
          </div>
          <Link
            href={`/book?package=${pkg.id}`}
            className="px-4 py-2 bg-[#002147] text-white text-xs font-bold tracking-widest uppercase rounded hover:bg-[#D4AF37] hover:text-[#002147] transition-colors"
          >
            Book
          </Link>
        </div>
        {pkg.duration_days && (
          <p className="text-gray-400 text-xs mt-3">⏱ {pkg.duration_days} days</p>
        )}
      </div>
    </div>
  );
}