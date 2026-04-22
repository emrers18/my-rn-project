import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Roundness, Spacing, Typography } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, isLoading } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre alanları boş bırakılamaz.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
    try {
      await signUp(email.trim().toLowerCase(), password, fullName.trim());
      Alert.alert(
        'Hoş geldin! 🎉',
        'TravelBot ile seyahat planlamalarını Yapay Zeka Destekli asistanın ile hızlıca yapabilirsin.',
        [{ text: 'Tamam', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Kayıt olunamadı.';
      Alert.alert('Kayıt Hatası', message);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.inner, { paddingTop: insets.top + 40 }]}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🌍</Text>
            </View>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>
              Yeni seyahat rotalarını keşfetmek için aramıza katıl.
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name='person-outline'
                size={20}
                color={Colors.light.icon}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder='Adın Soyadın'
                placeholderTextColor={Colors.light.icon + '80'}
                value={fullName}
                onChangeText={setFullName}
                autoComplete='name'
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name='mail-outline'
                size={20}
                color={Colors.light.icon}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder='E-posta Adresin'
                placeholderTextColor={Colors.light.icon + '80'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize='none'
                keyboardType='email-address'
                autoComplete='email'
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name='lock-closed-outline'
                size={20}
                color={Colors.light.icon}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder='Şifren (en az 6 karakter)'
                placeholderTextColor={Colors.light.icon + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete='new-password'
              />
            </View>

            <Pressable
              onPress={handleSignUp}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.buttonWrapper,
                pressed && { opacity: 0.9 },
                isLoading && styles.buttonDisabled,
              ]}
            >
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.primaryContainer]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {isLoading ? (
                  <ActivityIndicator color='#fff' />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Kayıt Ol</Text>
                    <Ionicons name='rocket-outline' size={20} color='#fff' />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>VEYA</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={styles.socialBtn}>
                <Ionicons name='logo-google' size={24} color={Colors.light.text} />
              </Pressable>
              <Pressable style={styles.socialBtn}>
                <Ionicons name='logo-apple' size={24} color={Colors.light.text} />
              </Pressable>
            </View>

            <Pressable onPress={() => router.back()} style={styles.loginLink}>
              <Text style={styles.footerText}>
                Zaten hesabın var mı? <Text style={styles.footerLinkBold}>Giriş Yap</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: Roundness.xl,
    backgroundColor: Colors.light.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  logoEmoji: {
    fontSize: 34,
  },
  title: {
    fontSize: Typography.sizes.h1,
    fontFamily: Typography.fonts.heading,
    color: Colors.light.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.body,
    color: Colors.light.icon,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  form: {
    gap: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Roundness.xl,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.body,
    color: Colors.light.text,
  },
  buttonWrapper: {
    marginTop: Spacing.md,
  },
  button: {
    height: 56,
    borderRadius: Roundness.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.bodyBold,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.surfaceContainer,
  },
  dividerText: {
    fontSize: 10,
    fontFamily: Typography.fonts.label,
    color: Colors.light.icon,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  socialBtn: {
    width: 54,
    height: 54,
    borderRadius: Roundness.full,
    backgroundColor: Colors.light.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.surfaceContainer,
  },
  loginLink: {
    marginTop: Spacing.sm,
  },
  footerText: {
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.body,
    color: Colors.light.icon,
  },
  footerLinkBold: {
    color: Colors.light.primary,
    fontFamily: Typography.fonts.bodyBold,
  },
});
