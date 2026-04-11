import { Result } from 'neverthrow';

import {
  ChatSession,
  ChatSessionInsert,
  ChatSessionUpdate,
} from '../../domain/entities/chat-session';
import { Failure } from '../../domain/failures/failure';
import { IChatRepository } from '../../domain/repositories/i-chat-repository';
import { supabaseChatDataSource } from '../datasources/supabase-chat-datasource';

export class SupabaseChatRepository implements IChatRepository {
  async createChat(data: ChatSessionInsert): Promise<Result<ChatSession, Failure>> {
    return supabaseChatDataSource.create(data);
  }

  async getChatHistory(userId: string): Promise<Result<ChatSession[], Failure>> {
    return supabaseChatDataSource.getHistory(userId);
  }

  async getChatById(chatId: string): Promise<Result<ChatSession, Failure>> {
    return supabaseChatDataSource.getById(chatId);
  }

  async updateChat(chatId: string, data: ChatSessionUpdate): Promise<Result<ChatSession, Failure>> {
    return supabaseChatDataSource.update(chatId, data);
  }

  async deleteChat(chatId: string): Promise<Result<void, Failure>> {
    return supabaseChatDataSource.delete(chatId);
  }
}
