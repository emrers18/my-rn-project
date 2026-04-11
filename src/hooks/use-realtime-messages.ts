import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { CHAT_HISTORY_QUERY_KEY } from './use-chat-history';
import { MESSAGES_QUERY_KEY } from './use-messages';

/**
 * Supabase Realtime ile messages tablosunu dinler.
 * Yeni mesaj geldiğinde React Query cache'ini invalidate eder.
 *
 * @param chatId - Dinlenecek chat ID (null ise subscribe olmaz)
 * @param userId - Chat history güncellemesi için
 */
export function useRealtimeMessages(chatId: string | null, userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatId || !userId) return;

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          // Yeni mesaj geldi — cache'i yenile
          queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY(chatId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, userId, queryClient]);
}

/**
 * Chats tablosunu dinler — yeni chat açıldığında home listesi güncellenir.
 */
export function useRealtimeChats(userId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`chats:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: CHAT_HISTORY_QUERY_KEY(userId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
