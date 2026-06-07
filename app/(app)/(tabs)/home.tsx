import { useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SwipeableChatItem } from '@/components/swipeable-chat-item';
import { Colors, Roundness, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { ChatSession } from '@/src/domain/entities/chat-session';
import { useChatHistory } from '@/src/hooks/use-chat-history';
import { useDeleteChat } from '@/src/hooks/use-delete-chat';
import { useProfile } from '@/src/hooks/use-profile';
import { useRealtimeChats } from '@/src/hooks/use-realtime-messages';
import { getDependencies } from '@/src/lib/di';
import { useAuthStore } from '@/store/auth-store';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  examplePrompt: string;
  promptSubtitle: string;
  gradient: [string, string];
}

const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: 'destination',
    title: 'Destinasyon Rehberi',
    description:
      'Seyahat etmek istediğiniz yerin en popüler noktalarını, güncel hava durumunu ve konum haritasını tek bir kartta bir araya getirir.',
    emoji: '🗺️',
    examplePrompt: "Paris'te gezilecek en popüler yerleri göster",
    promptSubtitle:
      "Paris'in turistik mekanlarını, hava durumunu ve harita yerleşimini içeren zengin bir kart.",
    gradient: ['#0052CC', '#002D72'],
  },
  {
    id: 'hotel',
    title: 'Akıllı Otel Arama',
    description:
      'Bütçenize ve kriterlerinize uygun konaklama seçeneklerini fiyat, popülerlik puanları ve doğrudan rezervasyon butonlarıyla birlikte sunar.',
    emoji: '🏨',
    examplePrompt: "Roma'da geceliği 150 doların altında otel önerir misin?",
    promptSubtitle: 'Bütçenize en uygun Roma otellerini interaktif kartlar halinde listeleyin.',
    gradient: ['#3D5CA2', '#002D72'],
  },
  {
    id: 'ticket',
    title: 'Ulaşım & Seferler',
    description:
      'Uçak veya otobüs bilet saatlerini, fiyatlarını ve doğrudan satın alma butonunu bir arada göstererek seyahat planlamanızı hızlandırır.',
    emoji: '✈️',
    examplePrompt: "İstanbul'dan Barselona'ya uçuş seferlerini listeler misin?",
    promptSubtitle: 'Uçuş saatleri, fiyatları ve doğrudan bilet alma bağlantısını bulun.',
    gradient: ['#00B4FF', '#0052CC'],
  },
  {
    id: 'route',
    title: 'Rota & Duraklar',
    description:
      'Günlük seyahat duraklarınızı sıralı bir şekilde listeleyerek gün gün nerede olacağınızı interaktif bir harita rotası üzerinde gösterir.',
    emoji: '📍',
    examplePrompt: 'Amsterdam için 3 günlük detaylı seyahat rotası çıkar',
    promptSubtitle: 'Adım adım durakları ve bu durakları birleştiren harita çizgisini içeren rota.',
    gradient: ['#0052CC', '#00B4FF'],
  },
  {
    id: 'map',
    title: 'İnteraktif Harita',
    description:
      'Seyahat noktalarını veya tüm durakları harita üzerinde görselleştirir. Konum koordinatları ve bağlantı yolları ile gezinmeyi kolaylaştırır.',
    emoji: '🗺️',
    examplePrompt: 'Roma ve Floransa seyahatini haritada göster',
    promptSubtitle:
      'Harita üzerinde seyahat edeceğiniz şehirlerin konumlarını ve aralarındaki bağlantıyı inceleyin.',
    gradient: ['#002D72', '#00B4FF'],
  },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const userId = user?.id ?? null;
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);

  const { data: profile } = useProfile(userId);
  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);

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

  const handleStartWithPrompt = async (promptText: string) => {
    if (!userId) return;
    const { chatRepository } = getDependencies();
    const result = await chatRepository.createChat({ userId, title: promptText });
    if (result.isOk()) {
      router.push({
        pathname: '/(app)/chat',
        params: { chatId: result.value.id, initialPrompt: promptText },
      });
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
          AI Asistanın seyahat planını oluşturmana yardımcı olmaya hazır.
        </Text>
      </Animated.View>

      {/* Yapay Zeka Kartları Tanıtımı */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.featuresSection}>
        <Text style={styles.featuresSectionTitle}>AI Seyahat Özellikleri</Text>
        <FlatList<FeatureItem>
          horizontal
          data={FEATURE_ITEMS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuresList}
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelectedFeature(item)} style={styles.featureCardPressable}>
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featureCard}
              >
                <Text style={styles.featureEmoji}>{item.emoji}</Text>
                <View>
                  <Text style={styles.featureCardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.featureCardSubtitle} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          )}
        />
      </Animated.View>

      {/* Sohbet Geçmişi */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Sohbet Geçmişi</Text>

        {chatsLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />}

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
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Text style={styles.fabText}>💬 Yeni Sohbet Başlat</Text>
        </LinearGradient>
      </Pressable>

      {/* Detay Modalı */}
      <Modal
        visible={selectedFeature !== null}
        transparent
        animationType='fade'
        onRequestClose={() => setSelectedFeature(null)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(300)} style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalEmoji}>{selectedFeature?.emoji}</Text>
                <Text style={styles.modalTitle}>{selectedFeature?.title}</Text>
              </View>
              <Pressable onPress={() => setSelectedFeature(null)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <Text style={styles.modalDescription}>{selectedFeature?.description}</Text>

              {/* Örnek Sorgu Kutusu */}
              <View style={styles.promptContainer}>
                <Text style={styles.promptLabel}>Nasıl Kullanılır?</Text>
                <Text style={styles.promptSubtitle}>
                  TravelBot asistanına sohbet ekranında aşağıdaki gibi yazarak bu kartı
                  tetikleyebilirsiniz:
                </Text>
                <View style={styles.promptBox}>
                  <Text style={styles.promptText}>
                    &quot;{selectedFeature?.examplePrompt}&quot;
                  </Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Aksiyonları */}
            <View style={styles.modalActions}>
              <Pressable
                style={styles.tryButton}
                onPress={() => {
                  if (selectedFeature) {
                    const prompt = selectedFeature.examplePrompt;
                    setSelectedFeature(null);
                    setTimeout(() => {
                      handleStartWithPrompt(prompt);
                    }, 100);
                  }
                }}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryContainer]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tryButtonGradient}
                >
                  <Text style={styles.tryButtonText}>💬 Hemen Dene</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.icon,
    },
    userName: {
      fontFamily: Typography.fonts.heading,
      fontSize: Typography.sizes.h2,
      color: colors.text,
      marginTop: 2,
    },
    profileButton: {
      width: 44,
      height: 44,
      borderRadius: Roundness.full,
      backgroundColor: colors.surfaceContainer,
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
      color: colors.text,
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    heroSubtitle: {
      fontFamily: Typography.fonts.body,
      fontSize: Typography.sizes.body,
      color: colors.icon,
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
      color: colors.text,
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
      color: colors.icon,
      fontSize: Typography.sizes.body,
      textAlign: 'center',
    },
    errorContainer: {
      marginTop: Spacing.md,
      alignItems: 'center',
    },
    errorText: {
      fontFamily: Typography.fonts.body,
      color: colors.error,
      fontSize: Typography.sizes.body,
    },
    fabContainer: {
      position: 'absolute',
      bottom: Spacing.xl,
      left: Spacing.lg,
      right: Spacing.lg,
      elevation: 8,
      shadowColor: colors.text,
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
    featuresSection: {
      marginBottom: Spacing.lg,
    },
    featuresSectionTitle: {
      fontFamily: Typography.fonts.heading,
      fontSize: Typography.sizes.h2,
      color: colors.text,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    featuresList: {
      paddingHorizontal: Spacing.lg,
      gap: Spacing.sm,
    },
    featureCardPressable: {
      width: 160,
      height: 125,
      borderRadius: Roundness.md,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },
    featureCard: {
      flex: 1,
      borderRadius: Roundness.md,
      padding: Spacing.sm + 2,
      justifyContent: 'space-between',
    },
    featureEmoji: {
      fontSize: 24,
    },
    featureCardTitle: {
      fontFamily: Typography.fonts.heading,
      color: '#FFFFFF',
      fontSize: 13,
      marginTop: Spacing.xs,
    },
    featureCardSubtitle: {
      fontFamily: Typography.fonts.body,
      color: 'rgba(255, 255, 255, 0.85)',
      fontSize: 10,
      marginTop: 2,
      lineHeight: 13,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
    },
    modalContent: {
      width: '100%',
      backgroundColor: colors.background,
      borderRadius: Roundness.md,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.surfaceContainer,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    modalHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      flex: 1,
    },
    modalEmoji: {
      fontSize: 26,
    },
    modalTitle: {
      fontFamily: Typography.fonts.heading,
      fontSize: Typography.sizes.h2 - 2,
      color: colors.text,
      flex: 1,
      flexWrap: 'wrap',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: Roundness.full,
      backgroundColor: colors.surfaceContainer,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: Spacing.xs,
    },
    closeButtonText: {
      color: colors.icon,
      fontSize: 12,
      fontWeight: 'bold',
    },
    modalScroll: {
      paddingBottom: Spacing.md,
    },
    modalDescription: {
      fontFamily: Typography.fonts.body,
      fontSize: Typography.sizes.body,
      color: colors.text,
      lineHeight: 22,
      marginBottom: Spacing.md,
    },
    promptContainer: {
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: Roundness.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceContainer,
      marginBottom: Spacing.md,
    },
    promptLabel: {
      fontFamily: Typography.fonts.heading,
      fontSize: 14,
      color: colors.primaryContainer,
      marginBottom: 4,
    },
    promptSubtitle: {
      fontFamily: Typography.fonts.body,
      fontSize: 12,
      color: colors.icon,
      lineHeight: 18,
      marginBottom: Spacing.xs,
    },
    promptBox: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.surfaceContainer,
      borderRadius: Roundness.sm,
      padding: Spacing.sm,
      marginTop: 4,
    },
    promptText: {
      fontFamily: Typography.fonts.bodyBold,
      fontSize: Typography.sizes.body,
      color: colors.primaryContainer,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    modalActions: {
      marginTop: Spacing.xs,
    },
    tryButton: {
      borderRadius: Roundness.full,
      overflow: 'hidden',
    },
    tryButtonGradient: {
      paddingVertical: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tryButtonText: {
      fontFamily: Typography.fonts.heading,
      color: '#FFFFFF',
      fontSize: 16,
    },
  });
