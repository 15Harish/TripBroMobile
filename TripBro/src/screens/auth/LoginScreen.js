import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#0077BE', '#005A8E']} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.appName}>✈️ TripBro</Text>
            <Text style={styles.headerTitle}>Welcome Back!</Text>
            <Text style={styles.headerSubtitle}>Sign in to continue your adventures</Text>
          </View>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color={COLORS.gray} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.checkRow} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
              </View>
              <Text style={styles.checkLabel}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.loginGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            {[
              { icon: 'logo-google', label: 'Google', color: '#EA4335' },
              { icon: 'logo-facebook', label: 'Facebook', color: '#1877F2' },
            ].map((s) => (
              <TouchableOpacity key={s.label} style={styles.socialBtn}>
                <Ionicons name={s.icon} size={20} color={s.color} />
                <Text style={styles.socialBtnText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
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
  inputIcon: { marginLeft: SPACING.md },
  input: { flex: 1, paddingVertical: 14, paddingHorizontal: SPACING.sm, fontFamily: FONTS.body, fontSize: 15, color: COLORS.text },
  eyeBtn: { padding: SPACING.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: COLORS.grayMedium, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkLabel: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary },
  forgotText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.primary },
  loginBtn: { borderRadius: BORDER_RADIUS.full, overflow: 'hidden', marginBottom: SPACING.lg },
  loginGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  loginBtnText: { color: COLORS.white, fontFamily: FONTS.heading, fontSize: 17 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: SPACING.sm, fontFamily: FONTS.body, fontSize: 13, color: COLORS.textLight },
  socialRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  socialBtnText: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.text },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.sm },
  signupText: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.textSecondary },
  signupLink: { fontFamily: FONTS.bodySemiBold, fontSize: 14, color: COLORS.primary },
});
