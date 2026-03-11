import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/auth-store';

export default function HomeScreen() {
  const { user, signOut, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinden emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Merhaba, {user?.user_metadata?.full_name ?? 'Gezgin'} 👋
          </Text>
        </View>
        <Pressable onPress={handleSignOut} disabled={isLoading}>
          <Text style={styles.signOutText}>Çıkış</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>✈️</Text>
        <Text style={styles.heroTitle}>Nereye gitmek istersin?</Text>
        <Text style={styles.heroSubtitle}>
          AI asistanın seyahat planını oluşturmana yardımcı olmaya hazır.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.chatButton} onPress={() => router.push('/(app)/chat')}>
          <Text style={styles.chatButtonText}>💬 Sohbeti Başlat</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#94a3b8',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  heroEmoji: {
    fontSize: 72,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  chatButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
