import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Message } from '../domain/entities/message';
import { getDependencies } from '../lib/di';
import { CHAT_HISTORY_QUERY_KEY } from './use-chat-history';
import { MESSAGES_QUERY_KEY } from './use-messages';

interface SendMessageVariables {
  chatId: string;
  userId: string;
  content: string;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { sendMessageUseCase } = getDependencies();

  return useMutation({
    mutationFn: async (vars: SendMessageVariables): Promise<Message> => {
      const result = await sendMessageUseCase.execute(vars);
      if (result.isErr()) throw new Error(result.error.message);
      return result.value;
    },

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
        const data = old as {
          pages: { messages: Message[]; nextCursor: string | null }[];
          pageParams: unknown[];
        };
        return {
          ...data,
          pages: data.pages.map((page, i) =>
            i === 0 ? { ...page, messages: [optimisticMessage, ...page.messages] } : page
          ),
        };
      });

      return { optimisticMessage };
    },

    onError: (_err, vars, context) => {
      queryClient.setQueryData(MESSAGES_QUERY_KEY(vars.chatId), (old: unknown) => {
        if (!old || !context?.optimisticMessage) return old;
        const data = old as {
          pages: { messages: Message[]; nextCursor: string | null }[];
          pageParams: unknown[];
        };
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            messages: page.messages.filter((m) => m.id !== context.optimisticMessage.id),
          })),
        };
      });
    },

    onSuccess: (_data, vars) => {
      // Gerçek veriyi yenile
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY(vars.chatId) });
      queryClient.invalidateQueries({ queryKey: CHAT_HISTORY_QUERY_KEY(vars.userId) });
    },
  });
}
