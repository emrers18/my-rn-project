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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Message } from '@/src/domain/entities/message';
import { useMessages } from '@/src/hooks/use-messages';
import { useRealtimeMessages } from '@/src/hooks/use-realtime-messages';
import { useSendMessage } from '@/src/hooks/use-send-message';
import { useAuthStore } from '@/store/auth-store';

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

  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  // Realtime — asistan cevapları anlık gelecek
  useRealtimeMessages(chatId ?? null, userId);

  // Yeni mesaj gelince en alta kaydır
  const messages = data?.messages ?? [];
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    const content = inputText.trim();
    if (!content || !chatId || !userId || isSending) return;

    setInputText('');
    sendMessage(
      { chatId, userId, content },
      {
        onError: () => Alert.alert('Hata', 'Mesaj gönderilemedi. Tekrar dene.'),
      }
    );
  };

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.bubbleText, isUser ? styles.textUser : styles.textAssistant]}>
          {item.content}
        </Text>
        <Text style={styles.bubbleTime}>
          {new Date(item.createdAt).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {chatId ? 'Sohbet' : 'Yeni Sohbet'}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Mesaj Listesi */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color='#3b82f6' size='large' />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Mesajlar yüklenemedi.</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>Sohbet Başlat</Text>
          <Text style={styles.emptySubtitle}>
            Seyahat planın hakkında bir şeyler sor!{'\n'}AI asistanın yardımcı olmaya hazır.
          </Text>
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
              <ActivityIndicator color='#475569' style={{ marginBottom: 8 }} />
            ) : null
          }
        />
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            style={styles.input}
            placeholder='Bir şeyler sor...'
            placeholderTextColor='#475569'
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={4000}
            editable={!isSending}
            onSubmitEditing={handleSend}
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
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backBtn: { width: 44, alignItems: 'flex-start' },
  backText: { color: '#3b82f6', fontSize: 22, fontWeight: '600' },
  headerTitle: { color: '#f8fafc', fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#f8fafc' },
  emptySubtitle: { fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 22 },
  errorText: { color: '#ef4444', fontSize: 15 },
  messageList: { padding: 16, gap: 8, flexGrow: 1 },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 6 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#3b82f6' },
  bubbleAssistant: { alignSelf: 'flex-start', backgroundColor: '#1e293b' },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  textUser: { color: '#fff' },
  textAssistant: { color: '#e2e8f0' },
  bubbleTime: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'right' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#1e3a5f' },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
