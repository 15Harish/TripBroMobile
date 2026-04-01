import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, Dimensions, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { generateItinerary } from '../../services/gemini';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../constants/theme';
import {
  TRAVEL_STYLES, DIETARY_OPTIONS, ACCOMMODATION_TYPES,
} from '../../constants/config';

const { width } = Dimensions.get('window');
const STEPS = ['Destination', 'Dates & Budget', 'Preferences', 'Extras'];

const StepIndicator = ({ currentStep }) => (
  <View style={si.container}>
    {STEPS.map((step, i) => (
      <React.Fragment key={i}>
        <View style={si.stepItem}>
          <View style={[si.circle, i <= currentStep && si.circleActive]}>
            {i < currentStep
              ? <Ionicons name="checkmark" size={14} color={COLORS.white} />
              : <Text style={[si.circleText, i === currentStep && si.circleTextActive]}>{i + 1}</Text>}
          </View>
          <Text style={[si.label, i === currentStep && si.labelActive]}>{step}</Text>
        </View>
        {i < STEPS.length - 1 && (
          <View style={[si.line, i < currentStep && si.lineActive]} />
        )}
      </React.Fragment>
    ))}
  </View>
);

const si = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
  stepItem: { alignItems: 'center', gap: 4 },
  circle: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.grayLight, borderWidth: 2, borderColor: COLORS.grayMedium, alignItems: 'center', justifyContent: 'center' },
  circleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  circleText: { fontSize: 12, fontFamily: FONTS.bodyMedium, color: COLORS.gray },
  circleTextActive: { color: COLORS.white },
  label: { fontSize: 10, fontFamily: FONTS.body, color: COLORS.gray },
  labelActive: { color: COLORS.primary, fontFamily: FONTS.bodyMedium },
  line: { flex: 1, height: 2, backgroundColor: COLORS.grayMedium, marginBottom: 16, marginHorizontal: 2 },
  lineActive: { backgroundColor: COLORS.primary },
});

