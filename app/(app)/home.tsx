import { LinearGradient } from 'expo-linear-gradient';
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

import { Colors, Roundness, Spacing, Typography } from '@/constants/theme';
import { ChatSession } from '@/src/domain/entities/chat-session';
import { useChatHistory } from '@/src/hooks/use-chat-history';
import { useRealtimeChats } from '@/src/hooks/use-realtime-messages';
import { getDependencies } from '@/src/lib/di';
import { useAuthStore } from '@/store/auth-store';

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
            {user?.user_metadata?.full_name?.split(' ')[0] ??
              user?.email?.split('@')[0] ??
              'Gezgin'}
          </Text>
        </View>
        <Pressable onPress={handleSignOut} style={styles.profileButton} disabled={isLoading}>
          <Text style={styles.profileIcon}>👤</Text>
        </Pressable>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Nereye gitmek istersin?</Text>
        <Text style={styles.heroSubtitle}>
          AI asistanın seyahat planını oluşturmana yardımcı olmaya hazır.
        </Text>
      </View>

      {/* Sohbet Geçmişi */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Sohbet Geçmişi</Text>

        {chatsLoading && (
          <ActivityIndicator color={Colors.light.primary} style={{ marginTop: 16 }} />
        )}

        {chatsError && (
          <Pressable onPress={() => refetch()} style={styles.errorContainer}>
            <Text style={styles.errorText}>Yüklenemedi. Tekrar dene →</Text>
          </Pressable>
        )}

        {!chatsLoading && !chatsError && (chats?.length ?? 0) === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz sohbet yok. İlk sohbeti başlat!</Text>
          </View>
        )}

        <FlatList<ChatSession>
          data={chats ?? []}
          keyExtractor={(item: ChatSession) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: ChatSession }) => (
            <Pressable style={styles.chatItem} onPress={() => handleOpenChat(item)}>
              <View style={styles.chatItemLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.chatIcon}>💬</Text>
                </View>
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
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      <Pressable style={styles.fabContainer} onPress={handleNewChat}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Text style={styles.fabText}>💬 Yeni Sohbet Başlat</Text>
        </LinearGradient>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  greeting: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.label,
    color: Colors.light.icon,
  },
  userName: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.h2,
    color: Colors.light.text,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: Roundness.full,
    backgroundColor: Colors.light.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  heroTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.display,
    color: Colors.light.text,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.body,
    color: Colors.light.icon,
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
  historySection: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.h2,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: Typography.fonts.body,
    color: Colors.light.icon,
    fontSize: Typography.sizes.body,
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: Typography.fonts.body,
    color: Colors.light.error,
    fontSize: Typography.sizes.body,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Roundness.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  chatItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Roundness.md,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIcon: {
    fontSize: 18,
  },
  chatTitle: {
    fontFamily: Typography.fonts.label,
    color: Colors.light.text,
    fontSize: Typography.sizes.body,
    fontWeight: '600',
    maxWidth: 220,
  },
  chatDate: {
    fontFamily: Typography.fonts.body,
    color: Colors.light.icon,
    fontSize: Typography.sizes.caption,
    marginTop: 2,
  },
  chevron: {
    color: Colors.light.outline,
    fontSize: 24,
    fontFamily: Typography.fonts.body,
  },
  fabContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.lg,
    right: Spacing.lg,
    elevation: 8,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  fab: {
    borderRadius: Roundness.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: {
    fontFamily: Typography.fonts.heading,
    color: '#FFFFFF',
    fontSize: 16,
  },
});
