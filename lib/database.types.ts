export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number | null;
          duration_days: number | null;
          image_url: string | null;
          is_featured: boolean;
          destination: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["packages"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["packages"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          passport_number: string;
          package_id: string;
          travel_date: string;
          num_travellers: number;
          total_price: number | null;
          special_requests: string | null;
          status: string | null;
          reference_number: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
    };
  };
}