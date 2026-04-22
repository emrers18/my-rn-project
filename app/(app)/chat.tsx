import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { GenUIRenderer } from '@/components/gen-ui/gen-ui-renderer';
import { Colors, Roundness, Spacing, Typography } from '@/constants/theme';
import { Message } from '@/src/domain/entities/message';
import { useAiChat } from '@/src/hooks/use-ai-chat';
import { useMessages } from '@/src/hooks/use-messages';
import { useRealtimeMessages } from '@/src/hooks/use-realtime-messages';
import { useAuthStore } from '@/store/auth-store';

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.typingBubble}>
      <View style={styles.typingDots}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.typingDot, { opacity: 0.4 + i * 0.2 }]} />
        ))}
      </View>
      <Text style={styles.typingLabel}>TravelBot yanıtlıyor…</Text>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { user } = useAuthStore();
  const [inputText, setInputText] = useState('');
  const listRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const userId = user?.id ?? null;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error } = useMessages(
    chatId ?? null
  );

  const { mutate: sendAiMessage, isPending: isSending } = useAiChat();

  useRealtimeMessages(chatId ?? null, userId);

  const messages = data?.messages ?? [];

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  useEffect(() => {
    if (isSending) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [isSending]);

  const handleSend = () => {
    const content = inputText.trim();
    if (!content || !chatId || !userId || isSending) return;

    setInputText('');
    sendAiMessage(
      { chatId, userId, content },
      {
        onError: () => Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar dene.'),
      }
    );
  };

  function renderMessage({ item, index }: { item: Message; index: number }) {
    const isUser = item.role === 'user';
    const isGenUI = !isUser && item.metadata.isGenUI && !!item.metadata.widgetType;

    if (isGenUI) {
      return (
        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.genUIContainer}>
          {item.content ? (
            <View style={styles.genUITextBubble}>
              <Text style={styles.genUIBotLabel}>TravelBot</Text>
              <Text style={styles.genUIText}>{item.content}</Text>
            </View>
          ) : null}
          <GenUIRenderer
            widgetType={item.metadata.widgetType as string}
            widgetData={item.metadata.widgetData as Record<string, unknown> | undefined}
          />
          <Text style={styles.bubbleTime}>
            {new Date(item.createdAt).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        entering={FadeInDown.delay(Math.min(index * 20, 100)).springify()}
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}
      >
        {!isUser && <Text style={styles.botLabel}>TravelBot</Text>}
        <Text style={[styles.bubbleText, isUser ? styles.textUser : styles.textAssistant]}>
          {item.content}
        </Text>
        <Text
          style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeAssistant]}
        >
          {new Date(item.createdAt).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {chatId ? 'TravelBot Assistant' : 'Yeni Sohbet'}
          </Text>
          <View style={[styles.statusDot, isSending && styles.statusDotActive]} />
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Mesaj Listesi */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.light.primary} size='large' />
          <Text style={styles.loadingText}>Sohbet yükleniyor…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😞</Text>
          <Text style={styles.errorText}>Mesajlar yüklenemedi.</Text>
        </View>
      ) : messages.length === 0 && !isSending ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>{'TravelBot\u0027a Sor'}</Text>
          <Text style={styles.emptySubtitle}>
            Destinasyon, otel, uçuş veya rota hakkında her şeyi sorabilirsin!
          </Text>
          <View style={styles.suggestionRow}>
            {["Roma'da butik otel", 'Paris rotası', 'İstanbul → Barcelona uçuşu'].map((s) => (
              <Pressable key={s} style={styles.suggestionChip} onPress={() => setInputText(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onStartReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onStartReachedThreshold={0.1}
          ListHeaderComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={Colors.light.icon} style={{ marginBottom: 8 }} />
            ) : null
          }
          ListFooterComponent={isSending ? <TypingIndicator /> : null}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={styles.input}
            placeholder='Bir şey sor…'
            placeholderTextColor={Colors.light.icon}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={4000}
            editable={!isSending}
            blurOnSubmit={false}
          />
          <Pressable
            style={[styles.sendBtn, (!inputText.trim() || isSending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator color='#fff' size='small' />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.background,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backText: {
    color: Colors.light.primary,
    fontSize: 32,
    fontFamily: Typography.fonts.body,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: Colors.light.text,
    fontSize: Typography.sizes.body,
    fontFamily: Typography.fonts.heading,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Roundness.full,
    backgroundColor: Colors.light.outline,
  },
  statusDotActive: {
    backgroundColor: '#22C55E',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    fontFamily: Typography.fonts.body,
    color: Colors.light.icon,
    fontSize: Typography.sizes.label,
  },
  errorEmoji: { fontSize: 40 },
  errorText: {
    fontFamily: Typography.fonts.body,
    color: Colors.light.error,
    fontSize: Typography.sizes.body,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.h1,
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.body,
    color: Colors.light.icon,
    textAlign: 'center',
    lineHeight: 22,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  suggestionChip: {
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: Roundness.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  suggestionText: {
    fontFamily: Typography.fonts.label,
    color: Colors.light.primary,
    fontSize: Typography.sizes.caption,
    fontWeight: '600',
  },
  messageList: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: Roundness.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.light.primaryContainer,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.surfaceContainerLow,
  },
  botLabel: {
    fontFamily: Typography.fonts.heading,
    color: Colors.light.primary,
    fontSize: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bubbleText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.body,
    lineHeight: 22,
  },
  textUser: { color: '#FFFFFF' },
  textAssistant: { color: Colors.light.text },
  bubbleTime: {
    fontSize: 10,
    fontFamily: Typography.fonts.body,
    marginTop: 4,
    textAlign: 'right',
  },
  bubbleTimeAssistant: { color: Colors.light.icon },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.7)' },
  genUIContainer: {
    alignSelf: 'stretch',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  genUITextBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Roundness.lg,
    padding: Spacing.md,
    maxWidth: '90%',
  },
  genUIBotLabel: {
    fontFamily: Typography.fonts.heading,
    color: Colors.light.primary,
    fontSize: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  genUIText: {
    fontFamily: Typography.fonts.body,
    color: Colors.light.text,
    fontSize: Typography.sizes.body,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Roundness.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  typingDots: { flexDirection: 'row', gap: 4 },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
  },
  typingLabel: {
    fontFamily: Typography.fonts.body,
    color: Colors.light.icon,
    fontSize: Typography.sizes.caption,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.surfaceContainer,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: Roundness.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.light.text,
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.body,
    maxHeight: 120,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: Roundness.full,
    backgroundColor: Colors.light.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
});
