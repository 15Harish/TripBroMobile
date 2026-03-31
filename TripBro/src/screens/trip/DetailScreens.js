import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../constants/theme';

export function AccommodationDetailScreen({ navigation, route }) {
  const { accommodation } = route.params || {};
  if (!accommodation) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerType}>{accommodation.type?.toUpperCase()}</Text>
          <Text style={styles.headerName}>{accommodation.name}</Text>
          <Text style={styles.headerLocation}>📍 {accommodation.location}</Text>
          <View style={styles.starsRow}>
            {[...Array(Math.round(accommodation.rating || 4))].map((_, i) => (
              <Ionicons key={i} name="star" size={16} color={COLORS.warning} />
            ))}
            <Text style={styles.ratingText}>{accommodation.rating}/5</Text>
          </View>
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceAmount}>${accommodation.pricePerNight}</Text>
          <Text style={styles.priceLabel}>/night</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{accommodation.description}</Text>
        </View>

        {accommodation.amenities?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenityGrid}>
              {accommodation.amenities.map((a, i) => (
                <View key={i} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationCard}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.locationText}>{accommodation.location}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        {accommodation.bookingUrl && (
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => Linking.openURL(accommodation.bookingUrl).catch(() => {})}
          >
            <LinearGradient colors={[COLORS.accent, COLORS.accentDark]} style={styles.bookBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="open-outline" size={20} color={COLORS.white} />
              <Text style={styles.bookBtnText}>Book Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.backFooterBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backFooterText}>Back to Itinerary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ActivityDetailScreen({ navigation, route }) {
  const { activity } = route.params || {};
  if (!activity) return null;
  const catColors = { attraction: COLORS.primary, restaurant: COLORS.accent, transport: COLORS.success, activity: COLORS.warning };
  const color = catColors[activity.category] || COLORS.primary;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[color, color + 'CC']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{activity.category?.toUpperCase()}</Text>
          </View>
          <Text style={styles.headerName}>{activity.name}</Text>
          <Text style={styles.headerLocation}>📍 {activity.location}</Text>
        </View>
        <View style={styles.actMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.white} />
            <Text style={styles.metaText}>{activity.time} · {activity.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="wallet-outline" size={16} color={COLORS.white} />
            <Text style={styles.metaText}>${activity.cost}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{activity.description}</Text>
        </View>

        {activity.tips && (
          <View style={[styles.section, styles.tipCard]}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={18} color={COLORS.warning} />
              <Text style={styles.tipTitle}>Pro Tip</Text>
            </View>
            <Text style={styles.tipText}>{activity.tips}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          {[
            { icon: 'location-outline', label: 'Location', value: activity.location },
            { icon: 'time-outline', label: 'Time', value: activity.time },
            { icon: 'hourglass-outline', label: 'Duration', value: activity.duration },
            { icon: 'wallet-outline', label: 'Cost', value: `$${activity.cost}` },
            { icon: 'ticket-outline', label: 'Booking', value: activity.bookingRequired ? 'Required' : 'Not required' },
          ].map((d, i) => (
            <View key={i} style={styles.detailRow}>
              <Ionicons name={d.icon} size={18} color={COLORS.primary} />
              <Text style={styles.detailLabel}>{d.label}</Text>
              <Text style={styles.detailValue}>{d.value}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: SPACING.xl, paddingHorizontal: SPACING.md },
  backBtn: { marginBottom: SPACING.md },
  headerContent: { marginBottom: SPACING.sm },
  headerType: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.5, marginBottom: SPACING.xs },
  headerName: { fontSize: 26, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: 6 },
  headerLocation: { fontSize: 14, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.85)' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  ratingText: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: COLORS.white, marginLeft: 6 },
  priceTag: { flexDirection: 'row', alignItems: 'baseline', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BORDER_RADIUS.md, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14 },
  priceAmount: { fontSize: 24, fontFamily: FONTS.heading, color: COLORS.white },
  priceLabel: { fontSize: 14, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.8)' },
  actMeta: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.white },
  categoryBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BORDER_RADIUS.full, alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, marginBottom: SPACING.xs },
  categoryText: { fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLORS.white, letterSpacing: 1.5 },
  body: { flex: 1 },
  section: { padding: SPACING.md, marginBottom: SPACING.xs },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: SPACING.sm },
  description: { fontSize: 15, fontFamily: FONTS.body, color: COLORS.textSecondary, lineHeight: 23 },
  amenityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.sm, paddingVertical: 6, paddingHorizontal: 12, ...SHADOW.small },
  amenityText: { fontSize: 13, fontFamily: FONTS.body, color: COLORS.text },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, ...SHADOW.small },
  locationText: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.text, flex: 1 },
  tipCard: { backgroundColor: '#FFFBEB', borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: '#FDE68A', marginHorizontal: SPACING.md },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.sm },
  tipTitle: { fontSize: 16, fontFamily: FONTS.headingSemiBold, color: COLORS.text },
  tipText: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.text, lineHeight: 21 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  detailLabel: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary, width: 80 },
  detailValue: { flex: 1, fontSize: 14, fontFamily: FONTS.body, color: COLORS.text },
  footer: { padding: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm },
  bookBtn: { borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  bookBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  bookBtnText: { fontFamily: FONTS.heading, fontSize: 16, color: COLORS.white },
  backFooterBtn: { paddingVertical: 13, alignItems: 'center', borderRadius: BORDER_RADIUS.full, borderWidth: 1.5, borderColor: COLORS.grayMedium },
  backFooterText: { fontFamily: FONTS.bodyMedium, fontSize: 15, color: COLORS.gray },
});
