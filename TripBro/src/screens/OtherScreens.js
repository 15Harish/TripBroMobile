import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Switch, ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { getExchangeRates } from '../services/apiServices';
import { POPULAR_DESTINATIONS } from '../constants/config';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../constants/theme';

// ─── TRIP HISTORY ────────────────────────────────────────────────────────────
export function TripHistoryScreen({ navigation }) {
  const { trips, getUserTrips, deleteTrip } = useTrip();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { if (user) getUserTrips(user.id); }, [user]);

  const filtered = trips.filter(t => {
    const matchSearch = t.destination?.toLowerCase().includes(search.toLowerCase());
    const now = new Date();
    if (filter === 'upcoming') return matchSearch && new Date(t.start_date) >= now;
    if (filter === 'past') return matchSearch && new Date(t.end_date) < now;
    return matchSearch;
  });

  const handleDelete = (id) => {
    Alert.alert('Delete Trip', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTrip(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Trips</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={styles.filterRow}>
          {['all', 'upcoming', 'past'].map(f => (
            <TouchableOpacity key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✈️</Text>
            <Text style={styles.emptyTitle}>No trips found</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateTrip')}>
              <Text style={styles.createBtnText}>Plan a Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map(trip => {
            const days = Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24));
            const isPast = new Date(trip.end_date) < new Date();
            return (
              <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() => navigation.navigate('Itinerary', { tripId: trip.id, trip })}
                activeOpacity={0.85}
              >
                <View style={styles.tripCardLeft}>
                  <View style={[styles.tripStatusDot, { backgroundColor: isPast ? COLORS.gray : COLORS.success }]} />
                  <View style={styles.tripInfo}>
                    <Text style={styles.tripDest}>{trip.destination}</Text>
                    <Text style={styles.tripDate}>
                      {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –
                      {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <View style={styles.tripMeta}>
                      <Text style={styles.tripMetaText}>{days} days</Text>
                      <Text style={styles.tripMetaDot}>·</Text>
                      <Text style={styles.tripMetaText}>{trip.group_size} {trip.group_size === 1 ? 'person' : 'people'}</Text>
                      <Text style={styles.tripMetaDot}>·</Text>
                      <Text style={styles.tripMetaText}>{trip.currency} {trip.budget?.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.tripCardActions}>
                  <TouchableOpacity style={styles.repeatBtn} onPress={() => navigation.navigate('CreateTrip', { prefillDestination: trip.destination })}>
                    <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(trip.id)}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

// ─── EXPLORE ─────────────────────────────────────────────────────────────────
export function ExploreScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const filtered = POPULAR_DESTINATIONS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.country.toLowerCase().includes(search.toLowerCase())
  );

  const CATEGORIES = [
    { id: 'beach', label: 'Beach', icon: '🏖️' },
    { id: 'mountain', label: 'Mountain', icon: '🏔️' },
    { id: 'city', label: 'City', icon: '🏙️' },
    { id: 'cultural', label: 'Cultural', icon: '🏛️' },
    { id: 'adventure', label: 'Adventure', icon: '🎯' },
    { id: 'foodie', label: 'Foodie', icon: '🍜' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.header}>
        <Text style={styles.exploreTitle}>Explore 🌍</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.exploreSection}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={styles.catCard}>
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={styles.catLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.exploreSection}>Popular Destinations</Text>
        <View style={styles.destGrid}>
          {filtered.map((dest, i) => (
            <TouchableOpacity
              key={i}
              style={styles.destGridCard}
              onPress={() => navigation.navigate('CreateTrip', { prefillDestination: dest.name })}
            >
              <ImageBackground
                source={{ uri: dest.image }}
                style={styles.destGridImage}
                imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
              >
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.destGridOverlay}>
                  <Text style={styles.destGridName}>{dest.name}</Text>
                  <Text style={styles.destGridCountry}>{dest.country}</Text>
                  <View style={styles.planBtn}>
                    <Text style={styles.planBtnText}>Plan Trip</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
export function SettingsScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [notifs, setNotifs] = useState(true);
  const [weather, setWeather] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [rates, setRates] = useState(null);
  const [amount, setAmount] = useState('100');
  const [toCurrency, setToCurrency] = useState('EUR');

  useEffect(() => { getExchangeRates('USD').then(setRates); }, []);

  const converted = rates && amount ? (parseFloat(amount) * (rates[toCurrency] || 1)).toFixed(2) : '—';
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Currency converter */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>💱 Currency Converter</Text>
          <View style={styles.converterRow}>
            <View style={styles.converterInput}>
              <Text style={styles.converterLabel}>USD</Text>
              <TextInput
                style={styles.converterField}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="Amount"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
            <Ionicons name="swap-horizontal" size={22} color={COLORS.primary} />
            <View style={styles.converterInput}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {currencies.filter(c => c !== 'USD').map(c => (
                  <TouchableOpacity key={c} style={[styles.currBtn, toCurrency === c && styles.currBtnActive]} onPress={() => setToCurrency(c)}>
                    <Text style={[styles.currBtnText, toCurrency === c && styles.currBtnTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.convertedAmount}>{converted} {toCurrency}</Text>
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>🔔 Notifications</Text>
          {[
            { label: 'Push Notifications', sub: 'Trip reminders and updates', val: notifs, set: setNotifs },
            { label: 'Weather Alerts', sub: 'Weather updates for planned trips', val: weather, set: setWeather },
          ].map(({ label, sub, val, set }) => (
            <View key={label} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingLabel}>{label}</Text>
                <Text style={styles.settingSub}>{sub}</Text>
              </View>
              <Switch value={val} onValueChange={set} trackColor={{ false: COLORS.grayMedium, true: COLORS.primaryLight }} thumbColor={val ? COLORS.primary : COLORS.white} />
            </View>
          ))}
        </View>

        {/* Display */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>🎨 Display</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingSub}>Coming soon</Text>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: COLORS.grayMedium, true: COLORS.primaryLight }} thumbColor={darkMode ? COLORS.primary : COLORS.white} />
          </View>
        </View>

        {/* Account */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>👤 Account</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingSub}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.dangerBtn} onPress={() => Alert.alert('Delete Account', 'Contact support to delete your account.')}>
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* App info */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>ℹ️ App Info</Text>
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Build', value: '2025.01' },
          ].map(({ label, value }) => (
            <View key={label} style={styles.settingRow}>
              <Text style={styles.settingLabel}>{label}</Text>
              <Text style={styles.settingValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 55, paddingBottom: SPACING.md, paddingHorizontal: SPACING.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  headerTitle: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.white },
  exploreTitle: { fontSize: 28, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: SPACING.sm },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.full, paddingVertical: 10, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  searchInput: { flex: 1, fontFamily: FONTS.body, fontSize: 14, color: COLORS.text },
  filterRow: { flexDirection: 'row', gap: SPACING.sm },
  filterBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: BORDER_RADIUS.full, backgroundColor: 'rgba(255,255,255,0.2)' },
  filterBtnActive: { backgroundColor: COLORS.white },
  filterText: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  filterTextActive: { color: COLORS.primary },
  body: { flex: 1 },
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxl },
  emptyIcon: { fontSize: 60, marginBottom: SPACING.md },
  emptyTitle: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: SPACING.md },
  createBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.full, paddingVertical: 12, paddingHorizontal: 28 },
  createBtnText: { color: COLORS.white, fontFamily: FONTS.bodySemiBold, fontSize: 15 },
  tripCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, margin: SPACING.sm, marginBottom: 0, padding: SPACING.md, ...SHADOW.small },
  tripCardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  tripStatusDot: { width: 10, height: 10, borderRadius: 5 },
  tripInfo: { flex: 1 },
  tripDest: { fontSize: 16, fontFamily: FONTS.headingSemiBold, color: COLORS.text, marginBottom: 2 },
  tripDate: { fontSize: 13, fontFamily: FONTS.body, color: COLORS.textSecondary, marginBottom: 4 },
  tripMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripMetaText: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textLight },
  tripMetaDot: { fontSize: 12, color: COLORS.grayMedium },
  tripCardActions: { flexDirection: 'row', gap: SPACING.xs },
  repeatBtn: { backgroundColor: COLORS.primary + '15', borderRadius: BORDER_RADIUS.sm, padding: 8 },
  deleteBtn: { backgroundColor: COLORS.error + '15', borderRadius: BORDER_RADIUS.sm, padding: 8 },
  exploreSection: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.text, marginHorizontal: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  catScroll: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  catCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, marginRight: SPACING.sm, alignItems: 'center', ...SHADOW.small, minWidth: 80 },
  catIcon: { fontSize: 24, marginBottom: 4 },
  catLabel: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLORS.text },
  destGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.sm, gap: SPACING.sm },
  destGridCard: { width: '48%' },
  destGridImage: { height: 170, justifyContent: 'flex-end' },
  destGridOverlay: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.sm },
  destGridName: { color: COLORS.white, fontFamily: FONTS.headingSemiBold, fontSize: 16 },
  destGridCountry: { color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.body, fontSize: 12, marginBottom: SPACING.xs },
  planBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: BORDER_RADIUS.full, paddingVertical: 4, paddingHorizontal: 12, alignSelf: 'flex-start' },
  planBtnText: { fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLORS.white },
  settingsCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, margin: SPACING.md, marginBottom: 0, padding: SPACING.md, ...SHADOW.small },
  settingsTitle: { fontSize: 16, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: SPACING.md },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  settingLeft: { flex: 1 },
  settingLabel: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: COLORS.text },
  settingSub: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary, marginTop: 1 },
  settingValue: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.textSecondary },
  converterRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  converterInput: { flex: 1 },
  converterLabel: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary, marginBottom: 4 },
  converterField: { backgroundColor: COLORS.grayLight, borderRadius: BORDER_RADIUS.md, padding: 12, fontFamily: FONTS.body, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  currBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.grayLight, marginRight: 6, marginBottom: 6 },
  currBtnActive: { backgroundColor: COLORS.primary },
  currBtnText: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLORS.text },
  currBtnTextActive: { color: COLORS.white },
  convertedAmount: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.primary, marginTop: SPACING.sm },
  dangerBtn: { marginTop: SPACING.sm, paddingVertical: 10, borderRadius: BORDER_RADIUS.md, borderWidth: 1.5, borderColor: COLORS.error + '40', alignItems: 'center' },
  dangerText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.error },
});
