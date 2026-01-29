// Supabase Database Types
// Generated from schema: profiles, dealers, vehicles, visit_routes

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VehicleStatusEnum = 'open' | 'visited' | 'excluded';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          updated_at?: string;
        };
      };
      dealers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          address: string;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          dealer_id: string | null;
          brand: string;
          model: string;
          year: number | null;
          price: number | null;
          priority: number;
          status: VehicleStatusEnum;
          listing_url: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dealer_id?: string | null;
          brand: string;
          model: string;
          year?: number | null;
          price?: number | null;
          priority?: number;
          status?: VehicleStatusEnum;
          listing_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dealer_id?: string | null;
          brand?: string;
          model?: string;
          year?: number | null;
          price?: number | null;
          priority?: number;
          status?: VehicleStatusEnum;
          listing_url?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      visit_routes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          vehicle_ids: string[];
          start_latitude: number | null;
          start_longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          vehicle_ids: string[];
          start_latitude?: number | null;
          start_longitude?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          vehicle_ids?: string[];
          start_latitude?: number | null;
          start_longitude?: number | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      geocode_address: {
        Args: { address: string };
        Returns: { latitude: number; longitude: number };
      };
      optimize_route: {
        Args: { vehicle_ids: string[]; start_lat: number; start_lng: number };
        Returns: { ordered_ids: string[]; total_distance: number };
      };
    };
    Enums: {
      vehicle_status: VehicleStatusEnum;
    };
  };
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Dealer = Database['public']['Tables']['dealers']['Row'];
export type DealerInsert = Database['public']['Tables']['dealers']['Insert'];
export type DealerUpdate = Database['public']['Tables']['dealers']['Update'];

export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
export type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];

export type VisitRoute = Database['public']['Tables']['visit_routes']['Row'];
export type VisitRouteInsert = Database['public']['Tables']['visit_routes']['Insert'];
export type VisitRouteUpdate = Database['public']['Tables']['visit_routes']['Update'];