const ChipSelector = ({ options, selected, onSelect, multi = true }) => (
  <View style={styles.chipRow}>
    {options.map(opt => {
      const isSelected = multi ? selected.includes(opt.id) : selected === opt.id;
      return (
        <TouchableOpacity
          key={opt.id}
          style={[styles.chip, isSelected && styles.chipSelected]}
          onPress={() => {
            if (multi) {
              onSelect(isSelected ? selected.filter(s => s !== opt.id) : [...selected, opt.id]);
            } else {
              onSelect(opt.id);
            }
          }}
        >
          {opt.icon && <Text style={styles.chipIcon}>{opt.icon}</Text>}
          <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{opt.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export default function CreateTripScreen({ navigation, route }) {
  const { user } = useAuth();
  const { saveTrip } = useTrip();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);

  const [destination, setDestination] = useState(route.params?.prefillDestination || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [groupSize, setGroupSize] = useState(1);
  const [travelStyle, setTravelStyle] = useState([]);
  const [accommodation, setAccommodation] = useState('hotel');
  const [dietary, setDietary] = useState([]);
  const [interests, setInterests] = useState('');
  const [accessibility, setAccessibility] = useState('');

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingStartDate, setSelectingStartDate] = useState(true);

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD'];

  const validateStep = () => {
    if (step === 0 && !destination.trim()) { Alert.alert('Required', 'Please enter a destination'); return false; }
    if (step === 1) {
      if (!startDate || !endDate) { Alert.alert('Required', 'Please enter travel dates'); return false; }
      if (!budget || isNaN(budget)) { Alert.alert('Required', 'Please enter a valid budget'); return false; }
      if (new Date(startDate) >= new Date(endDate)) { Alert.alert('Invalid', 'End date must be after start date'); return false; }
    }
    if (step === 2 && travelStyle.length === 0) { Alert.alert('Required', 'Please select at least one travel style'); return false; }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => s + 1); };
  const handleBack = () => setStep(s => s - 1);

  const handleGenerate = async () => {
    if (!interests.trim()) { setInterests('General sightseeing and local culture'); }
    setGenerating(true);
    try {
      const tripData = { destination, startDate, endDate, budget: parseFloat(budget), currency, groupSize, travelStyle, accommodationType: accommodation, dietaryRestrictions: dietary, interests, accessibility };
      const itinerary = await generateItinerary(tripData);
      const { data, error } = await saveTrip({ ...tripData, itinerary }, user.id);
      if (error) throw new Error(error.message);
      navigation.navigate('Itinerary', { tripId: data.id, trip: data });
    } catch (err) {
      Alert.alert('Generation Failed', err.message || 'Please check your Gemini API key and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const onDayPress = (day) => {
    if (selectingStartDate) {
      setStartDate(day.dateString);
      setSelectingStartDate(false);
    } else {
      if (new Date(day.dateString) < new Date(startDate)) {
        setStartDate(day.dateString);
      } else {
        setEndDate(day.dateString);
        setShowCalendar(false);
        setSelectingStartDate(true);
      }
    }
  };

  const renderStep0 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Where do you want to go? 🌍</Text>
      <Text style={styles.stepSubtitle}>Enter your dream destination</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="location-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="e.g. Tokyo, Japan"
          placeholderTextColor={COLORS.textLight}
          value={destination}
          onChangeText={setDestination}
          autoFocus
        />
      </View>
      <Text style={styles.subLabel}>Popular choices:</Text>
      <View style={styles.chipRow}>
        {['Paris', 'Tokyo', 'Bali', 'New York', 'Dubai', 'London'].map(d => (
          <TouchableOpacity key={d} style={[styles.chip, destination === d && styles.chipSelected]} onPress={() => setDestination(d)}>
            <Text style={[styles.chipText, destination === d && styles.chipTextSelected]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>When & How much? 📅</Text>
      <Text style={styles.stepSubtitle}>Set your travel dates and budget</Text>

      <Text style={styles.fieldLabel}>Travel Dates</Text>
      <TouchableOpacity
        style={styles.inputWrapper}
        onPress={() => {
          setSelectingStartDate(true);
          setShowCalendar(true);
        }}
      >
        <Ionicons name="calendar-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
        <View style={styles.dateDisplay}>
          <Text style={[styles.dateText, !startDate && { color: COLORS.textLight }]}>
            {startDate || 'Start Date'}
          </Text>
          <Text style={styles.dateSeparator}>—</Text>
          <Text style={[styles.dateText, !endDate && { color: COLORS.textLight }]}>
            {endDate || 'End Date'}
          </Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>Budget</Text>
      <View style={styles.budgetRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
          {currencies.map(c => (
            <TouchableOpacity key={c} style={[styles.currencyChip, currency === c && styles.currencyChipSelected]} onPress={() => setCurrency(c)}>
              <Text style={[styles.currencyText, currency === c && styles.currencyTextSelected]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.inputWrapper}>
        <Ionicons name="wallet-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
        <TextInput style={styles.input} placeholder="Total budget amount" placeholderTextColor={COLORS.textLight} value={budget} onChangeText={setBudget} keyboardType="numeric" />
      </View>

      <Text style={styles.fieldLabel}>Group Size</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity style={styles.counterBtn} onPress={() => setGroupSize(Math.max(1, groupSize - 1))}>
          <Ionicons name="remove" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.counterValue}>{groupSize} {groupSize === 1 ? 'Person' : 'People'}</Text>
        <TouchableOpacity style={styles.counterBtn} onPress={() => setGroupSize(Math.min(20, groupSize + 1))}>
          <Ionicons name="add" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Modal visible={showCalendar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                {selectingStartDate ? 'Select Start Date' : 'Select End Date'}
              </Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={onDayPress}
              markedDates={{
                [startDate]: { selected: true, startingDay: true, color: COLORS.primary },
                [endDate]: { selected: true, endingDay: true, color: COLORS.primary },
              }}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                selectedDayBackgroundColor: COLORS.primary,
                todayTextColor: COLORS.primary,
                arrowColor: COLORS.primary,
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your Travel Style 🎒</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>
      <ChipSelector options={TRAVEL_STYLES} selected={travelStyle} onSelect={setTravelStyle} />

      <Text style={styles.fieldLabel}>Accommodation Type</Text>
      <ChipSelector options={ACCOMMODATION_TYPES} selected={accommodation} onSelect={setAccommodation} multi={false} />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Final Details ✨</Text>
      <Text style={styles.stepSubtitle}>Help us personalize your trip</Text>

      <Text style={styles.fieldLabel}>Dietary Restrictions</Text>
      <ChipSelector options={DIETARY_OPTIONS} selected={dietary} onSelect={setDietary} />

      <Text style={styles.fieldLabel}>Special Interests</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="e.g. street food, temples, nightlife, museums..."
        placeholderTextColor={COLORS.textLight}
        value={interests}
        onChangeText={setInterests}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.fieldLabel}>Accessibility Needs (optional)</Text>
      <TextInput
        style={styles.inputSingle}
        placeholder="e.g. wheelchair accessible, limited walking..."
        placeholderTextColor={COLORS.textLight}
        value={accessibility}
        onChangeText={setAccessibility}
      />
    </View>
  );

  if (generating) {
    return (
      <View style={styles.generatingScreen}>
        <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.generatingGradient}>
          <Text style={styles.genIcon}>🤖</Text>
          <Text style={styles.genTitle}>Creating Your Itinerary</Text>
          <Text style={styles.genSubtitle}>Our AI is crafting the perfect trip for you...</Text>
          <ActivityIndicator size="large" color={COLORS.white} style={{ marginTop: SPACING.lg }} />
          <View style={styles.genTips}>
            {['Researching top attractions...', 'Finding best restaurants...', 'Optimizing your budget...', 'Building day-by-day plan...'].map((tip, i) => (
              <View key={i} style={styles.genTip}>
                <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.genTipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={26} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan New Trip</Text>
          <Text style={styles.stepCount}>{step + 1}/{STEPS.length}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <StepIndicator currentStep={step} />
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        {step < STEPS.length - 1 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.nextBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleGenerate}>
            <LinearGradient colors={[COLORS.accent, COLORS.accentDark]} style={styles.nextBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.nextBtnText}>Generate My Trip ✨</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: SPACING.md, paddingHorizontal: SPACING.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.white },
  stepCount: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: 'rgba(255,255,255,0.8)' },
  body: { flex: 1, paddingTop: SPACING.lg },
  stepContent: { paddingHorizontal: SPACING.md },
  stepTitle: { fontSize: 24, fontFamily: FONTS.heading, color: COLORS.text, marginBottom: 8 },
  stepSubtitle: { fontSize: 14, fontFamily: FONTS.body, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  subLabel: { fontSize: 13, fontFamily: FONTS.bodyMedium, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  fieldLabel: { fontSize: 14, fontFamily: FONTS.bodyMedium, color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.md },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm, ...SHADOW.small },
  inputIcon: { marginLeft: SPACING.md },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: SPACING.sm, fontFamily: FONTS.body, fontSize: 15, color: COLORS.text },
  textArea: { height: 90, textAlignVertical: 'top', paddingTop: 14, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: SPACING.md },
  inputSingle: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14, paddingHorizontal: SPACING.md, fontFamily: FONTS.body, fontSize: 15, color: COLORS.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 14, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border },
  chipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipIcon: { fontSize: 14 },
  chipText: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.text },
  chipTextSelected: { color: COLORS.white },
  budgetRow: { marginBottom: SPACING.sm },
  currencyScroll: { marginBottom: SPACING.sm },
  currencyChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8 },
  currencyChipSelected: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primaryLight },
  currencyText: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.text },
  currencyTextSelected: { color: COLORS.white },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xl, backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center' },
  counterBtn: { backgroundColor: COLORS.grayLight, borderRadius: BORDER_RADIUS.full, padding: SPACING.sm },
  counterValue: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.text, minWidth: 100, textAlign: 'center' },
  footer: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.full, borderWidth: 1.5, borderColor: COLORS.primary },
  backBtnText: { fontFamily: FONTS.bodyMedium, fontSize: 15, color: COLORS.primary },
  nextBtn: { flex: 1, borderRadius: BORDER_RADIUS.full, overflow: 'hidden' },
  nextBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  nextBtnText: { fontFamily: FONTS.heading, fontSize: 16, color: COLORS.white },
  generatingScreen: { flex: 1 },
  generatingGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  genIcon: { fontSize: 70, marginBottom: SPACING.lg },
  genTitle: { fontSize: 28, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: SPACING.sm },
  genSubtitle: { fontSize: 15, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: SPACING.xl },
  genTips: { marginTop: SPACING.xxl, gap: SPACING.sm, alignSelf: 'stretch' },
  genTip: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  genTipText: { fontSize: 14, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.8)' },
  dateDisplay: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: SPACING.sm },
  dateText: { fontSize: 15, fontFamily: FONTS.body, color: COLORS.text },
  dateSeparator: { marginHorizontal: 10, color: COLORS.gray },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  calendarContainer: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, paddingBottom: 40 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  calendarTitle: { fontSize: 18, fontFamily: FONTS.heading, color: COLORS.text },
});
