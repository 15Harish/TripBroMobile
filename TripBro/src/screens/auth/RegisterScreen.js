import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../constants/theme';

const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: COLORS.grayMedium };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { strength: 1, label: 'Weak', color: COLORS.error },
    { strength: 2, label: 'Fair', color: COLORS.warning },
    { strength: 3, label: 'Good', color: COLORS.primaryLight },
    { strength: 4, label: 'Strong', color: COLORS.success },
  ];
  return levels[score - 1] || { strength: 0, label: '', color: COLORS.grayMedium };
};

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const passwordInfo = getPasswordStrength(password);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to Terms & Conditions');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      Alert.alert('Success', 'Account created! Please check your email to verify your account.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.appName}>✈️ TripBro</Text>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Start your travel journey today</Text>
          </View>
        </LinearGradient>

        <View style={styles.formCard}>
          {[
            { label: 'Full Name', value: fullName, setter: setFullName, icon: 'person-outline', placeholder: 'John Doe', type: 'default' },
            { label: 'Email', value: email, setter: setEmail, icon: 'mail-outline', placeholder: 'your@email.com', type: 'email-address' },
          ].map(({ label, value, setter, icon, placeholder, type }) => (
            <View key={label} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name={icon} size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.textLight}
                  value={value}
                  onChangeText={setter}
                  autoCapitalize={type === 'email-address' ? 'none' : 'words'}
                  keyboardType={type}
                />
              </View>
            </View>
          ))}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map(i => (
                    <View
                      key={i}
                      style={[styles.strengthBar, { backgroundColor: i <= passwordInfo.strength ? passwordInfo.color : COLORS.grayMedium }]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: passwordInfo.color }]}>{passwordInfo.label}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputWrapper, confirmPassword && password !== confirmPassword && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.textLight}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
            {confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>

          <TouchableOpacity style={styles.termsRow} onPress={() => setAgreedToTerms(!agreedToTerms)}>
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
              {agreedToTerms && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.8} disabled={loading}>
            <LinearGradient
              colors={[COLORS.accent, COLORS.accentDark]}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.btnText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1 },
  header: { paddingTop: 50, paddingBottom: 40, paddingHorizontal: SPACING.md },
  backBtn: { alignSelf: 'flex-start', marginBottom: SPACING.lg },
  headerContent: { alignItems: 'center' },
  appName: { fontSize: 22, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: SPACING.md },
  headerTitle: { fontSize: 30, fontFamily: FONTS.heading, color: COLORS.white, marginBottom: 8 },
  headerSubtitle: { fontSize: 15, fontFamily: FONTS.body, color: 'rgba(255,255,255,0.75)' },
  formCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, margin: SPACING.md, padding: SPACING.lg, marginTop: -20, ...SHADOW.medium },
  inputGroup: { marginBottom: SPACING.md },
  label: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.text, marginBottom: SPACING.xs },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.grayLight, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  inputError: { borderColor: COLORS.error },
  inputIcon: { marginLeft: SPACING.md },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: SPACING.sm, fontFamily: FONTS.body, fontSize: 15, color: COLORS.text },
  eyeBtn: { padding: SPACING.md },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontFamily: FONTS.bodyMedium, fontSize: 12 },
  errorText: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.error, marginTop: 4 },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: SPACING.lg },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: COLORS.grayMedium, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  termsText: { flex: 1, fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  termsLink: { color: COLORS.primary, fontFamily: FONTS.bodyMedium },
  registerBtn: { borderRadius: BORDER_RADIUS.full, overflow: 'hidden', marginBottom: SPACING.lg },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  btnText: { color: COLORS.white, fontFamily: FONTS.heading, fontSize: 17 },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary },
  loginLink: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.primary },
});
