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
import { TRANSLATIONS } from '@/constants/translations';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { ChatSession } from '@/src/domain/entities/chat-session';
import { useChatHistory } from '@/src/hooks/use-chat-history';
import { useDeleteChat } from '@/src/hooks/use-delete-chat';
import { useProfile } from '@/src/hooks/use-profile';
import { useRealtimeChats } from '@/src/hooks/use-realtime-messages';
import { getDependencies } from '@/src/lib/di';
import { useAuthStore } from '@/store/auth-store';
import { usePreferencesStore } from '@/store/preferences-store';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  examplePrompt: string;
  promptSubtitle: string;
  gradient: [string, string];
}

function getFeatureItems(t: (typeof TRANSLATIONS)[keyof typeof TRANSLATIONS]): FeatureItem[] {
  return [
    {
      id: 'destination',
      title: t.featDestTitle,
      description: t.featDestDesc,
      emoji: '🗺️',
      examplePrompt: t.featDestPrompt,
      promptSubtitle: t.featDestPromptSub,
      gradient: ['#0052CC', '#002D72'],
    },
    {
      id: 'hotel',
      title: t.featHotelTitle,
      description: t.featHotelDesc,
      emoji: '🏨',
      examplePrompt: t.featHotelPrompt,
      promptSubtitle: t.featHotelPromptSub,
      gradient: ['#3D5CA2', '#002D72'],
    },
    {
      id: 'ticket',
      title: t.featTicketTitle,
      description: t.featTicketDesc,
      emoji: '✈️',
      examplePrompt: t.featTicketPrompt,
      promptSubtitle: t.featTicketPromptSub,
      gradient: ['#00B4FF', '#0052CC'],
    },
    {
      id: 'route',
      title: t.featRouteTitle,
      description: t.featRouteDesc,
      emoji: '📍',
      examplePrompt: t.featRoutePrompt,
      promptSubtitle: t.featRoutePromptSub,
      gradient: ['#0052CC', '#00B4FF'],
    },
    {
      id: 'map',
      title: t.featMapTitle,
      description: t.featMapDesc,
      emoji: '🗺️',
      examplePrompt: t.featMapPrompt,
      promptSubtitle: t.featMapPromptSub,
      gradient: ['#002D72', '#00B4FF'],
    },
  ];
}

interface CuratedRoute {
  id: string;
  title: string;
  description: string;
  emoji: string;
  prompt: string;
  gradient: [string, string];
}

