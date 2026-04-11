import { useQuery } from '@tanstack/react-query';

import { getDependencies } from '../lib/di';

export const CHAT_HISTORY_QUERY_KEY = (userId: string) => ['chats', userId] as const;

export function useChatHistory(userId: string | null) {
  const { getChatHistoryUseCase } = getDependencies();

  return useQuery({
    queryKey: CHAT_HISTORY_QUERY_KEY(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [];
      const result = await getChatHistoryUseCase.execute(userId);
      if (result.isErr()) throw new Error(result.error.message);
      return result.value;
    },
    enabled: !!userId,
    staleTime: 60_000, // 1 dakika
  });
}
