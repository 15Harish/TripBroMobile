import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Share, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTrip } from '../../context/TripContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../constants/theme';
import { BUDGET_CATEGORIES } from '../../constants/config';

const { width } = Dimensions.get('window');

const ActivityCard = ({ activity, onPress }) => {
  const catColors = { attraction: COLORS.primary, restaurant: COLORS.accent, transport: COLORS.success, activity: COLORS.warning };
  const color = catColors[activity.category] || COLORS.primary;
  return (
    <TouchableOpacity style={styles.activityCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.activityTimeline, { backgroundColor: color }]} />
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <View style={[styles.activityBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.activityBadgeText, { color }]}>{activity.category || 'activity'}</Text>
          </View>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
        <Text style={styles.activityName}>{activity.name}</Text>
        <Text style={styles.activityLocation}>📍 {activity.location}</Text>
        <Text style={styles.activityDesc} numberOfLines={2}>{activity.description}</Text>
        <View style={styles.activityFooter}>
          <Text style={styles.activityDuration}>⏱ {activity.duration}</Text>
          <Text style={styles.activityCost}>${activity.cost}</Text>
        </View>
        {activity.tips && (
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={14} color={COLORS.warning} />
            <Text style={styles.tipText}>{activity.tips}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const DaySection = ({ day, dayData, onActivityPress }) => {
  const [expanded, setExpanded] = useState(day === 1);
  return (
    <View style={styles.daySection}>
      <TouchableOpacity style={styles.dayHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
        <LinearGradient colors={expanded ? [COLORS.primary, COLORS.primaryDark] : [COLORS.grayLight, COLORS.grayLight]} style={styles.dayHeaderGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <View style={styles.dayHeaderLeft}>
            <View style={[styles.dayBadge, { backgroundColor: expanded ? 'rgba(255,255,255,0.2)' : COLORS.primary + '20' }]}>
              <Text style={[styles.dayBadgeText, { color: expanded ? COLORS.white : COLORS.primary }]}>Day {day}</Text>
            </View>
            <View>
              <Text style={[styles.dayDate, { color: expanded ? COLORS.white : COLORS.text }]}>{dayData.date}</Text>
              <Text style={[styles.dayTheme, { color: expanded ? 'rgba(255,255,255,0.85)' : COLORS.textSecondary }]}>{dayData.theme}</Text>
            </View>
          </View>
          <View style={styles.dayHeaderRight}>
            <Text style={[styles.dayCost, { color: expanded ? COLORS.white : COLORS.primary }]}>${dayData.totalDayCost}</Text>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={expanded ? COLORS.white : COLORS.gray} />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.dayBody}>
          {dayData.weather && (
            <View style={styles.weatherStrip}>
              <Ionicons name="partly-sunny-outline" size={16} color={COLORS.warning} />
              <Text style={styles.weatherText}>{dayData.weather}</Text>
            </View>
          )}
          {dayData.transportationForDay && (
            <View style={styles.transportStrip}>
              <Ionicons name="car-outline" size={16} color={COLORS.success} />
              <Text style={styles.transportText}>{dayData.transportationForDay}</Text>
            </View>
          )}
          {dayData.activities?.map((act, i) => (
            <ActivityCard key={i} activity={act} onPress={() => onActivityPress(act)} />
          ))}

          {/* Meals */}
          {dayData.meals && (
            <View style={styles.mealsCard}>
              <Text style={styles.mealsTitle}>🍽️ Meals</Text>
              {['breakfast', 'lunch', 'dinner'].map(meal => (
                dayData.meals[meal] && (
                  <View key={meal} style={styles.mealRow}>
                    <View style={styles.mealLeft}>
                      <Text style={styles.mealType}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                      <Text style={styles.mealName}>{dayData.meals[meal].name}</Text>
                      <Text style={styles.mealCuisine}>{dayData.meals[meal].cuisine} · {dayData.meals[meal].location}</Text>
                    </View>
                    <Text style={styles.mealCost}>${dayData.meals[meal].cost}</Text>
                  </View>
                )
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default function ItineraryScreen({ navigation, route }) {
  const { tripId, trip: routeTrip } = route.params || {};
  const { getTripById, currentTrip } = useTrip();
  const [loading, setLoading] = useState(!routeTrip);
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    if (tripId && !routeTrip) {
      getTripById(tripId).then(() => setLoading(false));
    }
  }, [tripId]);

  const tripData = routeTrip || currentTrip;
  const itinerary = tripData?.itinerary_data || tripData?.itinerary;

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out my ${tripData?.destination} trip plan made with TripBro! ✈️\n\nDuration: ${itinerary?.overview?.totalDays} days\nBudget: ${tripData?.currency} ${tripData?.budget}` });
    } catch (err) {}
  };

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading itinerary...</Text>
    </View>
  );

  if (!itinerary) return (
    <View style={styles.loading}>
      <Text style={styles.errorText}>Itinerary not found</Text>
      <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backLink}>Go Back</Text></TouchableOpacity>
    </View>
  );

  const { overview, budget, days, accommodation, transportation, emergencyInfo } = itinerary;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#0077BE', '#003D5C']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Customize', { tripId: tripData?.id, trip: tripData })}>
              <Ionicons name="create-outline" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.destination}>{tripData?.destination}</Text>
          <Text style={styles.tripDates}>
            {new Date(tripData?.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –
            {new Date(tripData?.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
          <View style={styles.chipRow}>
            {[
              { icon: 'calendar-outline', label: `${overview?.totalDays} days` },
              { icon: 'wallet-outline', label: `${tripData?.currency} ${tripData?.budget?.toLocaleString()}` },
              { icon: 'people-outline', label: `${tripData?.group_size} people` },
            ].map((c, i) => (
              <View key={i} style={styles.infoChip}>
                <Ionicons name={c.icon} size={12} color={COLORS.white} />
                <Text style={styles.infoChipText}>{c.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['itinerary', 'budget', 'info'].map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {activeTab === 'itinerary' && (
          <>
            {/* Highlights */}
            {overview?.highlights?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>✨ Trip Highlights</Text>
                {overview.highlights.map((h, i) => (
                  <View key={i} style={styles.highlightRow}>
                    <View style={styles.highlightDot} />
                    <Text style={styles.highlightText}>{h}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Accommodation */}
            {accommodation?.recommended && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏨 Accommodation</Text>
                <TouchableOpacity style={styles.accomCard} onPress={() => navigation.navigate('AccommodationDetail', { accommodation: accommodation.recommended })}>
                  <View style={styles.accomHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.accomName}>{accommodation.recommended.name}</Text>
                      <Text style={styles.accomType}>{accommodation.recommended.type} · {accommodation.recommended.location}</Text>
                      <View style={styles.stars}>
                        {[...Array(Math.round(accommodation.recommended.rating || 4))].map((_, i) => (
                          <Ionicons key={i} name="star" size={14} color={COLORS.warning} />
                        ))}
                        <Text style={styles.ratingText}>{accommodation.recommended.rating}</Text>
                      </View>
                    </View>
                    <View style={styles.accomPrice}>
                      <Text style={styles.priceAmount}>${accommodation.recommended.pricePerNight}</Text>
                      <Text style={styles.priceLabel}>/night</Text>
                    </View>
                  </View>
                  <Text style={styles.accomDesc} numberOfLines={2}>{accommodation.recommended.description}</Text>
                  <View style={styles.accomAmenities}>
                    {accommodation.recommended.amenities?.slice(0, 4).map((a, i) => (
                      <View key={i} style={styles.amenityTag}><Text style={styles.amenityText}>{a}</Text></View>
                    ))}
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Day-by-day */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 Day-by-Day Plan</Text>
              {days?.map((day, i) => (
                <DaySection
                  key={i}
                  day={day.day}
                  dayData={day}
                  onActivityPress={(act) => navigation.navigate('ActivityDetail', { activity: act })}
                />
              ))}
            </View>
          </>
        )}

        {activeTab === 'budget' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Budget Breakdown</Text>
            <View style={styles.budgetOverview}>
              <Text style={styles.budgetTotal}>{tripData?.currency} {budget?.total?.toLocaleString()}</Text>
              <Text style={styles.budgetLabel}>Total Estimated Cost</Text>
              <Text style={styles.budgetDaily}>≈ {tripData?.currency} {budget?.dailyAverage?.toFixed(0)} per day</Text>
            </View>
            {BUDGET_CATEGORIES.map(cat => {
              const amount = budget?.breakdown?.[cat.id] || 0;
              const pct = budget?.total ? (amount / budget.total * 100).toFixed(0) : 0;
              return (
                <View key={cat.id} style={styles.budgetRow}>
                  <View style={styles.budgetLeft}>
                    <Text style={styles.budgetIcon}>{cat.icon}</Text>
                    <View>
                      <Text style={styles.budgetCatName}>{cat.label}</Text>
                      <Text style={styles.budgetPct}>{pct}% of total</Text>
                    </View>
                  </View>
                  <View style={styles.budgetRight}>
                    <Text style={styles.budgetAmount}>${amount}</Text>
                    <View style={styles.budgetBar}>
                      <View style={[styles.budgetBarFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                    </View>
                  </View>
                </View>
              );
            })}
            {budget?.budgetTips?.length > 0 && (
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Money-Saving Tips</Text>
                {budget.budgetTips.map((tip, i) => (
                  <View key={i} style={styles.tipItem}>
                    <View style={styles.tipDot} />
                    <Text style={styles.tipItemText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'info' && (
          <View style={styles.section}>
            {overview?.localTips?.length > 0 && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>🗺️ Local Tips</Text>
                {overview.localTips.map((t, i) => (
                  <View key={i} style={styles.infoItem}><Text style={styles.infoItemText}>• {t}</Text></View>
                ))}
              </View>
            )}
            {itinerary?.visaInfo && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>🛂 Visa Info</Text>
                <Text style={styles.infoText}>{itinerary.visaInfo}</Text>
              </View>
            )}
            {itinerary?.currencyTips && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>💱 Currency Tips</Text>
                <Text style={styles.infoText}>{itinerary.currencyTips}</Text>
              </View>
            )}
            {emergencyInfo && (
              <View style={[styles.infoCard, styles.emergencyCard]}>
                <Text style={styles.emergencyTitle}>🚨 Emergency Contacts</Text>
                {Object.entries(emergencyInfo).map(([k, v]) => (
                  <View key={k} style={styles.emergencyRow}>
                    <Text style={styles.emergencyKey}>{k.replace(/([A-Z])/g, ' $1').trim()}</Text>
                    <Text style={styles.emergencyVal}>{v}</Text>
                  </View>
                ))}
              </View>
            )}
            {itinerary?.packingList?.length > 0 && (
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>🎒 Packing List</Text>
                <View style={styles.packingGrid}>
                  {itinerary.packingList.map((item, i) => (
                    <View key={i} style={styles.packingItem}><Text style={styles.packingText}>✓ {item}</Text></View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.textSecondary },
  errorText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.error },
  backLink: { fontFamily: FONTS.bodyMedium, color: COLORS.primary },
  header: { paddingTop: 50, paddingBottom: 0, paddingHorizontal: SPACING.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  headerBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BORDER_RADIUS.full, padding: 9 },
  headerInfo: { marginBottom: SPACING.md },
  destination: { fontSize: 28, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: 4 },
  tripDates: { fontSize: 14, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.sm },
  chipRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BORDER_RADIUS.full, paddingVertical: 5, paddingHorizontal: 10 },
  infoChipText: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.white },
  tabs: { flexDirection: 'row', marginTop: SPACING.sm },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.white },
  tabText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  tabTextActive: { color: COLORS.white, fontFamily: FONTS.bodySemiBold },
  body: { flex: 1 },
  section: { padding: SPACING.md },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: SPACING.md },
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  highlightDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 6 },
  highlightText: { flex: 1, fontSize: 14, fontFamily: FONTS.body, color: COLORS.textSecondary, lineHeight: 20 },
  accomCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOW.small },
  accomHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  accomName: { fontSize: 17, fontFamily: FONTS.headingSemiBold, color: COLORS.text, marginBottom: 4 },
  accomType: { fontSize: 13, fontFamily: FONTS.body, color: COLORS.textSecondary, marginBottom: 6 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary, marginLeft: 4 },
  accomPrice: { alignItems: 'flex-end' },
  priceAmount: { fontSize: 22, fontFamily: FONTS.heading, color: COLORS.primary },
  priceLabel: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary },
  accomDesc: { fontSize: 13, fontFamily: FONTS.body, color: COLORS.textSecondary, lineHeight: 19, marginBottom: SPACING.sm },
  accomAmenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  amenityTag: { backgroundColor: COLORS.grayLight, borderRadius: BORDER_RADIUS.sm, paddingVertical: 4, paddingHorizontal: 10 },
  amenityText: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary },
  daySection: { marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', ...SHADOW.small },
  dayHeader: { borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  dayHeaderGrad: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md },
  dayHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  dayBadge: { borderRadius: BORDER_RADIUS.sm, paddingVertical: 4, paddingHorizontal: 10 },
  dayBadgeText: { fontSize: 13, fontFamily: FONTS.bodyMedium },
  dayDate: { fontSize: 14, fontFamily: FONTS.bodyMedium },
  dayTheme: { fontSize: 12, fontFamily: FONTS.body },
  dayHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  dayCost: { fontSize: 15, fontFamily: FONTS.heading },
  dayBody: { backgroundColor: COLORS.white, padding: SPACING.sm },
  weatherStrip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF9EC', borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.xs },
  weatherText: { fontSize: 13, fontFamily: FONTS.body, color: COLORS.text },
  transportStrip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm },
  transportText: { fontSize: 13, fontFamily: FONTS.body, color: COLORS.text },
  activityCard: { flexDirection: 'row', backgroundColor: COLORS.grayLight, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm, overflow: 'hidden' },
  activityTimeline: { width: 4 },
  activityContent: { flex: 1, padding: SPACING.sm },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  activityBadge: { borderRadius: BORDER_RADIUS.full, paddingVertical: 2, paddingHorizontal: 8 },
  activityBadgeText: { fontSize: 11, fontFamily: FONTS.bodyMedium, textTransform: 'capitalize' },
  activityTime: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary },
  activityName: { fontSize: 15, fontFamily: FONTS.bodySemiBold, color: COLORS.text, marginBottom: 2 },
  activityLocation: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary, marginBottom: 4 },
  activityDesc: { fontSize: 13, fontFamily: FONTS.body, color: COLORS.textSecondary, lineHeight: 18, marginBottom: SPACING.xs },
  activityFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  activityDuration: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary },
  activityCost: { fontSize: 14, fontFamily: FONTS.bodySemiBold, color: COLORS.primary },
  tipBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#FFFBEB', borderRadius: BORDER_RADIUS.sm, padding: 8, marginTop: SPACING.xs },
  tipText: { flex: 1, fontSize: 12, fontFamily: FONTS.body, color: COLORS.text, lineHeight: 17 },
  mealsCard: { backgroundColor: COLORS.grayLight, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, marginTop: SPACING.sm },
  mealsTitle: { fontSize: 14, fontFamily: FONTS.bodySemiBold, color: COLORS.text, marginBottom: SPACING.sm },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: SPACING.xs, borderTopWidth: 1, borderTopColor: COLORS.border },
  mealLeft: { flex: 1 },
  mealType: { fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLORS.textLight, textTransform: 'uppercase', marginBottom: 2 },
  mealName: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: COLORS.text },
  mealCuisine: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary },
  mealCost: { fontSize: 14, fontFamily: FONTS.bodySemiBold, color: COLORS.accent },
  budgetOverview: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg },
  budgetTotal: { fontSize: 36, fontFamily: FONTS.heading, color: COLORS.white },
  budgetLabel: { fontSize: 14, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  budgetDaily: { fontSize: 13, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.7)', marginTop: SPACING.xs },
  budgetRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.small },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  budgetIcon: { fontSize: 22 },
  budgetCatName: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: COLORS.text },
  budgetPct: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary },
  budgetRight: { alignItems: 'flex-end', gap: 6, minWidth: 80 },
  budgetAmount: { fontSize: 16, fontFamily: FONTS.heading, color: COLORS.text },
  budgetBar: { width: 80, height: 6, backgroundColor: COLORS.grayLight, borderRadius: 3, overflow: 'hidden' },
  budgetBarFill: { height: '100%', borderRadius: 3 },
  tipsCard: { backgroundColor: '#FFF9EC', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginTop: SPACING.sm },
  tipsTitle: { fontSize: 15, fontFamily: FONTS.headingSemiBold, color: COLORS.text, marginBottom: SPACING.sm },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: 6 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.warning, marginTop: 7 },
  tipItemText: { flex: 1, fontSize: 13, fontFamily: FONTS.body, color: COLORS.text, lineHeight: 19 },
  infoCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.small },
  infoCardTitle: { fontSize: 16, fontFamily: FONTS.headingSemiBold, color: COLORS.text, marginBottom: SPACING.sm },
  infoItem: { marginBottom: 6 },
  infoItemText: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.textSecondary, lineHeight: 20 },
  infoText: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.textSecondary, lineHeight: 21 },
  emergencyCard: { borderWidth: 1, borderColor: COLORS.error + '30', backgroundColor: '#FFF5F5' },
  emergencyTitle: { fontSize: 16, fontFamily: FONTS.headingSemiBold, color: COLORS.error, marginBottom: SPACING.sm },
  emergencyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.grayLight },
  emergencyKey: { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLORS.text, textTransform: 'capitalize', flex: 1 },
  emergencyVal: { fontSize: 13, fontFamily: FONTS.body, color: COLORS.error },
  packingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  packingItem: { backgroundColor: COLORS.grayLight, borderRadius: BORDER_RADIUS.sm, paddingVertical: 4, paddingHorizontal: 10 },
  packingText: { fontSize: 13, fontFamily: FONTS.body, color: COLORS.text },
});
