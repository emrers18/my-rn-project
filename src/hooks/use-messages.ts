import { useInfiniteQuery } from '@tanstack/react-query';

import { supabaseMessageDataSource } from '../infrastructure/datasources/supabase-message-datasource';

export const MESSAGES_QUERY_KEY = (chatId: string) => ['messages', chatId] as const;

export function useMessages(chatId: string | null) {
  return useInfiniteQuery({
    queryKey: MESSAGES_QUERY_KEY(chatId ?? ''),
    queryFn: async ({ pageParam }) => {
      if (!chatId) return { messages: [], nextCursor: null };
      const cursor = (pageParam as string | null) ?? null;
      const result = await supabaseMessageDataSource.getMessages(chatId, cursor);
      if (result.isErr()) throw new Error(result.error.message);
      return result.value;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!chatId,
    staleTime: 30_000,
    select: (data) => ({
      // Tüm sayfaları düzleştir, en yeni mesaj sonda (chat UI için)
      pages: data.pages,
      pageParams: data.pageParams,
      messages: data.pages.flatMap((p) => p.messages).reverse(),
    }),
  });
}
