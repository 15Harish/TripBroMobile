import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ImageBackground, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { getWeather } from '../services/apiServices';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../constants/theme';
import { POPULAR_DESTINATIONS } from '../constants/config';

const { width } = Dimensions.get('window');

const TripCard = ({ trip, onPress }) => {
  const startDate = new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDate = new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const days = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24));

  return (
    <TouchableOpacity style={styles.tripCard} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.tripCardGradient}>
        <View style={styles.tripCardTop}>
          <View>
            <Text style={styles.tripDestination}>{trip.destination}</Text>
            <Text style={styles.tripDates}>{startDate} – {endDate}</Text>
          </View>
          <View style={styles.tripBadge}>
            <Text style={styles.tripBadgeText}>{days}d</Text>
          </View>
        </View>
        <View style={styles.tripCardBottom}>
          <View style={styles.tripStat}>
            <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.tripStatText}>{trip.currency || 'USD'} {trip.budget?.toLocaleString()}</Text>
          </View>
          <View style={styles.tripStat}>
            <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.tripStatText}>{trip.group_size} {trip.group_size === 1 ? 'person' : 'people'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: trip.status === 'planned' ? 'rgba(16,185,129,0.2)' : 'rgba(255,107,53,0.2)' }]}>
            <Text style={[styles.statusText, { color: trip.status === 'planned' ? '#10B981' : COLORS.accent }]}>
              {trip.status || 'planned'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { trips, getUserTrips } = useTrip();
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadData = useCallback(async () => {
    if (user) {
      await getUserTrips(user.id);
      const w = await getWeather('New York');
      setWeather(w);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Traveler';
  const upcomingTrips = trips.filter(t => new Date(t.end_date) >= new Date());
  const now = new Date();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <LinearGradient colors={['#0077BE', '#004F8B']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting()},</Text>
              <Text style={styles.userName}>{userName} 👋</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerDate}>
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Total Trips', value: trips.length, icon: '✈️' },
              { label: 'Upcoming', value: upcomingTrips.length, icon: '🗓️' },
              { label: 'Countries', value: new Set(trips.map(t => t.destination?.split(',').pop()?.trim())).size, icon: '🌍' },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Create New Trip */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateTrip')} activeOpacity={0.9}>
            <LinearGradient colors={[COLORS.accent, '#E55520']} style={styles.createBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View>
                <Text style={styles.createBtnTitle}>Plan New Trip</Text>
                <Text style={styles.createBtnSub}>AI-powered itinerary in minutes</Text>
              </View>
              <View style={styles.createBtnIcon}>
                <Ionicons name="add" size={28} color={COLORS.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Weather Widget */}
        {weather && (
          <View style={styles.section}>
            <View style={styles.weatherCard}>
              <Ionicons name="partly-sunny" size={32} color={COLORS.warning} />
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherCity}>{weather.city}, {weather.country}</Text>
                <Text style={styles.weatherDesc}>{weather.description}</Text>
              </View>
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
            </View>
          </View>
        )}

        {/* Recent Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Trips</Text>
            {trips.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('TripHistory')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : trips.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={styles.emptyTitle}>No trips yet!</Text>
              <Text style={styles.emptyText}>Create your first AI-powered travel itinerary</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('CreateTrip')}>
                <Text style={styles.emptyBtnText}>Create First Trip</Text>
              </TouchableOpacity>
            </View>
          ) : (
            trips.slice(0, 3).map(trip => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={() => navigation.navigate('Itinerary', { tripId: trip.id, trip })}
              />
            ))
          )}
        </View>

        {/* Explore Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Destinations</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destScroll}>
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <TouchableOpacity
                key={i}
                style={styles.destCard}
                onPress={() => navigation.navigate('CreateTrip', { prefillDestination: dest.name })}
              >
                <ImageBackground source={{ uri: dest.image }} style={styles.destImage} imageStyle={{ borderRadius: BORDER_RADIUS.lg }}>
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.destOverlay}>
                    <Text style={styles.destName}>{dest.name}</Text>
                    <Text style={styles.destCountry}>{dest.country}</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 55, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  greeting: { fontSize: 14, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: 26, fontFamily: FONTS.heading, color: COLORS.white },
  notifBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BORDER_RADIUS.full, padding: 10 },
  headerDate: { fontSize: 13, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.65)', marginBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', gap: SPACING.sm },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, alignItems: 'center' },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 20, fontFamily: FONTS.heading, color: COLORS.white },
  statLabel: { fontSize: 11, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  section: { paddingHorizontal: SPACING.md, paddingTop: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 20, fontFamily: FONTS.heading, color: COLORS.text },
  seeAll: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: COLORS.primary },
  createBtn: { borderRadius: BORDER_RADIUS.xl, overflow: 'hidden', ...SHADOW.medium },
  createBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  createBtnTitle: { fontSize: 20, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: 4 },
  createBtnSub: { fontSize: 13, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.85)' },
  createBtnIcon: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: BORDER_RADIUS.full, padding: SPACING.sm },
  weatherCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, gap: SPACING.md, ...SHADOW.small },
  weatherInfo: { flex: 1 },
  weatherCity: { fontSize: 15, fontFamily: FONTS.bodySemiBold, color: COLORS.text },
  weatherDesc: { fontSize: 13, fontFamily: FONTS.body, color: COLORS.textSecondary, textTransform: 'capitalize' },
  weatherTemp: { fontSize: 28, fontFamily: FONTS.heading, color: COLORS.primary },
  tripCard: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.sm, ...SHADOW.small },
  tripCardGradient: { padding: SPACING.md },
  tripCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md },
  tripDestination: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: 4 },
  tripDates: { fontSize: 13, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.8)' },
  tripBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 10, paddingVertical: 4 },
  tripBadgeText: { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLORS.white },
  tripCardBottom: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  tripStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripStatText: { fontSize: 12, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.8)' },
  statusBadge: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 3, borderRadius: BORDER_RADIUS.full },
  statusText: { fontSize: 11, fontFamily: FONTS.bodyMedium, textTransform: 'capitalize' },
  emptyState: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xxl, alignItems: 'center', ...SHADOW.small },
  emptyIcon: { fontSize: 60, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 20, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  emptyBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.full, paddingVertical: 12, paddingHorizontal: 28 },
  emptyBtnText: { color: COLORS.white, fontFamily: FONTS.bodySemiBold, fontSize: 15 },
  destScroll: { marginHorizontal: -SPACING.md, paddingHorizontal: SPACING.md },
  destCard: { marginRight: SPACING.sm },
  destImage: { width: 145, height: 185, justifyContent: 'flex-end' },
  destOverlay: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.sm },
  destName: { color: COLORS.white, fontFamily: FONTS.headingSemiBold, fontSize: 15 },
  destCountry: { color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.body, fontSize: 11 },
});
