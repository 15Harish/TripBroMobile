import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTrip } from '../../context/TripContext';
import { generateAlternativeActivities } from '../../services/gemini';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../constants/theme';

export default function CustomizeScreen({ navigation, route }) {
  const { tripId, trip } = route.params || {};
  const { updateTrip } = useTrip();
  const [saving, setSaving] = useState(false);
  const [loadingAlts, setLoadingAlts] = useState(null);

  const itinerary = trip?.itinerary_data || trip?.itinerary;
  const [days, setDays] = useState(itinerary?.days || []);
  const [showAddActivity, setShowAddActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({ name: '', time: '', duration: '', cost: '', location: '', description: '' });

  const handleRemoveActivity = (dayIndex, actIndex) => {
    Alert.alert('Remove Activity', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          const updated = [...days];
          updated[dayIndex] = { ...updated[dayIndex], activities: updated[dayIndex].activities.filter((_, i) => i !== actIndex) };
          setDays(updated);
        },
      },
    ]);
  };

  const handleGetAlternatives = async (dayIndex, actIndex) => {
    const activity = days[dayIndex].activities[actIndex];
    setLoadingAlts(`${dayIndex}-${actIndex}`);
    const alts = await generateAlternativeActivities(trip?.destination, activity.name, itinerary?.budget?.breakdown?.activities || 200);
    setLoadingAlts(null);
    if (alts.length === 0) { Alert.alert('No alternatives found'); return; }
    Alert.alert(
      'Choose Alternative',
      'Pick a replacement activity:',
      [
        ...alts.map(alt => ({
          text: `${alt.name} ($${alt.cost})`,
          onPress: () => {
            const updated = [...days];
            updated[dayIndex].activities[actIndex] = { ...alt, category: activity.category };
            setDays(updated);
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAddActivity = (dayIndex) => {
    if (!newActivity.name) { Alert.alert('Error', 'Activity name is required'); return; }
    const updated = [...days];
    updated[dayIndex].activities.push({ ...newActivity, cost: parseFloat(newActivity.cost) || 0, id: Date.now().toString(), category: 'activity' });
    setDays(updated);
    setNewActivity({ name: '', time: '', duration: '', cost: '', location: '', description: '' });
    setShowAddActivity(null);
  };

  const moveActivity = (dayIndex, actIndex, direction) => {
    const updated = [...days];
    const acts = [...updated[dayIndex].activities];
    const newIndex = actIndex + direction;
    if (newIndex < 0 || newIndex >= acts.length) return;
    [acts[actIndex], acts[newIndex]] = [acts[newIndex], acts[actIndex]];
    updated[dayIndex] = { ...updated[dayIndex], activities: acts };
    setDays(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    const updatedItinerary = { ...itinerary, days };
    const { error } = await updateTrip(tripId, { itinerary_data: updatedItinerary });
    setSaving(false);
    if (error) { Alert.alert('Error', 'Failed to save changes'); return; }
    Alert.alert('Saved!', 'Your itinerary has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset', 'Restore original itinerary?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => setDays(itinerary?.days || []) },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customize Trip</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>Drag, swap, add or remove activities</Text>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {days.map((day, dayIndex) => (
          <View key={dayIndex} style={styles.dayBlock}>
            <View style={styles.dayLabel}>
              <Text style={styles.dayTitle}>Day {day.day} — {day.theme}</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddActivity(dayIndex)}>
                <Ionicons name="add" size={18} color={COLORS.primary} />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {day.activities?.map((act, actIndex) => (
              <View key={actIndex} style={styles.actCard}>
                <View style={styles.actMain}>
                  <View style={styles.actInfo}>
                    <Text style={styles.actTime}>{act.time}</Text>
                    <Text style={styles.actName}>{act.name}</Text>
                    <Text style={styles.actLocation} numberOfLines={1}>📍 {act.location}</Text>
                    <Text style={styles.actCost}>${act.cost}</Text>
                  </View>
                  <View style={styles.actActions}>
                    <TouchableOpacity style={styles.actBtn} onPress={() => moveActivity(dayIndex, actIndex, -1)}>
                      <Ionicons name="chevron-up" size={18} color={COLORS.gray} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actBtn} onPress={() => moveActivity(dayIndex, actIndex, 1)}>
                      <Ionicons name="chevron-down" size={18} color={COLORS.gray} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actBtn, styles.altBtn]}
                      onPress={() => handleGetAlternatives(dayIndex, actIndex)}
                      disabled={loadingAlts === `${dayIndex}-${actIndex}`}
                    >
                      {loadingAlts === `${dayIndex}-${actIndex}`
                        ? <ActivityIndicator size="small" color={COLORS.primary} />
                        : <Ionicons name="swap-horizontal" size={18} color={COLORS.primary} />}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actBtn, styles.removeBtn]} onPress={() => handleRemoveActivity(dayIndex, actIndex)}>
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Add activity form */}
            {showAddActivity === dayIndex && (
              <View style={styles.addForm}>
                <Text style={styles.addFormTitle}>New Activity</Text>
                {[
                  { key: 'name', placeholder: 'Activity name *', required: true },
                  { key: 'time', placeholder: 'Time (e.g. 9:00 AM)' },
                  { key: 'location', placeholder: 'Location' },
                  { key: 'duration', placeholder: 'Duration (e.g. 2 hours)' },
                  { key: 'cost', placeholder: 'Cost ($)', keyboard: 'numeric' },
                  { key: 'description', placeholder: 'Description', multiline: true },
                ].map(field => (
                  <TextInput
                    key={field.key}
                    style={[styles.formInput, field.multiline && styles.formTextArea]}
                    placeholder={field.placeholder}
                    placeholderTextColor={COLORS.textLight}
                    value={newActivity[field.key]}
                    onChangeText={v => setNewActivity(p => ({ ...p, [field.key]: v }))}
                    keyboardType={field.keyboard || 'default'}
                    multiline={field.multiline}
                    numberOfLines={field.multiline ? 2 : 1}
                  />
                ))}
                <View style={styles.formBtns}>
                  <TouchableOpacity style={styles.cancelFormBtn} onPress={() => setShowAddActivity(null)}>
                    <Text style={styles.cancelFormText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addFormBtn} onPress={() => handleAddActivity(dayIndex)}>
                    <Text style={styles.addFormBtnText}>Add Activity</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <LinearGradient colors={[COLORS.success, '#059669']} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {saving ? <ActivityIndicator color={COLORS.white} /> : (
              <>
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: SPACING.md, paddingHorizontal: SPACING.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerTitle: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.white },
  resetText: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: 'rgba(255,255,255,0.8)' },
  headerSub: { fontSize: 13, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.7)' },
  body: { flex: 1, padding: SPACING.md },
  dayBlock: { marginBottom: SPACING.lg },
  dayLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  dayTitle: { fontSize: 16, fontFamily: FONTS.heading, color: COLORS.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.full, borderWidth: 1.5, borderColor: COLORS.primary },
  addBtnText: { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLORS.primary },
  actCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.xs, padding: SPACING.sm, ...SHADOW.small },
  actMain: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.sm },
  actInfo: { flex: 1 },
  actTime: { fontSize: 11, fontFamily: FONTS.bodyMedium, color: COLORS.textLight, marginBottom: 2 },
  actName: { fontSize: 14, fontFamily: FONTS.bodySemiBold, color: COLORS.text, marginBottom: 2 },
  actLocation: { fontSize: 12, fontFamily: FONTS.body, color: COLORS.textSecondary, marginBottom: 2 },
  actCost: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: COLORS.primary },
  actActions: { flexDirection: 'column', gap: 4, alignItems: 'center' },
  actBtn: { padding: 6, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.grayLight },
  altBtn: { backgroundColor: COLORS.primary + '15' },
  removeBtn: { backgroundColor: COLORS.error + '15' },
  addForm: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginTop: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.primary + '40', ...SHADOW.small },
  addFormTitle: { fontSize: 15, fontFamily: FONTS.headingSemiBold, color: COLORS.text, marginBottom: SPACING.sm },
  formInput: { backgroundColor: COLORS.grayLight, borderRadius: BORDER_RADIUS.md, padding: 12, fontFamily: FONTS.body, fontSize: 14, color: COLORS.text, marginBottom: SPACING.xs, borderWidth: 1, borderColor: COLORS.border },
  formTextArea: { height: 60, textAlignVertical: 'top' },
  formBtns: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  cancelFormBtn: { flex: 1, paddingVertical: 12, borderRadius: BORDER_RADIUS.full, borderWidth: 1.5, borderColor: COLORS.grayMedium, alignItems: 'center' },
  cancelFormText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.gray },
  addFormBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.full, paddingVertical: 12, alignItems: 'center' },
  addFormBtnText: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.white },
  footer: { padding: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  saveBtn: { borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  saveBtnText: { fontFamily: FONTS.heading, fontSize: 16, color: COLORS.white },
});
