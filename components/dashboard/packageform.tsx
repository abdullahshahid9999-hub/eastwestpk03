"use client";

import { useState, useCallback, useTransition } from "react";
import {
  PlusCircle,
  Trash2,
  Save,
  Loader2,
  ChevronDown,
  Hotel,
  Plane,
  MapPin,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  upsertPackage,
  type PackageUpsertPayload,
  type HotelRow,
} from "@/lib/actions/booking-actions";

// ─── Static Data ───────────────────────────────────────────────────────────────

const AIRLINE_CODES: { code: string; name: string }[] = [
  { code: "PK", name: "Pakistan International Airlines" },
  { code: "EK", name: "Emirates" },
  { code: "QR", name: "Qatar Airways" },
  { code: "SV", name: "Saudi Arabian Airlines" },
  { code: "EY", name: "Etihad Airways" },
  { code: "FZ", name: "flydubai" },
  { code: "G9", name: "Air Arabia" },
  { code: "XY", name: "flynas" },
  { code: "WY", name: "Oman Air" },
  { code: "GF", name: "Gulf Air" },
  { code: "TK", name: "Turkish Airlines" },
  { code: "MS", name: "EgyptAir" },
];

const CITY_CODES: { code: string; name: string; country: string }[] = [
  { code: "JED", name: "Jeddah", country: "Saudi Arabia" },
  { code: "MED", name: "Madinah", country: "Saudi Arabia" },
  { code: "RUH", name: "Riyadh", country: "Saudi Arabia" },
  { code: "DXB", name: "Dubai", country: "UAE" },
  { code: "DOH", name: "Doha", country: "Qatar" },
  { code: "IST", name: "Istanbul", country: "Turkey" },
  { code: "CAI", name: "Cairo", country: "Egypt" },
  { code: "KHI", name: "Karachi", country: "Pakistan" },
  { code: "LHE", name: "Lahore", country: "Pakistan" },
  { code: "ISB", name: "Islamabad", country: "Pakistan" },
  { code: "KUL", name: "Kuala Lumpur", country: "Malaysia" },
  { code: "AMM", name: "Amman", country: "Jordan" },
];

const ROOM_TYPES = [
  "Quad Sharing",
  "Triple Sharing",
  "Double/Twin",
  "Single",
  "Suite",
];

// ─── Sub-Components ────────────────────────────────────────────────────────────

