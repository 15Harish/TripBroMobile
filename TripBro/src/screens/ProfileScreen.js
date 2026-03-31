import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../constants/theme';

const StatCard = ({ icon, value, label, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuItem = ({ icon, label, subtitle, onPress, color, rightElement }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIconWrap, { backgroundColor: (color || COLORS.primary) + '15' }]}>
      <Ionicons name={icon} size={20} color={color || COLORS.primary} />
    </View>
    <View style={styles.menuText}>
      <Text style={styles.menuLabel}>{label}</Text>
      {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
    </View>
    {rightElement || <Ionicons name="chevron-forward" size={18} color={COLORS.grayMedium} />}
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { trips } = useTrip();
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [saving, setSaving] = useState(false);

  const uniqueDestinations = [...new Set(trips.map(t => t.destination?.split(',')[0]?.trim()))].filter(Boolean);
  const totalBudgetUsed = trips.reduce((sum, t) => sum + (t.budget || 0), 0);
  const completedTrips = trips.filter(t => new Date(t.end_date) < new Date());

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const getInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#0077BE', '#003D5C']} style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity onPress={() => setEditMode(!editMode)}>
              <Ionicons name={editMode ? 'close' : 'create-outline'} size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            {editMode ? (
              <View style={styles.editNameRow}>
                <TextInput
                  style={styles.nameInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />
              </View>
            ) : (
              <Text style={styles.userName}>{user?.user_metadata?.full_name || 'Traveler'}</Text>
            )}
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.memberBadge}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.warning} />
              <Text style={styles.memberText}>TripBro Member</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard icon="✈️" value={trips.length} label="Trips" color={COLORS.primary} />
          <StatCard icon="🌍" value={uniqueDestinations.length} label="Places" color={COLORS.success} />
          <StatCard icon="✅" value={completedTrips.length} label="Done" color={COLORS.accent} />
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="person-outline" label="Personal Info" subtitle={user?.email} onPress={() => {}} />
            <MenuItem icon="map-outline" label="My Trips" subtitle={`${trips.length} trips planned`} onPress={() => navigation.navigate('TripHistory')} />
            <MenuItem icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Preferences</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="compass-outline" label="Travel Style" subtitle="Update your preferences" onPress={() => {}} />
            <MenuItem icon="restaurant-outline" label="Dietary Preferences" onPress={() => {}} />
            <MenuItem icon="accessibility-outline" label="Accessibility Needs" onPress={() => {}} />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="help-circle-outline" label="Help & FAQ" onPress={() => {}} color={COLORS.primaryLight} />
            <MenuItem icon="chatbubble-outline" label="Contact Us" onPress={() => {}} color={COLORS.primaryLight} />
            <MenuItem icon="star-outline" label="Rate App" onPress={() => {}} color={COLORS.warning} />
          </View>
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>TripBro v1.0.0</Text>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 55, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.md },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  headerTitle: { fontSize: 22, fontFamily: FONTS.heading, color: COLORS.white },
  avatarSection: { alignItems: 'center' },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontSize: 32, fontFamily: FONTS.heading, color: COLORS.white },
  userName: { fontSize: 22, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: 4 },
  userEmail: { fontSize: 14, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.75)', marginBottom: SPACING.sm },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BORDER_RADIUS.full, paddingVertical: 5, paddingHorizontal: 14 },
  memberText: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLORS.white },
  editNameRow: { marginBottom: SPACING.sm },
  nameInput: { fontSize: 20, fontFamily: FONTS.heading, color: COLORS.white, borderBottomWidth: 1.5, borderBottomColor: 'rgba(255,255,255,0.6)', paddingVertical: 4, paddingHorizontal: 8, textAlign: 'center', minWidth: 200 },
  statsContainer: { flexDirection: 'row', margin: SPACING.md, gap: SPACING.sm },
  statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, alignItems: 'center', borderLeftWidth: 3, ...SHADOW.small },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 22, fontFamily: FONTS.heading },
  statLabel: { fontSize: 11, fontFamily: FONTS.body, color: COLORS.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: SPACING.sm },
  menuCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOW.small },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  menuIconWrap: { width: 40, height: 40, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontFamily: FONTS.bodyMedium, color: COLORS.text },
  menuSub: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary, marginTop: 1 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.error + '40', ...SHADOW.small },
  signOutText: { fontSize: 16, fontFamily: FONTS.bodyMedium, color: COLORS.error },
  version: { textAlign: 'center', fontSize: 12, fontFamily: FONTS.body, color: COLORS.textLight, marginBottom: SPACING.sm },
});
