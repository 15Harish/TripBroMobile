import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../constants/theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleReset = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email'); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); return; }
    setSent(true);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSubtitle}>We'll send you a reset link</Text>
        </View>
      </LinearGradient>

      <View style={styles.card}>
        {sent ? (
          <View style={styles.sentContainer}>
            <Text style={styles.sentIcon}>📧</Text>
            <Text style={styles.sentTitle}>Email Sent!</Text>
            <Text style={styles.sentText}>
              We sent a password reset link to{'\n'}<Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <Text style={styles.sentSubtext}>Check your inbox and follow the instructions. Don't forget to check your spam folder.</Text>
            <TouchableOpacity style={styles.backToLoginBtn} onPress={() => navigation.navigate('Login')}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.btnText}>Back to Login</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.instructions}>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8} disabled={loading}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.btnText}>Send Reset Link</Text>}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
              <Text style={styles.backLinkText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: 40, paddingHorizontal: SPACING.md },
  backBtn: { alignSelf: 'flex-start', marginBottom: SPACING.lg },
  headerContent: { alignItems: 'center' },
  icon: { fontSize: 40, marginBottom: SPACING.sm },
  headerTitle: { fontSize: 28, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: 8 },
  headerSubtitle: { fontSize: 15, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.75)' },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, margin: SPACING.md, padding: SPACING.lg, marginTop: -20, ...SHADOW.medium },
  instructions: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.lg },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.text, marginBottom: SPACING.xs },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.grayLight, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  inputIcon: { marginLeft: SPACING.md },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: SPACING.sm, fontFamily: FONTS.body, fontSize: 15, color: COLORS.text },
  resetBtn: { borderRadius: BORDER_RADIUS.full, overflow: 'hidden', marginBottom: SPACING.lg },
  btnGradient: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  btnText: { color: COLORS.white, fontFamily: FONTS.heading, fontSize: 17 },
  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  backLinkText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.primary },
  sentContainer: { alignItems: 'center', paddingVertical: SPACING.xl },
  sentIcon: { fontSize: 60, marginBottom: SPACING.md },
  sentTitle: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.text, marginBottom: SPACING.md },
  sentText: { fontFamily: FONTS.body, fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.sm },
  emailHighlight: { color: COLORS.primary, fontFamily: FONTS.bodyMedium },
  sentSubtext: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.textLight, textAlign: 'center', marginBottom: SPACING.xl },
  backToLoginBtn: { borderRadius: BORDER_RADIUS.full, overflow: 'hidden', alignSelf: 'stretch' },
});
