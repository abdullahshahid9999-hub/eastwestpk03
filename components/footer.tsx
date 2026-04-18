// components/Footer.tsx
export function Footer() {
  return (
    <footer
      style={{ backgroundColor: "#002147", borderTop: "2px solid #D4AF37" }}
      className="mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12c1.8 0 3.508-.397 5.04-1.108C17.92 25.49 14 21.12 14 16s3.92-9.49 7.04-10.892A11.95 11.95 0 0016 4z"
                  fill="#D4AF37"
                />
              </svg>
              <div>
                <p
                  style={{ fontFamily: "'Playfair Display', serif", color: "#D4AF37" }}
                  className="text-base font-bold leading-none"
                >
                  East and West
                </p>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase">
                  Travel Services
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner for Umrah journeys and curated tour packages, delivering
              exceptional service with every trip.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              style={{ color: "#D4AF37" }}
              className="text-sm font-semibold uppercase tracking-widest mb-4"
            >
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {["Packages", "Umrah Packages", "Tours", "My Bookings", "Contact Us"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="hover:text-[#D4AF37] transition-colors duration-150"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{ color: "#D4AF37" }}
              className="text-sm font-semibold uppercase tracking-widest mb-4"
            >
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <span style={{ color: "#D4AF37" }}>✉</span>
                info@eastandwesttravel.com
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: "#D4AF37" }}>✆</span>
                +92 300 000 0000
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: "#D4AF37" }}>⌖</span>
                Lahore, Pakistan
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-2"
          style={{ borderColor: "#D4AF37", opacity: 0.3 }}
        />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 -mt-1">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} East and West Travel Services. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Built with ♥ for seamless pilgrimages
          </p>
        </div>
      </div>
    </footer>
  );
}