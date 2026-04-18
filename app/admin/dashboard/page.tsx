"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const supabase = createClientComponentClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data, error } = await supabase.from("bookings").select("*");
        if (error) throw error;
        setBookings(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const columns =
    bookings.length > 0
      ? Object.keys(bookings[0]).filter((k) => k !== "id")
      : [];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Georgia', serif", color: "#f0e6c8" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #0d1b3e 0%, #1a2f5e 50%, #0d1b3e 100%)",
        borderBottom: "2px solid #c9a84c",
        padding: "24px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 24px rgba(201,168,76,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "48px", height: "48px",
            background: "linear-gradient(135deg, #c9a84c, #e8c96a)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", boxShadow: "0 0 16px rgba(201,168,76,0.4)",
          }}>✈</div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: "#c9a84c", letterSpacing: "0.04em" }}>
              East &amp; West Travel
            </div>
            <div style={{ fontSize: "11px", color: "#8a9bc5", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Admin Dashboard
            </div>
          </div>
        </div>
        <div style={{
          background: "rgba(201,168,76,0.1)",
          border: "1px solid rgba(201,168,76,0.3)",
          borderRadius: "20px",
          padding: "6px 16px",
          fontSize: "13px",
          color: "#c9a84c",
        }}>
          {loading ? "Loading…" : `${bookings.length} Booking${bookings.length !== 1 ? "s" : ""}`}
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: "40px" }}>
        <h1 style={{
          fontSize: "28px", fontWeight: "700",
          color: "#e8d5a0", marginBottom: "8px",
          letterSpacing: "0.02em",
        }}>
          Bookings
        </h1>
        <p style={{ color: "#6a7fa8", marginBottom: "32px", fontSize: "14px" }}>
          All reservations from the bookings table
        </p>

        {/* States */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#c9a84c" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⏳</div>
            <div style={{ fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Fetching bookings…</div>
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(220,53,69,0.1)",
            border: "1px solid rgba(220,53,69,0.4)",
            borderRadius: "8px",
            padding: "20px 24px",
            color: "#f08090",
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6a7fa8" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗂️</div>
            <div>No bookings found.</div>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid rgba(201,168,76,0.2)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "linear-gradient(90deg, #1a2f5e, #0d1b3e)" }}>
                  <th style={{ ...thStyle, width: "50px" }}>#</th>
                  {columns.map((col) => (
                    <th key={col} style={thStyle}>{col.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((row, i) => (
                  <tr
                    key={row.id ?? i}
                    style={{
                      background: i % 2 === 0 ? "rgba(13,27,62,0.6)" : "rgba(26,47,94,0.3)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? "rgba(13,27,62,0.6)" : "rgba(26,47,94,0.3)")}
                  >
                    <td style={{ ...tdStyle, color: "#6a7fa8", textAlign: "center" }}>{i + 1}</td>
                    {columns.map((col) => (
                      <td key={col} style={tdStyle}>
                        {row[col] === null || row[col] === undefined
                          ? <span style={{ color: "#6a7fa8", fontStyle: "italic" }}>—</span>
                          : typeof row[col] === "boolean"
                          ? <span style={{ color: row[col] ? "#4caf82" : "#f08070" }}>{row[col] ? "Yes" : "No"}</span>
                          : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 18px",
  textAlign: "left",
  color: "#c9a84c",
  fontWeight: "600",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  borderBottom: "2px solid rgba(201,168,76,0.3)",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "13px 18px",
  color: "#d4c9a8",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  maxWidth: "260px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};