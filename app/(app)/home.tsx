import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/store/auth-store';
import { useChatHistory } from '@/src/hooks/use-chat-history';
import { useRealtimeChats } from '@/src/hooks/use-realtime-messages';
import { getDependencies } from '@/src/lib/di';
import { ChatSession } from '@/src/domain/entities/chat-session';

export default function HomeScreen() {
  const { user, signOut, isLoading } = useAuthStore();
  const router = useRouter();
  const userId = user?.id ?? null;

  const {
    data: chats,
    isLoading: chatsLoading,
    error: chatsError,
    refetch,
  } = useChatHistory(userId);

  // Realtime: chats tablosu değiştiğinde listeyi güncelle
  useRealtimeChats(userId);

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

  const handleNewChat = async () => {
    if (!userId) return;
    const { chatRepository } = getDependencies();
    const result = await chatRepository.createChat({ userId, title: 'Yeni Sohbet' });
    if (result.isOk()) {
      router.push({ pathname: '/(app)/chat', params: { chatId: result.value.id } });
    } else {
      Alert.alert('Hata', 'Sohbet oluşturulamadı.');
    }
  };

  const handleOpenChat = (chat: ChatSession) => {
    router.push({ pathname: '/(app)/chat', params: { chatId: chat.id } });
  };

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba 👋</Text>
          <Text style={styles.userName}>
            {user?.user_metadata?.full_name ?? user?.email ?? 'Gezgin'}
          </Text>
        </View>
        <Pressable onPress={handleSignOut} disabled={isLoading}>
          <Text style={styles.signOutText}>Çıkış</Text>
        </Pressable>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>✈️</Text>
        <Text style={styles.heroTitle}>Nereye gitmek istersin?</Text>
        <Text style={styles.heroSubtitle}>
          AI asistanın seyahat planını oluşturmana yardımcı olmaya hazır.
        </Text>
      </View>

      {/* Sohbet Geçmişi */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Sohbet Geçmişi</Text>

        {chatsLoading && <ActivityIndicator color='#3b82f6' style={{ marginTop: 16 }} />}

        {chatsError && (
          <Pressable onPress={() => refetch()}>
            <Text style={styles.errorText}>Yüklenemedi. Tekrar dene →</Text>
          </Pressable>
        )}

        {!chatsLoading && !chatsError && (chats?.length ?? 0) === 0 && (
          <Text style={styles.emptyText}>Henüz sohbet yok. İlk sohbeti başlat!</Text>
        )}

        <FlatList
          data={chats ?? []}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable style={styles.chatItem} onPress={() => handleOpenChat(item)}>
              <View style={styles.chatItemLeft}>
                <Text style={styles.chatIcon}>💬</Text>
                <View>
                  <Text style={styles.chatTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.chatDate}>{formatDate(item.updatedAt)}</Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          )}
        />
      </View>

      {/* Yeni Sohbet Butonu */}
      <View style={styles.actions}>
        <Pressable style={styles.chatButton} onPress={handleNewChat}>
          <Text style={styles.chatButtonText}>💬 Yeni Sohbet Başlat</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 13, color: '#94a3b8' },
  userName: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginTop: 2 },
  signOutText: { color: '#ef4444', fontSize: 15, fontWeight: '600' },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 28,
    gap: 8,
  },
  heroEmoji: { fontSize: 56 },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSubtitle: { fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 22 },
  historySection: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 12 },
  emptyText: { color: '#475569', fontSize: 14, textAlign: 'center', marginTop: 12 },
  errorText: { color: '#ef4444', fontSize: 14, marginTop: 8 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  chatItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  chatIcon: { fontSize: 20 },
  chatTitle: { color: '#f8fafc', fontSize: 15, fontWeight: '600', maxWidth: 220 },
  chatDate: { color: '#64748b', fontSize: 12, marginTop: 2 },
  chevron: { color: '#475569', fontSize: 20 },
  actions: { paddingHorizontal: 24, paddingBottom: 32 },
  chatButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  chatButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