function getCuratedRoutes(t: (typeof TRANSLATIONS)[keyof typeof TRANSLATIONS]): CuratedRoute[] {
  return [
    {
      id: 'rome',
      title: t.routeRomeTitle,
      description: t.routeRomeDesc,
      emoji: '🍕',
      prompt: t.routeRomePrompt,
      gradient: ['#002D72', '#0052CC'],
    },
    {
      id: 'kyoto',
      title: t.routeKyotoTitle,
      description: t.routeKyotoDesc,
      emoji: '⛩️',
      prompt: t.routeKyotoPrompt,
      gradient: ['#5C0632', '#990F4B'],
    },
    {
      id: 'iceland',
      title: t.routeIcelandTitle,
      description: t.routeIcelandDesc,
      emoji: '❄️',
      prompt: t.routeIcelandPrompt,
      gradient: ['#005B5C', '#00A896'],
    },
  ];
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const userId = user?.id ?? null;
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);
  const { language } = usePreferencesStore();
  const t = TRANSLATIONS[language];

  const { data: profile } = useProfile(userId);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  const featureItems = getFeatureItems(t);
  const selectedFeature = featureItems.find((f) => f.id === selectedFeatureId) ?? null;
  const curatedRoutes = getCuratedRoutes(t);

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
    const result = await chatRepository.createChat({ userId, title: t.newChat });
    if (result.isOk()) {
      router.push({ pathname: '/(app)/chat', params: { chatId: result.value.id } });
    } else {
      Alert.alert(t.errorTitle, t.newChatError);
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
      Alert.alert(t.errorTitle, t.newChatError);
    }
  };

  const handleOpenChat = (chat: ChatSession) => {
    router.push({ pathname: '/(app)/chat', params: { chatId: chat.id } });
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId, {
      onError: () => Alert.alert(t.errorTitle, t.deleteChatError),
    });
  };

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList<ChatSession>
        data={chats ?? []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{t.greeting}</Text>
                <Text style={styles.userName}>
                  {profile?.fullName?.split(' ')[0] ??
                    user?.user_metadata?.full_name?.split(' ')[0] ??
                    user?.email?.split('@')[0] ??
                    t.defaultUserName}
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
              <Text style={styles.heroTitle}>{t.heroTitle}</Text>
              <Text style={styles.heroSubtitle}>{t.heroSubtitle}</Text>
            </Animated.View>

            {/* Yapay Zeka Kartları Tanıtımı */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(500)}
              style={styles.featuresSection}
            >
              <Text style={styles.featuresSectionTitle}>{t.featuresSectionTitle}</Text>
              <FlatList<FeatureItem>
                horizontal
                data={featureItems}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuresList}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => setSelectedFeatureId(item.id)}
                    style={styles.featureCardPressable}
                  >
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

            {/* Popüler Rotalar Tanıtımı */}
            <Animated.View
              entering={FadeInDown.delay(150).duration(500)}
              style={styles.featuresSection}
            >
              <Text style={styles.featuresSectionTitle}>{t.popularDestinations}</Text>
              <Text style={styles.popularDestinationsSub}>{t.popularDestinationsSub}</Text>
              <FlatList<CuratedRoute>
                horizontal
                data={curatedRoutes}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuresList}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleStartWithPrompt(item.prompt)}
                    style={styles.featureCardPressable}
                  >
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

            {/* Sohbet Geçmişi Başlığı */}
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>{t.historySectionTitle}</Text>

              {chatsLoading && (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
              )}

              {chatsError && (
                <Pressable onPress={() => refetch()} style={styles.errorContainer}>
                  <Text style={styles.errorText}>{t.errorText}</Text>
                </Pressable>
              )}

              {!chatsLoading && !chatsError && (chats?.length ?? 0) === 0 && (
                <Animated.View
                  entering={FadeInDown.delay(200).springify()}
                  style={styles.emptyContainer}
                >
                  <Text style={styles.emptyEmoji}>🗺️</Text>
                  <Text style={styles.emptyText}>{t.emptyText}</Text>
                </Animated.View>
              )}
            </View>
          </>
        }
        renderItem={({ item, index }: { item: ChatSession; index: number }) => (
          <View style={styles.historyItemContainer}>
            <SwipeableChatItem
              chat={item}
              index={index}
              onPress={handleOpenChat}
              onDelete={handleDeleteChat}
              formatDate={formatDate}
            />
          </View>
        )}
        ListFooterComponent={<View style={{ height: 110 }} />}
      />

      <Pressable style={styles.fabContainer} onPress={handleNewChat}>
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Text style={styles.fabText}>{t.newChatBtn}</Text>
        </LinearGradient>
      </Pressable>

      {/* Detay Modalı */}
      <Modal
        visible={selectedFeatureId !== null}
        transparent
        animationType='fade'
        onRequestClose={() => setSelectedFeatureId(null)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(300)} style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalEmoji}>{selectedFeature?.emoji}</Text>
                <Text style={styles.modalTitle}>{selectedFeature?.title}</Text>
              </View>
              <Pressable onPress={() => setSelectedFeatureId(null)} style={styles.closeButton}>
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
                <Text style={styles.promptLabel}>{t.howToUse}</Text>
                <Text style={styles.promptSubtitle}>{t.howToUseSubtitle}</Text>
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
                    setSelectedFeatureId(null);
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
                  <Text style={styles.tryButtonText}>{t.tryButtonText}</Text>
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
    historyHeader: {
      paddingHorizontal: Spacing.lg,
    },
    historyItemContainer: {
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
    popularDestinationsSub: {
      fontFamily: Typography.fonts.body,
      fontSize: 12,
      color: colors.icon,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
      marginTop: -Spacing.xs + 2,
      opacity: 0.8,
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
