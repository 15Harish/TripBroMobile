import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../services/supabase';

const TripContext = createContext({});

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(false);

  const saveTrip = async (tripData, userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: userId,
          destination: tripData.destination,
          start_date: tripData.startDate,
          end_date: tripData.endDate,
          budget: tripData.budget,
          currency: tripData.currency || 'USD',
          group_size: tripData.groupSize,
          travel_style: tripData.travelStyle,
          itinerary_data: tripData.itinerary,
          status: 'planned',
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

  const getUserTrips = async (userId) => {
    setLoading(true);
    try {
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

  const updateTrip = async (tripId, updates) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', tripId)
        .select()
        .single();
      if (error) throw error;
      setTrips(prev => prev.map(t => (t.id === tripId ? data : t)));
      if (currentTrip?.id === tripId) setCurrentTrip(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId) => {
    try {
      const { error } = await supabase.from('trips').delete().eq('id', tripId);
      if (error) throw error;
      setTrips(prev => prev.filter(t => t.id !== tripId));
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getTripById = async (tripId) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();
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
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within TripProvider');
  return context;
};
