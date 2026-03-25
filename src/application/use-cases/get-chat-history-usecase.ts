import { ok, Result } from 'neverthrow';

import { ChatSession } from '../../domain/entities/chat-session';
import { Failure } from '../../domain/failures/failure';
import { IChatRepository } from '../../domain/repositories/i-chat-repository';

export class GetChatHistoryUseCase {
  constructor(private readonly chatRepository: IChatRepository) {}

  async execute(userId: string): Promise<Result<ChatSession[], Failure>> {
    if (!userId) {
      return ok([]);
    }
    return this.chatRepository.getChatHistory(userId);
  }
}

export function createMockGetChatHistoryUseCase(): GetChatHistoryUseCase {
  const mockRepo: IChatRepository = {
    createChat: async () =>
      ok({
        id: crypto.randomUUID(),
        userId: 'mock-user',
        title: 'Mock Sohbet',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    getChatHistory: async (): Promise<Result<ChatSession[], Failure>> =>
      ok([
        {
          id: crypto.randomUUID(),
          userId: 'mock-user',
          title: 'Roma Seyahati',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: crypto.randomUUID(),
          userId: 'mock-user',
          title: 'Paris Rotası',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]),
    getChatById: async (chatId: string): Promise<Result<ChatSession, Failure>> =>
      ok({
        id: chatId,
        userId: 'mock-user',
        title: 'Mock Sohbet',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    updateChat: async (chatId: string, data): Promise<Result<ChatSession, Failure>> =>
      ok({
        id: chatId,
        userId: 'mock-user',
        title: data.title ?? 'Mock Sohbet',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    deleteChat: async (): Promise<Result<void, Failure>> => ok(undefined),
  };
  return new GetChatHistoryUseCase(mockRepo);
}
