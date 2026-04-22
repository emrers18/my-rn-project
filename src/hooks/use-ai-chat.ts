import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Message } from '../domain/entities/message';
import { supabaseAiDataSource } from '../infrastructure/datasources/supabase-ai-datasource';
import { CHAT_HISTORY_QUERY_KEY } from './use-chat-history';
import { MESSAGES_QUERY_KEY } from './use-messages';

interface AiChatVariables {
  chatId: string;
  userId: string;
  content: string;
}

type PaginatedMessages = {
  pages: { messages: Message[]; nextCursor: string | null }[];
  pageParams: unknown[];
};

export function useAiChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vars: AiChatVariables) => {
      const result = await supabaseAiDataSource.chat(vars);
      if (result.isErr()) throw new Error(result.error.message);
      return result.value;
    },

    // Optimistic: kullanıcı mesajını anında göster
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: MESSAGES_QUERY_KEY(vars.chatId) });

      const optimisticMessage: Message = {
        id: `optimistic-${Date.now()}`,
        chatId: vars.chatId,
        userId: vars.userId,
        role: 'user',
        content: vars.content,
        metadata: { isGenUI: false },
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(MESSAGES_QUERY_KEY(vars.chatId), (old: unknown) => {
        if (!old) return old;
        const data = old as PaginatedMessages;
        return {
          ...data,
          pages: data.pages.map((page, i) =>
            i === data.pages.length - 1
              ? { ...page, messages: [...page.messages, optimisticMessage] }
              : page
          ),
        };
      });

      return { optimisticMessage };
    },

    // Hata: optimistic mesajı kaldır
    onError: (_err, vars, context) => {
      if (context?.optimisticMessage) {
        queryClient.setQueryData(MESSAGES_QUERY_KEY(vars.chatId), (old: unknown) => {
          if (!old) return old;
          const data = old as PaginatedMessages;
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              messages: page.messages.filter((m) => m.id !== context.optimisticMessage.id),
            })),
          };
        });
      }
    },

    // Başarı: cache'i tazele
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY(vars.chatId) });
      queryClient.invalidateQueries({ queryKey: CHAT_HISTORY_QUERY_KEY(vars.userId) });
    },
  });
}