function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { code: string; name: string; country?: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter(
    (o) =>
      o.code.toLowerCase().includes(query.toLowerCase()) ||
      o.name.toLowerCase().includes(query.toLowerCase())
  );

  const selected = options.find((o) => o.code === value);

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:border-[#002147]/40 transition-colors text-sm"
        onClick={() => setOpen(!open)}
      >
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {selected ? (
            <span className="flex items-center gap-2">
              <span className="font-mono font-semibold text-[#002147] bg-[#002147]/8 px-1.5 py-0.5 rounded text-xs">
                {selected.code}
              </span>
              {selected.name}
            </span>
          ) : (
            placeholder ?? "Select..."
          )}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:border-[#002147]/50"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-xs text-slate-400 text-center">
                No results
              </p>
            ) : (
              filtered.map((opt) => (
                <div
                  key={opt.code}
                  onClick={() => {
                    onChange(opt.code);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`px-3 py-2.5 flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 text-sm transition-colors ${
                    value === opt.code ? "bg-[#002147]/5" : ""
                  }`}
                >
                  <span className="font-mono font-semibold text-[#002147] bg-[#002147]/8 px-1.5 py-0.5 rounded text-xs min-w-[40px] text-center">
                    {opt.code}
                  </span>
                  <span className="text-slate-700">{opt.name}</span>
                  {opt.country && (
                    <span className="text-slate-400 text-xs ml-auto">
                      {opt.country}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
  min,
}: {
  label: string;
  type?: string;
  value: string | number;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        min={min}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#002147]/50 focus:ring-2 focus:ring-[#002147]/10 transition-all bg-white"
      />
    </div>
  );
}

// ─── Hotel Row ─────────────────────────────────────────────────────────────────

function HotelRowInput({
  hotel,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  hotel: HotelRow;
  index: number;
  onChange: (idx: number, field: keyof HotelRow, value: string | number) => void;
  onRemove: (idx: number) => void;
  canRemove: boolean;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Hotel size={14} className="text-[#002147]" />
          <span className="text-xs font-semibold text-[#002147]">
            Hotel {index + 1}
          </span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <SearchableSelect
          label="City"
          value={hotel.city}
          onChange={(v) => onChange(index, "city", v)}
          options={CITY_CODES}
          placeholder="Select city"
          required
        />
        <InputField
          label="Hotel Name"
          value={hotel.hotel_name}
          onChange={(v) => onChange(index, "hotel_name", v)}
          required
          placeholder="e.g. Hilton Makkah"
        />
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Room Type <span className="text-red-500">*</span>
          </label>
          <select
            value={hotel.room_type}
            onChange={(e) => onChange(index, "room_type", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-[#002147]/50 focus:ring-2 focus:ring-[#002147]/10 bg-white transition-all"
          >
            {ROOM_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>
        </div>
        <InputField
          label="Check-in Date"
          type="date"
          value={hotel.check_in}
          onChange={(v) => onChange(index, "check_in", v)}
          required
        />
        <InputField
          label="Check-out Date"
          type="date"
          value={hotel.check_out}
          onChange={(v) => onChange(index, "check_out", v)}
          required
        />
        <InputField
          label="Nights"
          type="number"
          value={hotel.nights}
          onChange={(v) => onChange(index, "nights", parseInt(v) || 0)}
          min="1"
          required
        />
      </div>
    </div>
  );
}

// ─── Default States ────────────────────────────────────────────────────────────

const defaultHotel = (): HotelRow => ({
  city: "",
  hotel_name: "",
  check_in: "",
  check_out: "",
  room_type: "Quad Sharing",
  nights: 1,
});

interface FormState {
  name: string;
  type: "umrah" | "tour" | "hajj";
  price: string;
  duration_days: string;
  max_seats: string;
  status: "active" | "inactive" | "sold_out";
  airline_code: string;
  flight_no: string;
  departure_city: string;
  arrival_city: string;
  departure_date: string;
  return_date: string;
  visa_included: boolean;
  transport_included: boolean;
  notes: string;
  hotels: HotelRow[];
}

const initialState: FormState = {
  name: "",
  type: "umrah",
  price: "",
  duration_days: "",
  max_seats: "",
  status: "active",
  airline_code: "",
  flight_no: "",
  departure_city: "",
  arrival_city: "JED",
  departure_date: "",
  return_date: "",
  visa_included: true,
  transport_included: true,
  notes: "",
  hotels: [defaultHotel()],
};

// ─── Main Form ─────────────────────────────────────────────────────────────────

interface PackageFormProps {
  existingPackage?: PackageUpsertPayload & { id: string };
  onSuccess?: () => void;
}

export default function PackageForm({
  existingPackage,
  onSuccess,
}: PackageFormProps) {
  const [form, setForm] = useState<FormState>(
    existingPackage
      ? {
          name: existingPackage.name,
          type: existingPackage.type,
          price: String(existingPackage.price),
          duration_days: String(existingPackage.duration_days),
          max_seats: String(existingPackage.max_seats),
          status: existingPackage.status,
          airline_code: existingPackage.metadata.airline_code,
          flight_no: existingPackage.metadata.flight_no,
          departure_city: existingPackage.metadata.departure_city,
          arrival_city: existingPackage.metadata.arrival_city,
          departure_date: existingPackage.metadata.departure_date,
          return_date: existingPackage.metadata.return_date ?? "",
          visa_included: existingPackage.metadata.visa_included,
          transport_included: existingPackage.metadata.transport_included,
          notes: existingPackage.metadata.notes ?? "",
          hotels:
            existingPackage.metadata.hotels.length > 0
              ? existingPackage.metadata.hotels
              : [defaultHotel()],
        }
      : initialState
  );

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const set = (field: keyof FormState) => (value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateHotel = useCallback(
    (idx: number, field: keyof HotelRow, value: string | number) => {
      setForm((prev) => {
        const hotels = [...prev.hotels];
        hotels[idx] = { ...hotels[idx], [field]: value };
        return { ...prev, hotels };
      });
    },
    []
  );

  const addHotel = () =>
    setForm((prev) => ({ ...prev, hotels: [...prev.hotels, defaultHotel()] }));

  const removeHotel = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      hotels: prev.hotels.filter((_, i) => i !== idx),
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const payload: PackageUpsertPayload = {
      ...(existingPackage?.id ? { id: existingPackage.id } : {}),
      name: form.name,
      type: form.type,
      price: parseFloat(form.price),
      duration_days: parseInt(form.duration_days),
      max_seats: parseInt(form.max_seats),
      status: form.status,
      metadata: {
        airline_code: form.airline_code,
        flight_no: form.flight_no,
        departure_city: form.departure_city,
        arrival_city: form.arrival_city,
        departure_date: form.departure_date,
        return_date: form.return_date || undefined,
        hotels: form.hotels,
        visa_included: form.visa_included,
        transport_included: form.transport_included,
        notes: form.notes || undefined,
      },
    };

    startTransition(async () => {
      const res = await upsertPackage(payload);
      setResult(res);
      if (res.success) {
        onSuccess?.();
        if (!existingPackage) setForm(initialState);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Result Banner */}
      {result && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
            result.success
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {result.success ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {result.message}
        </div>
      )}

      {/* Section: Package Info */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#D4AF37] rounded-full" />
          <h3 className="text-sm font-semibold text-[#002147]">
            Package Information
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <InputField
              label="Package Name"
              value={form.name}
              onChange={set("name")}
              required
              placeholder="e.g. Ramadan Umrah 2025 — 14 Days"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Package Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => set("type")(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-[#002147]/50 focus:ring-2 focus:ring-[#002147]/10 bg-white transition-all"
            >
              <option value="umrah">Umrah</option>
              <option value="tour">Tour</option>
              <option value="hajj">Hajj</option>
            </select>
          </div>

          <InputField
            label="Price per Person (PKR)"
            type="number"
            value={form.price}
            onChange={set("price")}
            required
            placeholder="e.g. 150000"
            min="0"
          />
          <InputField
            label="Duration (Days)"
            type="number"
            value={form.duration_days}
            onChange={set("duration_days")}
            required
            placeholder="e.g. 14"
            min="1"
          />
          <InputField
            label="Max Seats"
            type="number"
            value={form.max_seats}
            onChange={set("max_seats")}
            required
            placeholder="e.g. 40"
            min="1"
          />

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status")(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-[#002147]/50 focus:ring-2 focus:ring-[#002147]/10 bg-white transition-all"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>
        </div>
      </section>

      {/* Section: Flight Details */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#D4AF37] rounded-full" />
          <Plane size={14} className="text-[#002147]" />
          <h3 className="text-sm font-semibold text-[#002147]">
            Flight Details
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SearchableSelect
            label="Airline"
            value={form.airline_code}
            onChange={set("airline_code")}
            options={AIRLINE_CODES}
            placeholder="Select airline"
            required
          />
          <InputField
            label="Flight Number"
            value={form.flight_no}
            onChange={set("flight_no")}
            required
            placeholder="e.g. PK-743"
          />
          <SearchableSelect
            label="Departure City"
            value={form.departure_city}
            onChange={set("departure_city")}
            options={CITY_CODES}
            placeholder="Origin city"
            required
          />
          <SearchableSelect
            label="Arrival City"
            value={form.arrival_city}
            onChange={set("arrival_city")}
            options={CITY_CODES}
            placeholder="Destination city"
            required
          />
          <InputField
            label="Departure Date"
            type="date"
            value={form.departure_date}
            onChange={set("departure_date")}
            required
          />
          <InputField
            label="Return Date"
            type="date"
            value={form.return_date}
            onChange={set("return_date")}
          />
        </div>

        {/* Inclusions */}
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.visa_included}
              onChange={(e) => set("visa_included")(e.target.checked)}
              className="w-4 h-4 accent-[#002147] cursor-pointer"
            />
            <span className="text-sm text-slate-700 group-hover:text-[#002147] transition-colors">
              Visa Included
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.transport_included}
              onChange={(e) => set("transport_included")(e.target.checked)}
              className="w-4 h-4 accent-[#002147] cursor-pointer"
            />
            <span className="text-sm text-slate-700 group-hover:text-[#002147] transition-colors">
              Transport Included
            </span>
          </label>
        </div>
      </section>

      {/* Section: Hotels */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#D4AF37] rounded-full" />
            <MapPin size={14} className="text-[#002147]" />
            <h3 className="text-sm font-semibold text-[#002147]">
              Hotel Accommodations
            </h3>
          </div>
          <button
            type="button"
            onClick={addHotel}
            className="flex items-center gap-1.5 text-xs font-medium text-[#002147] hover:text-[#D4AF37] border border-[#002147]/20 hover:border-[#D4AF37]/40 px-3 py-1.5 rounded-lg transition-all"
          >
            <PlusCircle size={13} />
            Add Hotel
          </button>
        </div>
        <div className="space-y-3">
          {form.hotels.map((hotel, idx) => (
            <HotelRowInput
              key={idx}
              hotel={hotel}
              index={idx}
              onChange={updateHotel}
              onRemove={removeHotel}
              canRemove={form.hotels.length > 1}
            />
          ))}
        </div>
      </section>

      {/* Section: Notes */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-[#D4AF37] rounded-full" />
          <Info size={14} className="text-[#002147]" />
          <h3 className="text-sm font-semibold text-[#002147]">
            Additional Notes
          </h3>
        </div>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes")(e.target.value)}
          rows={3}
          placeholder="Enter any special inclusions, restrictions, or notes about this package..."
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#002147]/50 focus:ring-2 focus:ring-[#002147]/10 transition-all resize-none bg-white"
        />
      </section>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            setForm(initialState);
            setResult(null);
          }}
          className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-lg transition-all"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#002147] text-white text-sm font-medium rounded-lg hover:bg-[#002147]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {isPending
            ? "Saving..."
            : existingPackage
              ? "Update Package"
              : "Create Package"}
        </button>
      </div>
    </form>
  );
}