import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseAvailable } from '../services/supabase';

const TripContext  = createContext({});
const LOCAL_KEY    = '@tripbro_local_trips';

// ─── LOCAL STORAGE HELPERS ────────────────────────────────────────────────────
const loadLocalTrips = async () => {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveLocalTrips = async (trips) => {
  try { await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(trips)); } catch {}
};

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export const TripProvider = ({ children }) => {
  const [trips,       setTrips]       = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading,     setLoading]     = useState(false);

  // ── SAVE TRIP ─────────────────────────────────────────────────────────────
  const saveTrip = async (tripData, userId) => {
    setLoading(true);
    try {
      if (!isSupabaseAvailable()) {
        // Save locally
        const local = await loadLocalTrips();
        const newTrip = {
          id: `local-${Date.now()}`,
          user_id: userId || 'mock-user-001',
          destination:      tripData.destination,
          start_date:       tripData.startDate,
          end_date:         tripData.endDate,
          budget:           tripData.budget,
          currency:         tripData.currency || 'USD',
          group_size:       tripData.groupSize,
          travel_style:     tripData.travelStyle,
          itinerary_data:   tripData.itinerary,
          status:           'planned',
          created_at:       new Date().toISOString(),
        };
        const updated = [newTrip, ...local];
        await saveLocalTrips(updated);
        setTrips(updated);
        return { data: newTrip, error: null };
      }

      // Real Supabase save
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id:        userId,
          destination:    tripData.destination,
          start_date:     tripData.startDate,
          end_date:       tripData.endDate,
          budget:         tripData.budget,
          currency:       tripData.currency || 'USD',
          group_size:     tripData.groupSize,
          travel_style:   tripData.travelStyle,
          itinerary_data: tripData.itinerary,
          status:         'planned',
        })
        .select()
        .single();
      if (error) throw error;
      setTrips(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // ── LOAD TRIPS ────────────────────────────────────────────────────────────
  const getUserTrips = async (userId) => {
    setLoading(true);
    try {
      if (!isSupabaseAvailable()) {
        const local = await loadLocalTrips();
        setTrips(local);
        return { data: local, error: null };
      }
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTrips(data || []);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // ── UPDATE TRIP ───────────────────────────────────────────────────────────
  const updateTrip = async (tripId, updates) => {
    setLoading(true);
    try {
      if (!isSupabaseAvailable()) {
        const local = await loadLocalTrips();
        const updated = local.map(t =>
          t.id === tripId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
        );
        await saveLocalTrips(updated);
        setTrips(updated);
        const found = updated.find(t => t.id === tripId);
        if (currentTrip?.id === tripId) setCurrentTrip(found);
        return { data: found, error: null };
      }
      const { data, error } = await supabase
        .from('trips')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', tripId)
        .select()
        .single();
      if (error) throw error;
      setTrips(prev => prev.map(t => t.id === tripId ? data : t));
      if (currentTrip?.id === tripId) setCurrentTrip(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // ── DELETE TRIP ───────────────────────────────────────────────────────────
  const deleteTrip = async (tripId) => {
    try {
      if (!isSupabaseAvailable()) {
        const local = await loadLocalTrips();
        const updated = local.filter(t => t.id !== tripId);
        await saveLocalTrips(updated);
        setTrips(updated);
        return { error: null };
      }
      const { error } = await supabase.from('trips').delete().eq('id', tripId);
      if (error) throw error;
      setTrips(prev => prev.filter(t => t.id !== tripId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // ── GET SINGLE TRIP ───────────────────────────────────────────────────────
  const getTripById = async (tripId) => {
    try {
      if (!isSupabaseAvailable()) {
        const local = await loadLocalTrips();
        const found = local.find(t => t.id === tripId);
        if (found) setCurrentTrip(found);
        return { data: found || null, error: found ? null : new Error('Not found') };
      }
      const { data, error } = await supabase
        .from('trips').select('*').eq('id', tripId).single();
      if (error) throw error;
      setCurrentTrip(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return (
    <TripContext.Provider value={{
      trips, currentTrip, loading,
      saveTrip, getUserTrips, updateTrip, deleteTrip, getTripById, setCurrentTrip,
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
};