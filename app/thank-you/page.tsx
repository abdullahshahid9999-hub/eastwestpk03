import Link from "next/link";

interface Props {
  searchParams: { ref?: string; name?: string };
}

export default function ThankYouPage({ searchParams }: Props) {
  const { ref, name } = searchParams;

  return (
    <main className="min-h-screen bg-[#F8F6F1] flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        {/* Gold checkmark ring */}
        <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37] flex items-center justify-center mx-auto mb-8 bg-[#D4AF37]/10">
          <svg
            className="w-10 h-10 text-[#D4AF37]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="text-[#D4AF37] text-xs tracking-[0.4em] uppercase mb-3">Booking Confirmed</p>
        <h1 className="text-[#002147] text-4xl font-bold mb-4">
          Thank You{name ? `, ${name}` : ""}!
        </h1>
        <p className="text-gray-500 text-base mb-8 leading-relaxed">
          Your booking has been received. A confirmation email has been sent to you. Our team will contact you within 24 hours.
        </p>

        {ref && (
          <div className="bg-[#002147] text-white rounded-xl px-8 py-5 mb-8 inline-block">
            <p className="text-white/50 text-xs tracking-widest uppercase mb-1">Reference Number</p>
            <p className="text-[#D4AF37] text-2xl font-bold tracking-widest">{ref}</p>
          </div>
        )}

        <p className="text-gray-400 text-sm mb-8">
          Please save your reference number for any future correspondence.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-[#002147] text-white font-bold text-sm tracking-widest uppercase rounded hover:bg-[#001530] transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/packages"
            className="px-8 py-3 border-2 border-[#002147] text-[#002147] font-bold text-sm tracking-widest uppercase rounded hover:bg-[#002147] hover:text-white transition-colors"
          >
            Browse More
          </Link>
        </div>
      </div>
    </main>
  );
}