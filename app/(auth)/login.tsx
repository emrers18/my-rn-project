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

import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'E-posta ve şifre alanları boş bırakılamaz.');
      return;
    }
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Giriş yapılamadı.';
      Alert.alert('Giriş Hatası', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.emoji}>✈️</Text>
          <Text style={styles.title}>TravelBot</Text>
          <Text style={styles.subtitle}>Seyahat asistanına hoş geldin</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder='E-posta adresin'
            placeholderTextColor='#94a3b8'
            value={email}
            onChangeText={setEmail}
            autoCapitalize='none'
            keyboardType='email-address'
            autoComplete='email'
          />
          <TextInput
            style={styles.input}
            placeholder='Şifren'
            placeholderTextColor='#94a3b8'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete='password'
          />

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.linkText}>
            Hesabın yok mu? <Text style={styles.linkHighlight}>Kayıt Ol</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  linkText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 15,
  },
  linkHighlight: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});
