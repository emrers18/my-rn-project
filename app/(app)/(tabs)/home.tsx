import { Image } from 'expo-image';
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SwipeableChatItem } from '@/components/swipeable-chat-item';
import { Colors, Roundness, Spacing, Typography } from '@/constants/theme';
import { ChatSession } from '@/src/domain/entities/chat-session';
import { useChatHistory } from '@/src/hooks/use-chat-history';
import { useDeleteChat } from '@/src/hooks/use-delete-chat';
import { useProfile } from '@/src/hooks/use-profile';
import { useRealtimeChats } from '@/src/hooks/use-realtime-messages';
import { getDependencies } from '@/src/lib/di';
import { useAuthStore } from '@/store/auth-store';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const userId = user?.id ?? null;

  const { data: profile } = useProfile(userId);

  const {
    data: chats,
    isLoading: chatsLoading,
    error: chatsError,
    refetch,
  } = useChatHistory(userId);

  const { mutate: deleteChat } = useDeleteChat(userId);

  useRealtimeChats(userId);

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

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId, {
      onError: () => Alert.alert('Hata', 'Sohbet silinemedi. Lütfen tekrar dene.'),
    });
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
            {profile?.fullName?.split(' ')[0] ??
              user?.user_metadata?.full_name?.split(' ')[0] ??
              user?.email?.split('@')[0] ??
              'Gezgin'}
          </Text>
        </View>
        <Pressable onPress={() => router.push('/profile')} style={styles.profileButton}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileIcon}>👤</Text>
          )}
        </Pressable>
      </View>

      {/* Hero Section */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
        <Text style={styles.heroTitle}>Nereye gitmek istersin?</Text>
        <Text style={styles.heroSubtitle}>
          AI asistanın seyahat planını oluşturmana yardımcı olmaya hazır.
        </Text>
      </Animated.View>

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
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyText}>Henüz sohbet yok. İlk sohbeti başlat!</Text>
          </Animated.View>
        )}

        <FlatList<ChatSession>
          data={chats ?? []}
          keyExtractor={(item: ChatSession) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }: { item: ChatSession; index: number }) => (
            <SwipeableChatItem
              chat={item}
              index={index}
              onPress={handleOpenChat}
              onDelete={handleDeleteChat}
              formatDate={formatDate}
            />
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
    overflow: 'hidden',
  },
  profileIcon: {
    fontSize: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
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
    gap: Spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
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
