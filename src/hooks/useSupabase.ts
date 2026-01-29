import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { mockDealers, mockVehicles, mockProfile, getVehiclesWithDealers } from '@/data/mockData';
import type { Dealer, Vehicle, VehicleWithDealer, Profile } from '@/types';

// Convert snake_case DB rows to camelCase frontend types
const mapDbDealerToDealer = (row: any): Dealer => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  address: row.address,
  latitude: row.latitude,
  longitude: row.longitude,
  phone: row.phone,
  notes: row.notes,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const mapDbVehicleToVehicle = (row: any): Vehicle => ({
  id: row.id,
  userId: row.user_id,
  dealerId: row.dealer_id,
  brand: row.brand,
  model: row.model,
  year: row.year,
  price: row.price,
  priority: row.priority,
  status: row.status,
  listingUrl: row.listing_url,
  notes: row.notes,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const mapDbProfileToProfile = (row: any): Profile => ({
  id: row.id,
  email: row.email,
  displayName: row.display_name,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

// Dealers hooks
export const useDealers = () => {
  return useQuery<Dealer[]>({
    queryKey: ['dealers'],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !supabase) {
        return mockDealers;
      }
      const { data, error } = await supabase
        .from('dealers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data.map(mapDbDealerToDealer);
    },
  });
};

export const useCreateDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dealer: Omit<Dealer, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not configured');
      }
      const { data, error } = await supabase
        .from('dealers')
        .insert({
          user_id: dealer.userId,
          name: dealer.name,
          address: dealer.address,
          latitude: dealer.latitude,
          longitude: dealer.longitude,
          phone: dealer.phone,
          notes: dealer.notes,
        })
        .select()
        .single();
      if (error) throw error;
      return mapDbDealerToDealer(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
    },
  });
};

export const useUpdateDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Dealer> & { id: string }) => {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not configured');
      }
      const { data, error } = await supabase
        .from('dealers')
        .update({
          name: updates.name,
          address: updates.address,
          latitude: updates.latitude,
          longitude: updates.longitude,
          phone: updates.phone,
          notes: updates.notes,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return mapDbDealerToDealer(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
    },
  });
};

export const useDeleteDealer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not configured');
      }
      const { error } = await supabase.from('dealers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

// Vehicles hooks
export const useVehicles = () => {
  return useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !supabase) {
        return mockVehicles;
      }
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('priority', { ascending: false });
      if (error) throw error;
      return data.map(mapDbVehicleToVehicle);
    },
  });
};

export const useVehiclesWithDealers = () => {
  const { data: vehicles, ...vehiclesQuery } = useVehicles();
  const { data: dealers } = useDealers();

  const vehiclesWithDealers: VehicleWithDealer[] | undefined = vehicles?.map(vehicle => ({
    ...vehicle,
    dealer: dealers?.find(d => d.id === vehicle.dealerId) || null,
  }));

  return {
    data: vehiclesWithDealers,
    ...vehiclesQuery,
  };
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not configured');
      }
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          user_id: vehicle.userId,
          dealer_id: vehicle.dealerId,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          price: vehicle.price,
          priority: vehicle.priority,
          status: vehicle.status,
          listing_url: vehicle.listingUrl,
          notes: vehicle.notes,
        })
        .select()
        .single();
      if (error) throw error;
      return mapDbVehicleToVehicle(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vehicle> & { id: string }) => {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not configured');
      }
      const { data, error } = await supabase
        .from('vehicles')
        .update({
          dealer_id: updates.dealerId,
          brand: updates.brand,
          model: updates.model,
          year: updates.year,
          price: updates.price,
          priority: updates.priority,
          status: updates.status,
          listing_url: updates.listingUrl,
          notes: updates.notes,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return mapDbVehicleToVehicle(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not configured');
      }
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

// Profile hooks
export const useProfile = () => {
  return useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !supabase) {
        return mockProfile;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return mapDbProfileToProfile(data);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { displayName?: string }) => {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase not configured');
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: updates.displayName })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return mapDbProfileToProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
