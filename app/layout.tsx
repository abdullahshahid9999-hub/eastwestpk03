// app/layout.tsx
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "East and West Travel Services",
  description: "Premium Umrah & Tour Packages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-white text-gray-900 min-h-screen flex flex-col">
        {/* Sonner Toast Container */}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: "'DM Sans', sans-serif",
              border: "1px solid #D4AF37",
            },
            classNames: {
              success: "!bg-[#002147] !text-white !border-[#D4AF37]",
              error: "!bg-red-900 !text-white !border-red-400",
            },
          }}
        />

        {/* Branded Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}