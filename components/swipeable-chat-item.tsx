import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors, Roundness, Spacing, Typography } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useThemedStyles } from '@/hooks/use-themed-styles';
import { ChatSession } from '@/src/domain/entities/chat-session';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SwipeableChatItemProps {
  chat: ChatSession;
  index: number;
  onPress: (chat: ChatSession) => void;
  onDelete: (chatId: string) => void;
  formatDate: (iso: string) => string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SwipeableChatItem({
  chat,
  index,
  onPress,
  onDelete,
  formatDate,
}: SwipeableChatItemProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const colors = useThemeColors();
  const styles = useThemedStyles(createStyles);

  const handleDelete = () => {
    Alert.alert('Sohbeti Sil', `"${chat.title}" silinecek. Bu işlem geri alınamaz.`, [
      { text: 'İptal', style: 'cancel', onPress: () => swipeableRef.current?.close() },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          swipeableRef.current?.close();
          onDelete(chat.id);
        },
      },
    ]);
  };

  const renderRightActions = () => (
    <View style={styles.deleteContainer}>
      <Pressable style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name='trash-outline' size={22} color='#FFFFFF' />
        <Text style={styles.deleteText}>Sil</Text>
      </Pressable>
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 60, 300)).springify()}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        <Pressable style={styles.chatItem} onPress={() => onPress(chat)}>
          <View style={styles.chatItemLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.chatIcon}>💬</Text>
            </View>
            <View style={styles.chatItemContent}>
              <Text style={styles.chatTitle} numberOfLines={1}>
                {chat.title}
              </Text>
              <Text style={styles.chatDate}>{formatDate(chat.updatedAt)}</Text>
            </View>
          </View>
          <Ionicons name='chevron-forward' size={18} color={colors.outline} />
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    chatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaceContainerLow,
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
    chatItemContent: {
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: Roundness.md,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chatIcon: {
      fontSize: 18,
    },
    chatTitle: {
      fontFamily: Typography.fonts.label,
      color: colors.text,
      fontSize: Typography.sizes.body,
      fontWeight: '600',
    },
    chatDate: {
      fontFamily: Typography.fonts.body,
      color: colors.icon,
      fontSize: Typography.sizes.caption,
      marginTop: 2,
    },
    deleteContainer: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      marginBottom: Spacing.sm,
      marginLeft: Spacing.xs,
    },
    deleteBtn: {
      backgroundColor: colors.error,
      borderRadius: Roundness.lg,
      height: '100%',
      width: 80,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
    deleteText: {
      fontFamily: Typography.fonts.label,
      color: '#FFFFFF',
      fontSize: Typography.sizes.caption,
    },
  });
