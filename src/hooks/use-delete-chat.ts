import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ChatSession } from '../domain/entities/chat-session';
import { getDependencies } from '../lib/di';
import { CHAT_HISTORY_QUERY_KEY } from './use-chat-history';

// ─── useDeleteChat ────────────────────────────────────────────────────────────

export function useDeleteChat(userId: string | null) {
  const queryClient = useQueryClient();
  const { chatRepository } = getDependencies();

  return useMutation({
    mutationFn: async (chatId: string) => {
      const result = await chatRepository.deleteChat(chatId);
      if (result.isErr()) throw new Error(result.error.message);
    },

    // Optimistic: cache'den hemen kaldır
    onMutate: async (chatId: string) => {
      if (!userId) return;

      await queryClient.cancelQueries({ queryKey: CHAT_HISTORY_QUERY_KEY(userId) });

      const previousChats = queryClient.getQueryData<ChatSession[]>(CHAT_HISTORY_QUERY_KEY(userId));

      queryClient.setQueryData<ChatSession[]>(CHAT_HISTORY_QUERY_KEY(userId), (old) =>
        (old ?? []).filter((c) => c.id !== chatId)
      );

      return { previousChats };
    },

    // Hata: eski veriyi geri yükle
    onError: (_err, _chatId, context) => {
      if (context?.previousChats && userId) {
        queryClient.setQueryData(CHAT_HISTORY_QUERY_KEY(userId), context.previousChats);
      }
    },

    onSettled: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: CHAT_HISTORY_QUERY_KEY(userId) });
      }
    },
  });
}
