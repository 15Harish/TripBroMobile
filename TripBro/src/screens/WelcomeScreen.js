import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions, ImageBackground, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../constants/theme';
import { POPULAR_DESTINATIONS } from '../../constants/config';

const { width, height } = Dimensions.get('window');

const FeatureCard = ({ icon, title, description }) => (
  <View style={styles.featureCard}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDesc}>{description}</Text>
  </View>
);

const TestimonialCard = ({ name, text, rating }) => (
  <View style={styles.testimonialCard}>
    <View style={styles.stars}>
      {[...Array(rating)].map((_, i) => (
        <Ionicons key={i} name="star" size={14} color={COLORS.warning} />
      ))}
    </View>
    <Text style={styles.testimonialText}>"{text}"</Text>
    <Text style={styles.testimonialName}>— {name}</Text>
  </View>
);

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#0077BE', '#005A8E', '#003D5C']}
          style={styles.hero}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>✈️</Text>
              <Text style={styles.logoText}>TripBro</Text>
            </View>
            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.registerBtnText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Content */}
          <Animated.View
            style={[styles.heroContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <Text style={styles.heroTagline}>Your AI Travel Companion</Text>
            <Text style={styles.heroTitle}>Plan Your{'\n'}Dream Trip{'\n'}in Minutes</Text>
            <Text style={styles.heroSubtitle}>
              AI-powered itineraries tailored to your budget, style, and preferences
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentDark]}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaText}>Start Planning Free</Text>
                <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Floating stat chips */}
          <View style={styles.statsRow}>
            {[
              { label: '50K+', sub: 'Trips Planned' },
              { label: '150+', sub: 'Destinations' },
              { label: '4.9★', sub: 'User Rating' },
            ].map((stat, i) => (
              <View key={i} style={styles.statChip}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statSub}>{stat.sub}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Popular Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destScroll}>
            {POPULAR_DESTINATIONS.map((dest, i) => (
              <TouchableOpacity
                key={i}
                style={styles.destCard}
                onPress={() => navigation.navigate('Register')}
              >
                <ImageBackground
                  source={{ uri: dest.image }}
                  style={styles.destImage}
                  imageStyle={{ borderRadius: BORDER_RADIUS.lg }}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.destOverlay}
                  >
                    <Text style={styles.destName}>{dest.name}</Text>
                    <Text style={styles.destCountry}>{dest.country}</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Features */}
        <View style={[styles.section, { backgroundColor: COLORS.grayLight }]}>
          <Text style={styles.sectionTitle}>Why Choose TripBro?</Text>
          <View style={styles.featuresGrid}>
            {[
              { icon: '🤖', title: 'AI-Powered', description: 'Smart itineraries generated by Gemini AI' },
              { icon: '💰', title: 'Budget Aware', description: 'Stays within your budget always' },
              { icon: '🗺️', title: 'Day-by-Day Plans', description: 'Detailed daily schedules & routes' },
              { icon: '📴', title: 'Works Offline', description: 'Access plans without internet' },
              { icon: '🌤️', title: 'Weather Ready', description: 'Live weather integrated in plans' },
              { icon: '💱', title: 'Currency Tool', description: 'Real-time exchange rates' },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Travelers Say</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.destScroll}>
            {[
              { name: 'Sarah M.', text: 'TripBro planned my Paris trip perfectly within my budget. Absolutely loved it!', rating: 5 },
              { name: 'James K.', text: 'The AI itinerary for Tokyo was spot-on. Saved me hours of research!', rating: 5 },
              { name: 'Priya R.', text: 'Best travel app I\'ve ever used. The budget breakdown feature is amazing.', rating: 5 },
            ].map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </ScrollView>
        </View>

        {/* Final CTA */}
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.finalCta}>
          <Text style={styles.finalCtaTitle}>Ready to Explore?</Text>
          <Text style={styles.finalCtaSubtitle}>Join 50,000+ travelers using TripBro</Text>
          <TouchableOpacity
            style={styles.finalCtaBtn}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.finalCtaBtnText}>Get Started Free</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  hero: { paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 50,
    paddingBottom: SPACING.md,
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 28 },
  logoText: { fontSize: 24, fontFamily: FONTS.heading, color: COLORS.white, letterSpacing: -0.5 },
  authButtons: { flexDirection: 'row', gap: SPACING.sm },
  loginBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  loginBtnText: { color: COLORS.white, fontFamily: FONTS.bodyMedium, fontSize: 14 },
  registerBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.accent },
  registerBtnText: { color: COLORS.white, fontFamily: FONTS.bodySemiBold, fontSize: 14 },
  heroContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xl },
  heroTagline: { color: COLORS.secondary, fontFamily: FONTS.bodyMedium, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: SPACING.sm },
  heroTitle: { color: COLORS.white, fontFamily: FONTS.heading, fontSize: 42, lineHeight: 50, marginBottom: SPACING.md },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.body, fontSize: 16, lineHeight: 24, marginBottom: SPACING.xl },
  ctaButton: { alignSelf: 'flex-start', borderRadius: BORDER_RADIUS.full, ...SHADOW.large },
  ctaGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 28, borderRadius: BORDER_RADIUS.full },
  ctaText: { color: COLORS.white, fontFamily: FONTS.heading, fontSize: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: SPACING.md, marginTop: SPACING.lg },
  statChip: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BORDER_RADIUS.md, padding: SPACING.md, alignItems: 'center', flex: 1, marginHorizontal: 4 },
  statLabel: { color: COLORS.white, fontFamily: FONTS.heading, fontSize: 20 },
  statSub: { color: 'rgba(255,255,255,0.7)', fontFamily: FONTS.body, fontSize: 11, marginTop: 2 },
  section: { padding: SPACING.lg },
  sectionTitle: { fontFamily: FONTS.heading, fontSize: 22, color: COLORS.text, marginBottom: SPACING.md },
  destScroll: { marginHorizontal: -SPACING.lg, paddingHorizontal: SPACING.lg },
  destCard: { marginRight: SPACING.md },
  destImage: { width: 160, height: 200, justifyContent: 'flex-end' },
  destOverlay: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.sm },
  destName: { color: COLORS.white, fontFamily: FONTS.headingSemiBold, fontSize: 16 },
  destCountry: { color: 'rgba(255,255,255,0.8)', fontFamily: FONTS.body, fontSize: 12 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  featureCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, width: (width - SPACING.lg * 2 - SPACING.sm) / 2, ...SHADOW.small },
  featureIcon: { fontSize: 28, marginBottom: SPACING.xs },
  featureTitle: { fontFamily: FONTS.headingSemiBold, fontSize: 14, color: COLORS.text, marginBottom: 4 },
  featureDesc: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  testimonialCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, width: 260, marginRight: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.small },
  stars: { flexDirection: 'row', gap: 2, marginBottom: SPACING.sm },
  testimonialText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },
  testimonialName: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.text },
  finalCta: { padding: SPACING.xxl, alignItems: 'center' },
  finalCtaTitle: { fontFamily: FONTS.heading, fontSize: 28, color: COLORS.white, marginBottom: SPACING.sm },
  finalCtaSubtitle: { fontFamily: FONTS.body, fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.xl },
  finalCtaBtn: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.full, paddingVertical: 16, paddingHorizontal: 40 },
  finalCtaBtnText: { color: COLORS.primary, fontFamily: FONTS.heading, fontSize: 16 },
});
